import { Platform, Prisma } from "@prisma/client";
import { z } from "zod";

export const creatorLeadStatusSchema = z.enum([
  "PENDING_ANALYSIS",
  "ANALYZED",
  "NEEDS_REVIEW",
  "APPROVED",
  "ARCHIVED",
  "FAILED",
]);

export const creatorLeadLinkSchema = z.object({
  url: z.string().min(1),
  notes: z.string().max(4000).optional(),
});

export const creatorLeadLinksSchema = z.object({
  urls: z.array(z.string().min(1)).min(1).max(100).optional(),
  url: z.string().min(1).optional(),
  emails: z.array(z.string().email()).min(1).max(200).optional(),
  email: z.string().email().optional(),
  notes: z.string().max(4000).optional(),
}).refine(value => value.url || value.urls?.length || value.email || value.emails?.length, {
  message: "Please provide at least one creator email or profile link.",
});

export type CreatorLeadInput = {
  profileUrl: string;
  profileUrls?: string[];
  source: "LINK" | "EXCEL" | "MANUAL";
  platform?: Platform;
  platforms?: Platform[];
  displayName?: string | null;
  handle?: string | null;
  city?: string | null;
  categories?: string[];
  followers?: number | null;
  avgViews?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactNotes?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  notes?: string | null;
  rawInput?: Prisma.InputJsonValue;
};

const COLUMN_ALIASES = {
  profileUrl: ["profile url", "url", "link", "主页链接", "达人链接", "链接", "账号链接", "视频链接"],
  platform: ["platform", "type", "平台"],
  displayName: ["name", "display name", "creator name", "influencer id", "influencers' id", "influencers id", "creator", "creator id", "达人名字", "达人名称", "名字", "名称"],
  handle: ["handle", "username", "account", "账号", "用户名"],
  city: ["city", "location", "城市", "地区", "位置"],
  categories: ["category", "categories", "tags", "类型", "分类", "标签"],
  followers: ["followers", "follower count", "follower number", "粉丝", "粉丝数"],
  avgViews: ["avg views", "avg. views", "average views", "views", "平均播放", "平均播放量", "播放量"],
  contactEmail: ["email", "contact email", "邮箱", "联系邮箱"],
  contactPhone: ["phone", "contact phone", "手机号", "电话", "联系电话"],
  contactNotes: ["contact", "contact notes", "联系方式", "联系备注", "联系人"],
  priceMin: ["price min", "min price", "最低报价", "报价下限"],
  priceMax: ["price max", "max price", "price", "最高报价", "报价上限", "报价"],
  notes: ["notes", "remark", "remarks", "备注"],
} as const;

type LeadField = keyof typeof COLUMN_ALIASES;

export function normalizeCreatorLeadInput(input: CreatorLeadInput): CreatorLeadInput {
  const profileUrl = normalizeUrl(input.profileUrl);
  const platform = input.platform ?? detectPlatform(profileUrl);
  return {
    ...input,
    profileUrl,
    platform,
    handle: cleanText(input.handle) ?? extractHandle(profileUrl, platform),
    displayName: cleanText(input.displayName),
    city: cleanText(input.city),
    categories: input.categories?.map(item => item.trim()).filter(Boolean) ?? [],
    followers: normalizeNumber(input.followers),
    avgViews: normalizeNumber(input.avgViews),
    contactEmail: cleanText(input.contactEmail),
    contactPhone: cleanText(input.contactPhone),
    contactNotes: cleanText(input.contactNotes),
    priceMin: normalizeNumber(input.priceMin),
    priceMax: normalizeNumber(input.priceMax),
    notes: cleanText(input.notes),
  };
}

export function detectPlatform(url: string): Platform {
  const value = url.toLowerCase();
  if (value.includes("instagram.com")) return "INSTAGRAM";
  if (value.includes("tiktok.com")) return "TIKTOK";
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "YOUTUBE";
  if (value.includes("xiaohongshu.com") || value.includes("xhslink.com")) return "XIAOHONGSHU";
  return "OTHER";
}

