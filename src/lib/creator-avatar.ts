// [Claude 2026-06-25] Server-side creator avatar resolution + cache.
//
// Why this exists: unavatar.io moved Instagram behind a paid plan (free requests now
// return {"code":"EPRO"}), and Instagram's own CDN URLs carry a short-lived signature
// that expires after a few days. So we can't just store a URL. Instead we resolve the
// real profile picture server-side, download the *bytes*, and cache them in Postgres
// (CreatorAvatar), keyed by platform+handle and shared across leads. Bytes are served
// by /api/avatar/[platform]/[handle]. The resolver self-heals: a cache miss resolves
// and stores on demand, so avatars survive even if an import never pre-warmed them.
//
// Sources, in order of what actually works (verified 2026-06-25):
//   Instagram → instagram.com web_profile_info JSON API (needs the public x-ig-app-id)
//   TikTok / YouTube → unavatar.io (still free for these providers)
import { AvatarStatus, Platform } from "@prisma/client";
import { prisma } from "@/lib/db";

// Public Instagram web app id — the same constant the instagram.com web client sends.
const IG_APP_ID = "936619743392459";
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const DAY_MS = 24 * 60 * 60 * 1000;
const OK_REFRESH_DAYS = 30; // re-fetch a stored avatar only after it's this old
const NOT_FOUND_RETRY_DAYS = 3; // don't re-hammer a handle that didn't resolve
const FETCH_TIMEOUT_MS = 6000;
const MAX_BYTES = 3 * 1024 * 1024;

const SUPPORTED: Record<string, Extract<Platform, "INSTAGRAM" | "TIKTOK" | "YOUTUBE">> = {
  INSTAGRAM: "INSTAGRAM",
  TIKTOK: "TIKTOK",
  YOUTUBE: "YOUTUBE",
};

type SupportedPlatform = (typeof SUPPORTED)[keyof typeof SUPPORTED];
type AvatarBytes = { contentType: string; data: Buffer };
type ResolvedAvatar = AvatarBytes & { sourceUrl: string };

export function normalizePlatform(value: string | null | undefined): SupportedPlatform | null {
  if (!value) return null;
  return SUPPORTED[value.trim().toUpperCase()] ?? null;
}

export function normalizeHandle(value: string | null | undefined): string | null {
  const handle = value?.trim().replace(/^@/, "").toLowerCase();
  return handle ? handle : null;
}

export function avatarKey(platform: SupportedPlatform, handle: string): string {
  return `${platform.toLowerCase()}:${handle}`;
}

// ---- public API ----

// Serve path: return cached bytes, resolving + storing on a miss or when stale.
export async function getCachedAvatarBytes(
  platformInput: string,
  handleInput: string
): Promise<AvatarBytes | null> {
  if (!process.env.DATABASE_URL) return null;
  const platform = normalizePlatform(platformInput);
  const handle = normalizeHandle(handleInput);
  if (!platform || !handle) return null;

  const key = avatarKey(platform, handle);
  const existing = await prisma.creatorAvatar.findUnique({ where: { key } }).catch(() => null);
  const now = Date.now();

  if (existing?.status === AvatarStatus.OK && existing.data) {
    const stored: AvatarBytes = { contentType: existing.contentType ?? "image/jpeg", data: existing.data };
    if (now - existing.fetchedAt.getTime() < OK_REFRESH_DAYS * DAY_MS) return stored;
    // Stale but usable: try a refresh, but never drop the picture if the refresh fails.
    return (await resolveAndStore(platform, handle, key)) ?? stored;
  }

  if (existing?.status === AvatarStatus.NOT_FOUND) {
    if (now - existing.fetchedAt.getTime() < NOT_FOUND_RETRY_DAYS * DAY_MS) return null;
    return resolveAndStore(platform, handle, key);
  }

  return resolveAndStore(platform, handle, key);
}

// Ingestion path: store an avatar now, skipping handles already fresh in the cache.
export async function cacheAvatar(platformInput: string, handleInput: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  const platform = normalizePlatform(platformInput);
  const handle = normalizeHandle(handleInput);
  if (!platform || !handle) return;

  const key = avatarKey(platform, handle);
  const existing = await prisma.creatorAvatar
    .findUnique({ where: { key }, select: { status: true, fetchedAt: true } })
    .catch(() => null);
  if (existing) {
    const age = Date.now() - existing.fetchedAt.getTime();
    if (existing.status === AvatarStatus.OK && age < OK_REFRESH_DAYS * DAY_MS) return;
    if (existing.status === AvatarStatus.NOT_FOUND && age < NOT_FOUND_RETRY_DAYS * DAY_MS) return;
  }
  await resolveAndStore(platform, handle, key);
}

