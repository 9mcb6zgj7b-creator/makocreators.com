// [Claude 2026-06-10] Feature 3 — daily "who to contact today" picks.
// Scans the workspace's creators, applies the article's "dare to say no" exclusions,
// scores the eligible ones (quality + warmth + freshness + light campaign keyword match),
// and returns a short ranked list, each with a one-line why_now and a recommended play.
// Batched: two bulk queries + in-memory grouping (no per-creator query loop).
import { prisma } from "@/lib/db";
import { OPEN_STATES, computeWarmth, type CreatorWarmth } from "@/lib/creator-memory";

const MAX_PICKS = 12;
const RECONTACT_COOLDOWN_DAYS = 7; // never re-touch sooner than this (anti "stalker")
const NEW_IMPORT_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

export type OutreachPlay = "seeding" | "ai_collab" | "visit";

export type OutreachPick = {
  leadId: string;
  name: string;
  email: string | null;
  platform: string | null;
  score: number;
  warmth: CreatorWarmth;
  whyNow: string;
  play: OutreachPlay;
  playLabel: string;
  fitCampaign: string | null;
};

export type OutreachPicksResult = {
  picks: OutreachPick[];
  needsContactInfo: number; // good creators we can't email yet
  excludedCount: number; // do-not-contact / in-flight / too-soon / snoozed
  generatedAt: string;
};

const PLAY_LABEL: Record<OutreachPlay, string> = {
  seeding: "Product seeding",
  ai_collab: "AI content collab",
  visit: "In-person visit",
};

type LeadRow = {
  id: string;
  directoryEntryId: string | null;
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  platform: string;
  city: string | null;
  categories: string[];
  followers: number | null;
  avgViews: number | null;
  status: string;
  createdAt: Date;
  metadata: unknown;
};

type ThreadRow = {
  creatorLeadId: string | null;
  creatorEmail: string | null;
  state: string;
  lastMessageAt: Date | null;
  metadata: unknown;
};

export async function getOutreachPicks(workspaceId: string): Promise<OutreachPicksResult> {
  const now = new Date();
  const generatedAt = now.toISOString();

  if (!process.env.DATABASE_URL) {
    return { picks: [], needsContactInfo: 0, excludedCount: 0, generatedAt };
  }

  const [leads, threads, campaignKeywords] = await Promise.all([
    prisma.creatorLead.findMany({
      where: { workspaceId },
      select: {
        id: true,
        directoryEntryId: true,
        contactEmail: true,
        displayName: true,
        handle: true,
        platform: true,
        city: true,
        categories: true,
        followers: true,
        avgViews: true,
        status: true,
        createdAt: true,
        metadata: true,
      },
    }),
    prisma.conversationThread.findMany({
      where: { workspaceId },
      select: { creatorLeadId: true, creatorEmail: true, state: true, lastMessageAt: true, metadata: true },
    }),
    getActiveCampaignKeywords(workspaceId),
  ]);

  const groups = groupCreators(leads);
  const threadsByGroup = bucketThreads(threads, groups);

  let needsContactInfo = 0;
  let excludedCount = 0;
  const picks: OutreachPick[] = [];

  for (const group of groups) {
    const groupThreads = threadsByGroup.get(group.key) ?? [];
    const decision = evaluateGroup(group, groupThreads, campaignKeywords, now);

    if (decision.kind === "excluded") {
      excludedCount += 1;
      continue;
    }
    if (decision.kind === "needs_contact") {
      needsContactInfo += 1;
      continue;
    }
    picks.push(decision.pick);
  }

  picks.sort((left, right) => right.score - left.score);

  return {
    picks: picks.slice(0, MAX_PICKS),
    needsContactInfo,
    excludedCount,
    generatedAt,
  };
}

// ---- grouping (light dedupe: directory entry → email → lead) ----

type CreatorGroup = {
  key: string;
  leads: LeadRow[];
  leadIds: string[];
  emails: string[];
};

function groupCreators(leads: LeadRow[]): CreatorGroup[] {
  const byKey = new Map<string, CreatorGroup>();
  for (const lead of leads) {
    const email = normalizeEmail(lead.contactEmail);
    const key = lead.directoryEntryId
      ? `dir:${lead.directoryEntryId}`
      : email
        ? `email:${email}`
        : `lead:${lead.id}`;
    const group = byKey.get(key) ?? { key, leads: [], leadIds: [], emails: [] };
    group.leads.push(lead);
    group.leadIds.push(lead.id);
    if (email && !group.emails.includes(email)) group.emails.push(email);
    byKey.set(key, group);
  }
  return Array.from(byKey.values());
}

