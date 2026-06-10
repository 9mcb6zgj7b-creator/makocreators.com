// [Claude 2026-06-10] Feature 3 + 4 — daily outreach picks API.
// GET  → the ranked "contact today" list.
// POST → preview (generate anchored copy, no send), approve (send first touch with the
//        previewed/edited copy + save the style note), or skip (snooze the creator).
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startCreatorOutreachAutomation } from "@/lib/conversation-automation";
import { getOutreachPicks, SNOOZE_METADATA_KEY } from "@/lib/outreach-picks";
import { SIGNAL_METADATA_KEY, buildAnchoredOutreach, getCreatorOutreachContext } from "@/lib/outreach-copy";

export const dynamic = "force-dynamic";

const SKIP_SNOOZE_DAYS = 30;

const actionSchema = z.object({
  action: z.enum(["preview", "approve", "skip"]),
  leadId: z.string().min(1),
  subject: z.string().max(200).optional(),
  body: z.string().max(6000).optional(),
  styleNote: z.string().max(2000).optional(),
  referencePost: z.string().max(500).optional(),
});

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
    const { user, workspace } = await getRequestContext();
    const body = actionSchema.parse(await req.json());

    if (body.action === "preview") {
      const context = await getCreatorOutreachContext(workspace.id, body.leadId);
      if (!context) return notFound("Creator not found in this workspace.");
      // Let the human's just-typed note drive the preview before it's saved.
      if (body.styleNote !== undefined) context.styleNote = body.styleNote.trim() || null;
      if (body.referencePost !== undefined) context.referencePost = body.referencePost.trim() || null;
      const copy = await buildAnchoredOutreach(context);
      return ok({ action: "preview", ...copy, styleNote: context.styleNote, referencePost: context.referencePost });
    }

    if (body.action === "approve") {
      await saveCreatorSignal(workspace.id, body.leadId, body.styleNote, body.referencePost);
      const firstMessage = body.subject && body.body ? { subject: body.subject, body: body.body } : undefined;
      const result = await startCreatorOutreachAutomation(workspace.id, user.id, { creatorLeadIds: [body.leadId], firstMessage });
      return ok({ action: "approve", ...result });
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