export function excelRowToCreatorLead(row: Record<string, unknown>): CreatorLeadInput | null {
  const mapped = mapRow(row);
  const contactEmail = normalizeEmail(cleanText(mapped.contactEmail));
  const profileUrl = cleanText(mapped.profileUrl) || (contactEmail ? `mailto:${contactEmail}` : null);
  if (!profileUrl || !isProbablyUrl(profileUrl)) return null;

  const platform = parsePlatform(cleanText(mapped.platform)) ?? detectPlatform(profileUrl);
  return normalizeCreatorLeadInput({
    profileUrl,
    source: "EXCEL",
    platform,
    displayName: cleanText(mapped.displayName),
    handle: cleanText(mapped.handle),
    city: cleanText(mapped.city),
    categories: splitList(cleanText(mapped.categories)),
    followers: parseNumber(mapped.followers),
    avgViews: parseNumber(mapped.avgViews),
    contactEmail,
    contactPhone: cleanText(mapped.contactPhone),
    contactNotes: cleanText(mapped.contactNotes),
    priceMin: parseNumber(mapped.priceMin),
    priceMax: parseNumber(mapped.priceMax),
    notes: cleanText(mapped.notes),
    rawInput: JSON.parse(JSON.stringify(row)) as Prisma.InputJsonValue,
  });
}

export function dedupeCreatorLeadInputs(inputs: CreatorLeadInput[]) {
  const seen = new Set<string>();
  return inputs.filter(input => {
    const keys = getCreatorLeadDedupeKeys(input);
    if (keys.some(key => seen.has(key))) return false;
    keys.forEach(key => seen.add(key));
    return true;
  });
}

export function mergeCreatorLeadInputs(inputs: CreatorLeadInput[]) {
  const parents = inputs.map((_, index) => index);
  const firstInputIndexByKey = new Map<string, number>();

  inputs.forEach((input, inputIndex) => {
    for (const key of getCreatorLeadDedupeKeys(input)) {
      const firstInputIndex = firstInputIndexByKey.get(key);
      if (typeof firstInputIndex === "number") {
        union(parents, inputIndex, firstInputIndex);
      } else {
        firstInputIndexByKey.set(key, inputIndex);
      }
    }
  });

  const groups = new Map<number, CreatorLeadInput[]>();
  inputs.forEach((input, inputIndex) => {
    const root = findRoot(parents, inputIndex);
    const group = groups.get(root) ?? [];
    group.push(input);
    groups.set(root, group);
  });

  return Array.from(groups.values()).map(mergeCreatorLeadGroup);
}

function findRoot(parents: number[], index: number): number {
  if (parents[index] !== index) {
    parents[index] = findRoot(parents, parents[index]);
  }
  return parents[index];
}

function union(parents: number[], left: number, right: number) {
  const leftRoot = findRoot(parents, left);
  const rightRoot = findRoot(parents, right);
  if (leftRoot !== rightRoot) parents[rightRoot] = leftRoot;
}

export function getCreatorLeadDedupeKeys(input: Pick<CreatorLeadInput, "profileUrl" | "contactEmail" | "displayName" | "handle">) {
  return [
    input.contactEmail ? `email:${normalizeDedupeText(input.contactEmail)}` : null,
    input.displayName ? `name:${normalizeDedupeText(input.displayName)}` : null,
    input.handle ? `handle:${normalizeHandleForDedupe(input.handle)}` : null,
    input.profileUrl ? `url:${normalizeDedupeText(input.profileUrl)}` : null,
  ].filter((key): key is string => Boolean(key));
}