function bucketThreads(threads: ThreadRow[], groups: CreatorGroup[]) {
  const leadIdToKey = new Map<string, string>();
  const emailToKey = new Map<string, string>();
  for (const group of groups) {
    for (const id of group.leadIds) leadIdToKey.set(id, group.key);
    for (const email of group.emails) emailToKey.set(email, group.key);
  }

  const byGroup = new Map<string, ThreadRow[]>();
  for (const thread of threads) {
    const key =
      (thread.creatorLeadId ? leadIdToKey.get(thread.creatorLeadId) : undefined) ??
      (thread.creatorEmail ? emailToKey.get(normalizeEmail(thread.creatorEmail) ?? "") : undefined);
    if (!key) continue;
    byGroup.set(key, [...(byGroup.get(key) ?? []), thread]);
  }
  return byGroup;
}

// ---- per-creator decision ----

type GroupDecision =
  | { kind: "excluded" }
  | { kind: "needs_contact" }
  | { kind: "pick"; pick: OutreachPick };

function evaluateGroup(group: CreatorGroup, threads: ThreadRow[], campaignKeywords: CampaignKeywords, now: Date): GroupDecision {
  // Snooze (the human skipped this creator recently).
  if (group.leads.some(lead => isSnoozed(lead.metadata, now))) {
    return { kind: "excluded" };
  }

  const unsubscribed = threads.some(thread => thread.state === "CLOSED" && asRecord(thread.metadata).unsubscribe === true);
  const declined = threads.some(thread => thread.state === "REJECTED");
  const warmth = computeWarmth({
    states: threads.map(thread => thread.state),
    unsubscribed,
    declined,
    hasInbound: false,
  });

  // Hard "no": do-not-contact creators never surface.
  if (warmth === "unsubscribed" || warmth === "declined") return { kind: "excluded" };

  // Already in flight — handled by the outreach pipeline, don't double-contact.
  if (threads.some(thread => OPEN_STATES.has(thread.state))) return { kind: "excluded" };

  // Too soon since last contact (anti "stalker" rule from the article).
  const lastContactedAt = maxDate(threads.map(thread => thread.lastMessageAt));
  if (lastContactedAt && now.getTime() - lastContactedAt.getTime() < RECONTACT_COOLDOWN_DAYS * DAY_MS) {
    return { kind: "excluded" };
  }

  // Can't email them yet → goes to "needs contact info", not today's send list.
  const email = group.emails[0] ?? null;
  if (!email) return { kind: "needs_contact" };

  const fit = scoreFit(group, campaignKeywords);
  const score = clamp(qualityScore(group, email) + warmthBonus(warmth) + fit.bonus, 0, 99);

  // Approve targets this leadId, and the outreach starter only picks leads that have an
  // email — so anchor on the email-bearing lead in the group, not just the directory one.
  const emailLead = group.leads.find(lead => normalizeEmail(lead.contactEmail)) ?? pickRepresentative(group);

  return {
    kind: "pick",
    pick: {
      leadId: emailLead.id,
      name: groupName(group),
      email,
      platform: group.leads.map(lead => lead.platform).find(Boolean) ?? null,
      score,
      warmth,
      whyNow: buildWhyNow(group, warmth, lastContactedAt, fit, score, now),
      play: recommendPlay(group),
      playLabel: PLAY_LABEL[recommendPlay(group)],
      fitCampaign: fit.campaign,
    },
  };
}

function qualityScore(group: CreatorGroup, email: string | null) {
  let score = 58;
  if (group.leads.some(lead => (lead.categories ?? []).length)) score += 10;
  if (maxNumber(group.leads.map(lead => lead.followers)) >= 10_000) score += 10;
  if (maxNumber(group.leads.map(lead => lead.avgViews)) >= 2_500) score += 8;
  if (email) score += 6;
  return score;
}

function warmthBonus(warmth: CreatorWarmth) {
  if (warmth === "cold") return 8; // never contacted + eligible = best first-touch candidate
  if (warmth === "contacted") return 2; // no reply, past cooldown = worth a measured re-touch
  return 0;
}

