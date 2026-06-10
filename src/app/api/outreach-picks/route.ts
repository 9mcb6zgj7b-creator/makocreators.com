// [Claude 2026-06-10] Feature 3 — daily outreach picks API.
// GET  → the ranked "contact today" list.
// POST → approve (start outreach / send first touch) or skip (snooze the creator).
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { startCreatorOutreachAutomation } from "@/lib/conversation-automation";
import { getOutreachPicks, SNOOZE_METADATA_KEY } from "@/lib/outreach-picks";

export const dynamic = "force-dynamic";

const SKIP_SNOOZE_DAYS = 30;

const actionSchema = z.object({
  action: z.enum(["approve", "skip"]),
  leadId: z.string().min(1),
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

    if (body.action === "approve") {
      // Sends the first outreach touch via the existing automation. Subsequent asset
      // sends / visit scheduling still pass through the human approval gates.
      const result = await startCreatorOutreachAutomation(workspace.id, user.id, { creatorLeadIds: [body.leadId] });
      return ok({ action: "approve", ...result });
    }

    const lead = await prisma.creatorLead.findFirst({
      where: { id: body.leadId, workspaceId: workspace.id },
      select: { id: true, metadata: true },
    });
    if (!lead) {
      return notFound("Creator not found in this workspace.");
    }

    const metadata = lead.metadata && typeof lead.metadata === "object" && !Array.isArray(lead.metadata)
      ? (lead.metadata as Record<string, unknown>)
      : {};
    const snoozedUntil = new Date(Date.now() + SKIP_SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    await prisma.creatorLead.update({
      where: { id: lead.id },
      data: { metadata: { ...metadata, [SNOOZE_METADATA_KEY]: snoozedUntil } as Prisma.InputJsonValue },
    });

    return ok({ action: "skip", snoozedUntil });
  } catch (error) {
    return apiError(error, "Failed to update outreach pick.");
  }
}
