// [Claude 2026-06-10] Feature 3 + 4 — daily outreach picks API.
// GET  → the ranked "contact today" list.
// POST → preview (generate anchored copy, no send), approve (send first touch with the
//        previewed/edited copy + save the style note), skip (snooze), or
//        bulk_approve (send a single template to all picks, substituting {creatorName}).
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { UserFacingError, apiError, notFound, ok } from "@/lib/api";
import { getRequestContext, requireApproverRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startCreatorOutreachAutomation } from "@/lib/conversation-automation";
import { getOutreachPicks, SNOOZE_METADATA_KEY } from "@/lib/outreach-picks";
import { SIGNAL_METADATA_KEY, buildAnchoredOutreach, getCreatorOutreachContext, rewriteOutreach } from "@/lib/outreach-copy";

export const dynamic = "force-dynamic";

const SKIP_SNOOZE_DAYS = 30;

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("preview"),
    leadId: z.string().min(1),
    campaignId: z.string().optional(),
    styleNote: z.string().max(2000).optional(),
    referencePost: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("rewrite"),
    leadId: z.string().min(1),
    campaignId: z.string().optional(),
    subject: z.string().max(200),
    body: z.string().max(6000),
    styleNote: z.string().max(2000).optional(),
    referencePost: z.string().max(500).optional(),
    instruction: z.string().max(2000),
  }),
  z.object({
    action: z.literal("approve"),
    leadId: z.string().min(1),
    campaignId: z.string().optional(),
    subject: z.string().max(200).optional(),
    body: z.string().max(6000).optional(),
    styleNote: z.string().max(2000).optional(),
    referencePost: z.string().max(500).optional(),
  }),
  z.object({
    action: z.literal("skip"),
    leadId: z.string().min(1),
  }),
  // [Claude 2026-06-16] Bulk send: one template to all picks.
  // Use {creatorName} in subject/body — it is substituted per creator before sending.
  z.object({
    action: z.literal("bulk_approve"),
    campaignId: z.string().optional(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(6000),
    leadIds: z.array(z.string()).min(1).max(100),
  }),
]);

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const result = await getOutreachPicks(workspace.id);
    return ok(result);
  } catch (error) {
    return apiError(error, "Failed to load outreach picks.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace, role } = await getRequestContext();
    const body = actionSchema.parse(await req.json());

    if (body.action === "preview") {
      const context = await getCreatorOutreachContext(workspace.id, body.leadId, body.campaignId);
      if (!context) return notFound("Creator not found in this workspace.");
      if (body.styleNote !== undefined) context.styleNote = body.styleNote.trim() || null;
      if (body.referencePost !== undefined) context.referencePost = body.referencePost.trim() || null;
      const copy = await buildAnchoredOutreach(context);
      return ok({ action: "preview", ...copy, styleNote: context.styleNote, referencePost: context.referencePost });
    }

    if (body.action === "rewrite") {
      const context = await getCreatorOutreachContext(workspace.id, body.leadId, body.campaignId);
      if (!context) return notFound("Creator not found in this workspace.");
      if (body.styleNote !== undefined) context.styleNote = body.styleNote.trim() || null;
      if (body.referencePost !== undefined) context.referencePost = body.referencePost.trim() || null;
      const instruction = body.instruction.trim();
      if (!instruction) throw new UserFacingError("Describe how the email should change before rewriting.");
      const copy = await rewriteOutreach(context, { subject: body.subject, body: body.body }, instruction);
      return ok({ action: "rewrite", ...copy });
    }

    if (body.action === "approve") {
      requireApproverRole(role);
      await saveCreatorSignal(workspace.id, body.leadId, body.styleNote, body.referencePost);
      const firstMessage = body.subject && body.body ? { subject: body.subject, body: body.body } : undefined;
      const result = await startCreatorOutreachAutomation(workspace.id, user.id, { creatorLeadIds: [body.leadId], firstMessage, campaignId: body.campaignId });
      return ok({ action: "approve", ...result });
    }

    // [Claude 2026-06-16] Bulk approve: send a shared template to all selected picks.
    // {creatorName} in subject/body is replaced with each creator's display name.
    if (body.action === "bulk_approve") {
      requireApproverRole(role);
      const leads = await prisma.creatorLead.findMany({
        where: { id: { in: body.leadIds }, workspaceId: workspace.id, contactEmail: { not: null } },
        select: { id: true, displayName: true, handle: true, contactEmail: true },
      });

      const results = [];
      for (const lead of leads) {
        const creatorName = lead.displayName || lead.handle || lead.contactEmail?.split("@")[0] || "there";
        const subject = body.subject.replace(/\{creatorName\}/gi, creatorName);
        const bodyText = body.body.replace(/\{creatorName\}/gi, creatorName);
        const result = await startCreatorOutreachAutomation(workspace.id, user.id, {
          creatorLeadIds: [lead.id],
          firstMessage: { subject, body: bodyText },
          campaignId: body.campaignId,
        });
        results.push(...result.results);
      }

      const sent = results.filter(r => r.status === "sent").length;
      const skipped = results.filter(r => r.status !== "sent").length;
      return ok({ action: "bulk_approve", sent, skipped, results });
    }

    // skip → snooze
    const lead = await prisma.creatorLead.findFirst({
      where: { id: body.leadId, workspaceId: workspace.id },
      select: { id: true, metadata: true },
    });
    if (!lead) return notFound("Creator not found in this workspace.");
    const snoozedUntil = new Date(Date.now() + SKIP_SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString();
    await prisma.creatorLead.update({
      where: { id: lead.id },
      data: { metadata: { ...asRecord(lead.metadata), [SNOOZE_METADATA_KEY]: snoozedUntil } as Prisma.InputJsonValue },
    });
    return ok({ action: "skip", snoozedUntil });
  } catch (error) {
    return apiError(error, "Failed to update outreach pick.");
  }
}

async function saveCreatorSignal(workspaceId: string, leadId: string, styleNote?: string, referencePost?: string) {
  const note = styleNote?.trim();
  const ref = referencePost?.trim();
  if (!note && !ref) return;
  const lead = await prisma.creatorLead.findFirst({ where: { id: leadId, workspaceId }, select: { id: true, metadata: true } });
  if (!lead) return;
  const metadata = asRecord(lead.metadata);
  await prisma.creatorLead.update({
    where: { id: lead.id },
    data: {
      metadata: {
        ...metadata,
        [SIGNAL_METADATA_KEY]: { styleNote: note ?? null, referencePost: ref ?? null, capturedAt: new Date().toISOString() },
      } as Prisma.InputJsonValue,
    },
  });
}

function asRecord(value: unknown): Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}