function buildWhyNow(group: CreatorGroup, warmth: CreatorWarmth, lastContactedAt: Date | null, fit: FitResult, score: number, now: Date): string {
  const fitClause = fit.campaign ? `matches ${fit.campaign}` : `quality score ${score}`;

  if (warmth === "contacted" && lastContactedAt) {
    const days = Math.round((now.getTime() - lastContactedAt.getTime()) / DAY_MS);
    return `No reply in ${days}d — worth a measured re-touch · ${fitClause}`;
  }

  const newest = maxDate(group.leads.map(lead => lead.createdAt));
  if (newest && now.getTime() - newest.getTime() < NEW_IMPORT_DAYS * DAY_MS) {
    return `New import · never contacted · ${fitClause}`;
  }
  return `Never contacted · ${fitClause}`;
}

function recommendPlay(group: CreatorGroup): OutreachPlay {
  const categories = group.leads.flatMap(lead => lead.categories ?? []).map(value => value.toLowerCase());
  const hasCity = group.leads.some(lead => Boolean(lead.city));
  const isLocalDining = categories.some(category => /food|restaurant|cafe|dining|eat|local/.test(category));
  if (isLocalDining && hasCity) return "visit";
  const isContentLed = categories.some(category => /edu|tutorial|review|tech|finance|commentary|how/.test(category));
  if (isContentLed) return "ai_collab";
  return "seeding";
}

// ---- campaign keyword fit (light, honest) ----

type CampaignKeywords = { keywords: Set<string>; campaignName: string | null };
type FitResult = { bonus: number; campaign: string | null };

async function getActiveCampaignKeywords(workspaceId: string): Promise<CampaignKeywords> {
  const [campaigns, personas] = await Promise.all([
    prisma.campaign.findMany({
      where: { workspaceId, status: { in: ["DRAFT", "ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { name: true, objective: true },
    }),
    prisma.creatorPersona.findMany({
      where: { workspaceId, status: { in: ["DRAFT", "GENERATED"] } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true, business: true },
    }),
  ]);

  const keywords = new Set<string>();
  for (const text of [
    ...campaigns.flatMap(campaign => [campaign.name, campaign.objective ?? ""]),
    ...personas.flatMap(persona => [persona.title, persona.business]),
  ]) {
    for (const token of tokenize(text)) keywords.add(token);
  }

  const campaignName = campaigns[0]?.name ?? personas[0]?.title ?? null;
  return { keywords, campaignName };
}

function scoreFit(group: CreatorGroup, campaignKeywords: CampaignKeywords): FitResult {
  if (!campaignKeywords.keywords.size) return { bonus: 0, campaign: null };
  const creatorTokens = new Set<string>();
  for (const lead of group.leads) {
    for (const category of lead.categories ?? []) for (const token of tokenize(category)) creatorTokens.add(token);
    for (const token of tokenize(lead.city ?? "")) creatorTokens.add(token);
  }
  const overlap = [...creatorTokens].some(token => campaignKeywords.keywords.has(token));
  return overlap ? { bonus: 12, campaign: campaignKeywords.campaignName } : { bonus: 0, campaign: null };
}

const STOPWORDS = new Set(["the", "and", "for", "with", "your", "you", "our", "are", "this", "that", "creator", "campaign", "influencer", "los", "angeles"]);

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9一-鿿]+/)
    .filter(token => token.length >= 3 && !STOPWORDS.has(token));
}

// ---- snooze (skip memory) stored on CreatorLead.metadata, no migration ----

export const SNOOZE_METADATA_KEY = "outreachSnoozedUntil";

function isSnoozed(metadata: unknown, now: Date) {
  const value = asRecord(metadata)[SNOOZE_METADATA_KEY];
  if (typeof value !== "string") return false;
  const until = new Date(value);
  return !Number.isNaN(until.getTime()) && until.getTime() > now.getTime();
}

// ---- helpers ----

function pickRepresentative(group: CreatorGroup) {
  return group.leads.find(lead => lead.directoryEntryId) ?? group.leads[0];
}

function groupName(group: CreatorGroup) {
  return (
    group.leads.map(lead => lead.displayName).find(Boolean) ||
    group.leads.map(lead => lead.handle).find(Boolean) ||
    group.emails[0]?.split("@")[0] ||
    "Unknown creator"
  );
}

function maxNumber(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : 0;
}

function maxDate(values: Array<Date | null | undefined>) {
  const dates = values.filter((value): value is Date => value instanceof Date);
  return dates.length ? dates.reduce((latest, date) => (date > latest ? date : latest)) : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
