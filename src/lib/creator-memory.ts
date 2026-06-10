// [Claude 2026-06-10] Feature 1 — Creator memory dossier (derive-on-read).
// Aggregates everything this workspace knows about one (deduped) creator: identity,
// reach, a 6-level "warmth" derived from interaction history, and a timeline of what
// was sent / what they replied. No new tables — assembled live from CreatorLead,
// ConversationThread and ConversationMessage. This is the read-model that the daily
// "who to contact" list (feature 3) and trigger-anchored copy (feature 4) build on.
import { prisma } from "@/lib/db";

export type CreatorWarmth =
  | "cold"
  | "contacted"
  | "engaged"
  | "declined"
  | "unsubscribed"
  | "collaborated";

export type CreatorMemoryEvent = {
  date: string; // ISO
  kind: "outbound" | "inbound" | "status";
  channel?: string | null;
  intent?: string | null;
  summary: string;
};

export type CreatorMemory = {
  leadId: string;
  name: string;
  handle: string | null;
  email: string | null;
  platforms: string[];
  profileUrls: string[];
  categories: string[];
  city: string | null;
  followers: number | null;
  avgViews: number | null;
  priceMin: number | null;
  priceMax: number | null;
  warmth: CreatorWarmth;
  warmthLabel: string;
  flags: {
    unsubscribed: boolean;
    declined: boolean;
    hasOpenThread: boolean;
    noResponse: boolean;
  };
  lastContactedAt: string | null;
  contactCount: number;
  replyCount: number;
  timeline: CreatorMemoryEvent[];
};

// Thread states that mean the creator has engaged (replied / moved into a real path).
export const ENGAGED_STATES = new Set([
  "REPLIED",
  "INTERESTED_ASSETS",
  "INTERESTED_VISIT",
  "WAITING_ASSET_APPROVAL",
  "WAITING_VISIT_APPROVAL",
  "ASSETS_SENT",
  "VISIT_SCHEDULED",
  "NEEDS_HUMAN",
]);

// Thread states that are still "in flight" (an open loop the team may need to watch).
export const OPEN_STATES = new Set([
  "READY_TO_SEND",
  "INITIAL_SENT",
  "FOLLOW_UP_DUE",
  "REPLIED",
  "INTERESTED_ASSETS",
  "INTERESTED_VISIT",
  "WAITING_ASSET_APPROVAL",
  "WAITING_VISIT_APPROVAL",
  "NEEDS_HUMAN",
]);

export const WARMTH_LABEL: Record<CreatorWarmth, string> = {
  cold: "Cold — never contacted",
  contacted: "Contacted — no reply yet",
  engaged: "Engaged — replied",
  declined: "Declined",
  unsubscribed: "Unsubscribed",
  collaborated: "Collaborated",
};

type LeadRow = {
  id: string;
  directoryEntryId: string | null;
  contactEmail: string | null;
  displayName: string | null;
  handle: string | null;
  profileUrl: string;
  platform: string;
  city: string | null;
  categories: string[];
  followers: number | null;
  avgViews: number | null;
  priceMin: number | null;
  priceMax: number | null;
};

const LEAD_SELECT = {
  id: true,
  directoryEntryId: true,
  contactEmail: true,
  displayName: true,
  handle: true,
  profileUrl: true,
  platform: true,
  city: true,
  categories: true,
  followers: true,
  avgViews: true,
  priceMin: true,
  priceMax: true,
} as const;