// Pre-warm a batch at import time. Bounded by an overall wall-clock budget so it can
// never stall (or time out) the request — whatever isn't warmed in time fills in
// lazily on first view via getCachedAvatarBytes. Always best-effort; never throws.
export async function prewarmAvatars(
  pairs: Array<{ platform: string | null | undefined; handle: string | null | undefined }>,
  opts: { maxItems?: number; concurrency?: number; budgetMs?: number } = {}
): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  const { maxItems = 60, concurrency = 8, budgetMs = 4000 } = opts;

  const seen = new Set<string>();
  const work: Array<{ platform: SupportedPlatform; handle: string }> = [];
  for (const pair of pairs) {
    const platform = normalizePlatform(pair.platform);
    const handle = normalizeHandle(pair.handle);
    if (!platform || !handle) continue;
    const key = avatarKey(platform, handle);
    if (seen.has(key)) continue;
    seen.add(key);
    work.push({ platform, handle });
    if (work.length >= maxItems) break;
  }
  if (!work.length) return;

  const deadline = Date.now() + budgetMs;
  let cursor = 0;
  const worker = async () => {
    while (cursor < work.length && Date.now() < deadline) {
      const item = work[cursor++];
      await cacheAvatar(item.platform, item.handle).catch(() => {});
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, work.length) }, worker)).catch(() => {});
}

// ---- internals ----

async function resolveAndStore(
  platform: SupportedPlatform,
  handle: string,
  key: string
): Promise<AvatarBytes | null> {
  const resolved = await resolveAvatar(platform, handle).catch(() => null);

  if (!resolved) {
    await prisma.creatorAvatar
      .upsert({
        where: { key },
        create: { key, platform, handle, status: AvatarStatus.NOT_FOUND },
        update: { status: AvatarStatus.NOT_FOUND, contentType: null, data: null, sourceUrl: null, fetchedAt: new Date() },
      })
      .catch(() => {});
    return null;
  }

  await prisma.creatorAvatar
    .upsert({
      where: { key },
      create: {
        key,
        platform,
        handle,
        status: AvatarStatus.OK,
        contentType: resolved.contentType,
        data: resolved.data,
        sourceUrl: resolved.sourceUrl,
      },
      update: {
        status: AvatarStatus.OK,
        contentType: resolved.contentType,
        data: resolved.data,
        sourceUrl: resolved.sourceUrl,
        fetchedAt: new Date(),
      },
    })
    .catch(() => {});
  return { contentType: resolved.contentType, data: resolved.data };
}

async function resolveAvatar(platform: SupportedPlatform, handle: string): Promise<ResolvedAvatar | null> {
  if (platform === "INSTAGRAM") return resolveInstagram(handle);
  return resolveViaUnavatar(platform === "TIKTOK" ? "tiktok" : "youtube", handle);
}

async function resolveInstagram(handle: string): Promise<ResolvedAvatar | null> {
  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`;
  const res = await fetchWithTimeout(url, {
    headers: {
      "User-Agent": BROWSER_UA,
      "x-ig-app-id": IG_APP_ID,
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      // Required: without a same-origin Referer the API returns 400 to non-browser
      // clients (verified 2026-06-25 — Referer alone flips 400 → 200).
      Referer: `https://www.instagram.com/${encodeURIComponent(handle)}/`,
    },
  });
  if (!res?.ok) return null;
  const json = (await res.json().catch(() => null)) as { data?: { user?: { profile_pic_url_hd?: string; profile_pic_url?: string } } } | null;
  const user = json?.data?.user;
  const picUrl = user?.profile_pic_url_hd || user?.profile_pic_url;
  if (!picUrl) return null;
  return downloadImage(picUrl);
}

async function resolveViaUnavatar(provider: "tiktok" | "youtube", handle: string): Promise<ResolvedAvatar | null> {
  // fallback=false → unavatar 404s instead of returning a generic placeholder image,
  // so a miss stays a miss (and we render initials) rather than a grey silhouette.
  const url = `https://unavatar.io/${provider}/${encodeURIComponent(handle)}?fallback=false`;
  return downloadImage(url);
}

async function downloadImage(url: string): Promise<ResolvedAvatar | null> {
  const res = await fetchWithTimeout(url, { headers: { "User-Agent": BROWSER_UA } });
  if (!res?.ok) return null;
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim();
  if (!contentType.startsWith("image/")) return null;
  const data = Buffer.from(await res.arrayBuffer());
  if (!data.length || data.length > MAX_BYTES) return null;
  return { contentType, data, sourceUrl: url };
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: "follow" });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
