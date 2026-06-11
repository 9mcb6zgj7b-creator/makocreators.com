// [Claude 2026-06-10] Feature 4 — trigger-anchored outreach copy.
// Builds the first-touch email so the opening line is anchored on something real about
// THIS creator (a human-written style note / reference post, else their niche + city).
// Hard rule: never invent posts, events, metrics, or compliments. If we have no specific
// signal, we open honestly on niche/location — we do NOT pretend to have watched content.
// LLM-generated with a deterministic template fallback (mirrors conversation-classifier).
import { UserFacingError } from "@/lib/api";
import { prisma } from "@/lib/db";

export type OutreachCopy = { subject: string; body: string };

export type CreatorSignal = {
  styleNote: string | null;
  referencePost: string | null;
};

export type OutreachContext = {
  leadId: string;
  creatorName: string;
  brandName: string;
  business: string | null;
  platform: string | null;
  categories: string[];
  city: string | null;
  styleNote: string | null;
  referencePost: string | null;
};

export const SIGNAL_METADATA_KEY = "signal";

export async function getCreatorOutreachContext(workspaceId: string, leadId: string | null): Promise<OutreachContext | null> {
  if (!leadId) return null;
  const lead = await prisma.creatorLead.findFirst({
    where: { id: leadId, workspaceId },
    select: {
      id: true,
      displayName: true,
      handle: true,
      contactEmail: true,
      platform: true,
      categories: true,
      city: true,
      metadata: true,
    },
  });
  if (!lead) return null;

  const signal = readSignal(lead.metadata);
  const brandName = await getWorkspaceBrandName(workspaceId);
  const business = await getBrandBusiness(workspaceId);

  return {
    leadId: lead.id,
    creatorName: lead.displayName || lead.handle || lead.contactEmail?.split("@")[0] || "there",
    brandName,
    business,
    platform: lead.platform,
    categories: lead.categories ?? [],
    city: lead.city,
    styleNote: signal.styleNote,
    referencePost: signal.referencePost,
  };
}

export function readSignal(metadata: unknown): CreatorSignal {
  const signal = asRecord(asRecord(metadata)[SIGNAL_METADATA_KEY]);
  return {
    styleNote: stringOrNull(signal.styleNote),
    referencePost: stringOrNull(signal.referencePost),
  };
}

export async function buildAnchoredOutreach(context: OutreachContext, override?: Partial<OutreachCopy>): Promise<OutreachCopy> {
  if (override?.subject && override?.body) {
    return { subject: override.subject, body: override.body };
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const generated = await generateWithLlm(context);
      if (generated && !looksGeneric(generated.body, context)) {
        return generated;
      }
    } catch (error) {
      console.warn("Outreach copy generation failed; using template fallback.", error);
    }
  }

  return templateOutreach(context);
}

// [Claude 2026-06-10] AI rewrite for the preview modal: the human types an instruction
// ("shorter, more casual, mention samples") and we rewrite the current draft under the
// same anti-fabrication guardrails as generation. No silent fallback — if the LLM is not
// configured or fails, we throw so the UI shows an error and keeps the human's draft.
export async function rewriteOutreach(context: OutreachContext, current: OutreachCopy, instruction: string): Promise<OutreachCopy> {
  if (!process.env.OPENAI_API_KEY) {
    throw new UserFacingError("AI rewrite is not configured yet — set OPENAI_API_KEY in the environment.", 503);
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_OUTREACH_MODEL || process.env.OPENAI_CLASSIFIER_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You rewrite a first-touch cold outreach email from a local brand to a content creator, following the human reviewer's instruction.",
            "Use ONLY the facts in the provided JSON. Never invent posts, videos, events, metrics, follower counts, or compliments that are not supported by the facts.",
            "If the instruction asks you to invent facts, promise payment, usage rights, exclusivity, or deadlines, do not comply with that part — apply the rest of the instruction.",
            "Keep it short (4-6 sentences), plain text, friendly and concrete.",
            "Do NOT include any unsubscribe text or signature placeholders. Return strict JSON: { \"subject\": string, \"body\": string }.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            instruction: instruction.slice(0, 2000),
            currentSubject: current.subject,
            currentBody: current.body,
            facts: {
              brand: context.brandName,
              business: context.business,
              creatorName: context.creatorName,
              platform: context.platform,
              categories: context.categories,
              city: context.city,
              styleNote: context.styleNote,
              referencePost: context.referencePost,
            },
          }),
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("AI rewrite provider error:", (await res.text()).slice(0, 500));
    throw new UserFacingError("AI rewrite failed — the language model request did not succeed. Please try again.", 502);
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as Partial<OutreachCopy>;
  if (!parsed.subject || !parsed.body) throw new UserFacingError("AI rewrite returned an empty draft. Please try again.", 502);
  return { subject: parsed.subject.slice(0, 200), body: parsed.body.slice(0, 4000) };
}