export async function getCreatorMemory(workspaceId: string, leadId: string): Promise<CreatorMemory | null> {
  const seed = await prisma.creatorLead.findFirst({
    where: { id: leadId, workspaceId },
    select: LEAD_SELECT,
  });
  if (!seed) return null;

  const leads = await resolveSiblingLeads(workspaceId, seed);
  const leadIds = unique(leads.map(lead => lead.id));
  const emails = unique(leads.map(lead => normalizeEmail(lead.contactEmail)).filter(isString));

  const threads = await prisma.conversationThread.findMany({
    where: {
      workspaceId,
      OR: [
        { creatorLeadId: { in: leadIds } },
        emails.length ? { creatorEmail: { in: emails } } : undefined,
      ].filter(Boolean) as object[],
    },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const allMessages = threads.flatMap(thread => thread.messages);
  const outbound = allMessages.filter(message => message.direction === "OUTBOUND");
  const inbound = allMessages.filter(message => message.direction === "INBOUND");

  const flags = {
    unsubscribed: threads.some(thread => thread.state === "CLOSED" && asRecord(thread.metadata).unsubscribe === true),
    declined: threads.some(thread => thread.state === "REJECTED"),
    hasOpenThread: threads.some(thread => OPEN_STATES.has(thread.state)),
    noResponse: threads.some(thread => thread.state === "NO_RESPONSE"),
  };

  const warmth = computeWarmth({
    states: threads.map(thread => thread.state),
    unsubscribed: flags.unsubscribed,
    declined: flags.declined,
    hasInbound: inbound.length > 0,
  });

  const lastOutbound = outbound.reduce<Date | null>((latest, message) => {
    return !latest || message.createdAt > latest ? message.createdAt : latest;
  }, null);

  return {
    leadId: seed.id,
    name: pickName(leads),
    handle: pick(leads.map(lead => lead.handle)),
    email: emails[0] ?? null,
    platforms: unique(leads.map(lead => lead.platform)),
    profileUrls: unique(leads.map(lead => lead.profileUrl).filter(url => !url.startsWith("mailto:"))),
    categories: unique(leads.flatMap(lead => lead.categories ?? [])),
    city: pick(leads.map(lead => lead.city)),
    followers: maxNumber(leads.map(lead => lead.followers)),
    avgViews: maxNumber(leads.map(lead => lead.avgViews)),
    priceMin: minNumber(leads.map(lead => lead.priceMin)),
    priceMax: maxNumber(leads.map(lead => lead.priceMax)),
    warmth,
    warmthLabel: WARMTH_LABEL[warmth],
    flags,
    lastContactedAt: lastOutbound ? lastOutbound.toISOString() : null,
    contactCount: outbound.length,
    replyCount: inbound.length,
    timeline: buildTimeline(threads),
  };
}

async function resolveSiblingLeads(workspaceId: string, seed: LeadRow): Promise<LeadRow[]> {
  if (seed.directoryEntryId) {
    const byDirectory = await prisma.creatorLead.findMany({
      where: { workspaceId, directoryEntryId: seed.directoryEntryId },
      select: LEAD_SELECT,
    });
    if (byDirectory.length) return byDirectory;
  }

  // No directory link — fall back to matching email / handle / display name.
  const email = normalizeEmail(seed.contactEmail);
  const or = [
    email ? { contactEmail: { equals: email, mode: "insensitive" as const } } : undefined,
    seed.handle ? { handle: { equals: seed.handle, mode: "insensitive" as const } } : undefined,
    seed.displayName ? { displayName: { equals: seed.displayName, mode: "insensitive" as const } } : undefined,
  ].filter(Boolean) as object[];

  if (!or.length) return [seed];

  const matches = await prisma.creatorLead.findMany({
    where: { workspaceId, OR: or },
    select: LEAD_SELECT,
  });
  return matches.some(lead => lead.id === seed.id) ? matches : [seed, ...matches];
}

// [Claude 2026-06-10] Pure warmth rule, shared by the dossier (feature 1) and the daily
// outreach picks (feature 3). Precedence: most-restrictive / most-informative wins.
export function computeWarmth(input: {
  states: string[];
  unsubscribed: boolean;
  declined: boolean;
  hasInbound: boolean;
}): CreatorWarmth {
  if (input.unsubscribed) return "unsubscribed";
  if (input.declined) return "declined";
  // TODO(collaborated): there is no "collab completed" signal in the data model yet.
  if (input.hasInbound || input.states.some(state => ENGAGED_STATES.has(state))) return "engaged";
  if (input.states.length > 0) return "contacted";
  return "cold";
}

function buildTimeline(
  threads: Array<{ subject: string | null; messages: Array<{ direction: string; channel?: string | null; provider?: string | null; intent: string | null; subject: string | null; textBody: string | null; createdAt: Date }> }>,
): CreatorMemoryEvent[] {
  const events: CreatorMemoryEvent[] = [];
  for (const thread of threads) {
    for (const message of thread.messages) {
      if (message.direction === "OUTBOUND") {
        events.push({
          date: message.createdAt.toISOString(),
          kind: "outbound",
          channel: message.provider ?? null,
          summary: `Sent: ${message.subject || thread.subject || "outreach message"}`,
        });
      } else if (message.direction === "INBOUND") {
        events.push({
          date: message.createdAt.toISOString(),
          kind: "inbound",
          intent: message.intent,
          summary: `Reply${message.intent ? ` (${formatIntent(message.intent)})` : ""}: ${truncate(message.textBody || message.subject || "")}`,
        });
      } else {
        events.push({
          date: message.createdAt.toISOString(),
          kind: "status",
          summary: message.subject || message.textBody || "Status update",
        });
      }
    }
  }
  return events.sort((left, right) => (left.date < right.date ? 1 : -1)).slice(0, 25);
}

function pickName(leads: LeadRow[]) {
  return (
    pick(leads.map(lead => lead.displayName)) ||
    pick(leads.map(lead => lead.handle)) ||
    pick(leads.map(lead => lead.contactEmail?.split("@")[0] ?? null)) ||
    "Unknown creator"
  );
}

function formatIntent(intent: string) {
  return intent.replace(/_/g, " ");
}

function truncate(value: string, max = 140) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function pick(values: Array<string | null | undefined>) {
  return values.find((value): value is string => Boolean(value && value.trim())) ?? null;
}

function unique<T>(values: Array<T | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is T => value !== null && value !== undefined && value !== ("" as unknown))));
}

function maxNumber(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.max(...numbers) : null;
}

function minNumber(values: Array<number | null | undefined>) {
  const numbers = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  return numbers.length ? Math.min(...numbers) : null;
}

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
