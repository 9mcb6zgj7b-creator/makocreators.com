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
  url: z.string().url(),
  notes: z.string().max(4000).optional(),
});

export const creatorLeadLinksSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(100).optional(),
  url: z.string().url().optional(),
  notes: z.string().max(4000).optional(),
}).refine(value => value.url || value.urls?.length, {
  message: "请至少提供一个达人主页或视频链接",
});

export type CreatorLeadInput = {
  profileUrl: string;
  source: "LINK" | "EXCEL" | "MANUAL";
  platform?: Platform;
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
  platform: ["platform", "平台"],
  displayName: ["name", "display name", "creator name", "达人名字", "达人名称", "名字", "名称"],
  handle: ["handle", "username", "account", "账号", "用户名"],
  city: ["city", "location", "城市", "地区", "位置"],
  categories: ["category", "categories", "tags", "类型", "分类", "标签"],
  followers: ["followers", "follower count", "粉丝", "粉丝数"],
  avgViews: ["avg views", "average views", "views", "平均播放", "平均播放量", "播放量"],
  contactEmail: ["email", "contact email", "邮箱", "联系邮箱"],
  contactPhone: ["phone", "contact phone", "手机号", "电话", "联系电话"],
  contactNotes: ["contact", "contact notes", "联系方式", "联系备注", "联系人"],
  priceMin: ["price min", "min price", "最低报价", "报价下限"],
  priceMax: ["price max", "max price", "最高报价", "报价上限", "报价"],
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
  const profileUrl = cleanText(mapped.profileUrl);
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
    contactEmail: cleanText(mapped.contactEmail),
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
    const key = input.profileUrl.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