function mergeCreatorLeadGroup(group: CreatorLeadInput[]) {
  const first = group[0];
  const profileUrls = unique(group.flatMap(input => [input.profileUrl, ...(input.profileUrls ?? [])]).filter(Boolean));
  const platforms = unique(group.flatMap(input => [input.platform, ...(input.platforms ?? [])]).filter(Boolean));
  const categories = unique(group.flatMap(input => input.categories ?? []));
  const rawRows = group.map(input => input.rawInput ?? {}).filter(Boolean);

  return normalizeCreatorLeadInput({
    ...first,
    profileUrl: profileUrls.find(url => !url.startsWith("mailto:")) ?? first.profileUrl,
    profileUrls,
    platform: platforms[0] ?? first.platform,
    platforms,
    displayName: group.find(input => input.displayName)?.displayName ?? first.displayName,
    handle: group.find(input => input.handle)?.handle ?? first.handle,
    city: group.find(input => input.city)?.city ?? first.city,
    categories,
    followers: maxNumber(group.map(input => input.followers)),
    avgViews: maxNumber(group.map(input => input.avgViews)),
    contactEmail: group.find(input => input.contactEmail)?.contactEmail ?? first.contactEmail,
    contactPhone: group.find(input => input.contactPhone)?.contactPhone ?? first.contactPhone,
    contactNotes: group.find(input => input.contactNotes)?.contactNotes ?? first.contactNotes,
    priceMin: minNumber(group.map(input => input.priceMin)),
    priceMax: maxNumber(group.map(input => input.priceMax)),
    notes: group.find(input => input.notes)?.notes ?? first.notes,
    rawInput: {
      source: "merged-creator-import",
      profileUrls,
      platforms,
      rows: rawRows,
    } as Prisma.InputJsonValue,
  });
}

function unique<T>(values: Array<T | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is T => value !== null && value !== undefined && value !== "")));
}

function maxNumber(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
}

function minNumber(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.min(...numbers) : null;
}

function normalizeDedupeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeHandleForDedupe(value: string) {
  return normalizeDedupeText(value).replace(/^@/, "");
}

function mapRow(row: Record<string, unknown>) {
  const normalized = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) {
    normalized.set(normalizeHeader(key), value);
  }

  const output: Partial<Record<LeadField, unknown>> = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [LeadField, readonly string[]][]) {
    for (const alias of aliases) {
      const value = normalized.get(normalizeHeader(alias));
      if (value !== undefined && cleanText(value) !== null) {
        output[field] = value;
        break;
      }
    }
  }
  return output;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isProbablyUrl(value: string) {
  try {
    new URL(normalizeUrl(value));
    return true;
  } catch {
    return false;
  }
}

export function normalizeEmail(value: string | null) {
  const email = value?.trim().toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function cleanText(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function splitList(value: string | null) {
  if (!value) return [];
  return value
    .split(/[,\n，、|/]+/)
    .map(item => item.trim())
    .filter(Boolean);
}

function parseNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const text = String(value).replace(/[$,\s]/g, "").toLowerCase();
  const multiplier = text.endsWith("k") ? 1_000 : text.endsWith("m") ? 1_000_000 : 1;
  const numeric = Number.parseFloat(text.replace(/[km]$/, ""));
  return Number.isFinite(numeric) ? Math.round(numeric * multiplier) : null;
}

function normalizeNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value);
}

function parsePlatform(value: string | null): Platform | null {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (["instagram", "ig", "ins", "小红书"].includes(normalized)) {
    return normalized === "小红书" ? "XIAOHONGSHU" : "INSTAGRAM";
  }
  if (["tiktok", "tik tok", "抖音"].includes(normalized)) return "TIKTOK";
  if (["youtube", "yt"].includes(normalized)) return "YOUTUBE";
  if (["xiaohongshu", "xhs", "red"].includes(normalized)) return "XIAOHONGSHU";
  return "OTHER";
}

function extractHandle(url: string, platform: Platform) {
  try {
    const parsed = new URL(normalizeUrl(url));
    const segments = parsed.pathname.split("/").filter(Boolean);
    if (!segments.length) return null;
    if (platform === "TIKTOK") return segments.find(segment => segment.startsWith("@"))?.slice(1) ?? null;
    if (platform === "YOUTUBE" && segments[0]?.startsWith("@")) return segments[0].slice(1);
    if (["INSTAGRAM", "XIAOHONGSHU"].includes(platform)) return segments[0]?.replace(/^@/, "") ?? null;
    return segments[0]?.replace(/^@/, "") ?? null;
  } catch {
    return null;
  }
}