async function generateWithLlm(context: OutreachContext): Promise<OutreachCopy | null> {
  const hasStyleNote = Boolean(context.styleNote);
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_OUTREACH_MODEL || process.env.OPENAI_CLASSIFIER_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You write a short, warm, first-touch cold outreach email from a local brand to a content creator.",
            "Use ONLY the facts in the provided JSON. Never invent posts, videos, events, metrics, follower counts, or compliments that are not supported by the facts.",
            hasStyleNote
              ? "A human-written styleNote (and maybe a referencePost) describes what the brand genuinely liked about this creator. Anchor the opening sentence on it, specifically and naturally."
              : "There is NO styleNote. Do NOT pretend you watched their content. Open honestly on their niche/categories and city instead.",
            "Do not promise payment, usage rights, exclusivity, or deadlines. Keep it 4-6 short sentences, plain text, friendly and concrete.",
            "Do NOT include any unsubscribe text or signature placeholders. Return strict JSON: { \"subject\": string, \"body\": string }.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify({
            brand: context.brandName,
            business: context.business,
            creatorName: context.creatorName,
            platform: context.platform,
            categories: context.categories,
            city: context.city,
            styleNote: context.styleNote,
            referencePost: context.referencePost,
          }),
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}") as Partial<OutreachCopy>;
  if (!parsed.subject || !parsed.body) return null;
  return { subject: parsed.subject.slice(0, 200), body: parsed.body.slice(0, 4000) };
}

// "Would this email have been valid sent to anyone last month?" If it references no
// creator-specific fact, it is too generic — fall back to the explicit template.
function looksGeneric(body: string, context: OutreachContext): boolean {
  const lower = body.toLowerCase();
  const anchors = [
    ...context.categories.map(category => category.toLowerCase()),
    context.city?.toLowerCase() ?? "",
    ...(context.styleNote ? context.styleNote.toLowerCase().split(/\s+/).filter(word => word.length >= 4) : []),
  ].filter(Boolean);
  if (!anchors.length) return false; // we have nothing specific to require anyway
  return !anchors.some(anchor => lower.includes(anchor));
}

function templateOutreach(context: OutreachContext): OutreachCopy {
  const category = context.categories[0] || "content";
  const place = context.city ? ` in ${context.city}` : "";
  const business = context.business ? ` (${context.business})` : "";
  const subject = `${context.brandName} x ${context.creatorName}`;

  const opener = context.styleNote
    ? `I came across your work and really liked it — ${context.styleNote.trim().replace(/\.$/, "")}.`
    : `I came across your ${category} content${place} and it's exactly the kind of local audience we're trying to reach.`;

  const body = [
    `Hi ${context.creatorName},`,
    "",
    `I'm reaching out from ${context.brandName}${business}. ${opener}`,
    "",
    "We're putting together a small creator collaboration and thought you could be a strong fit. If you're open to it, just reply and let me know whether you'd prefer receiving materials to post from, or an in-person visit.",
    "",
    "No pressure if it's not a fit — a quick \"no thanks\" is totally fine.",
  ].join("\n");

  return { subject, body };
}

async function getWorkspaceBrandName(workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } });
  return workspace?.name || "Mako Creator";
}

async function getBrandBusiness(workspaceId: string): Promise<string | null> {
  const persona = await prisma.creatorPersona.findFirst({
    where: { workspaceId, status: { in: ["DRAFT", "GENERATED"] } },
    orderBy: { createdAt: "desc" },
    select: { business: true },
  });
  if (persona?.business) return persona.business.slice(0, 200);
  const campaign = await prisma.campaign.findFirst({
    where: { workspaceId, status: { in: ["DRAFT", "ACTIVE"] } },
    orderBy: { createdAt: "desc" },
    select: { objective: true },
  });
  return campaign?.objective?.slice(0, 200) ?? null;
}

function stringOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
