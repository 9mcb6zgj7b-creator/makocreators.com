import { NextRequest } from "next/server";
import { z } from "zod";
import { ApprovalRisk, OutreachChannel, Prisma } from "@prisma/client";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createDraftSchema = z.object({
  shortlistItemId: z.string().optional(),
  channel: z.nativeEnum(OutreachChannel).default("EMAIL"),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(8000),
  approvalRisk: z.nativeEnum(ApprovalRisk).default("MEDIUM"),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const drafts = await prisma.outreachDraft.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ drafts });
  } catch (error) {
    return apiError(error, "Failed to load outreach drafts.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createDraftSchema.parse(await req.json());

    const { draft, approval } = await prisma.$transaction(async tx => {
      const draft = await tx.outreachDraft.create({
        data: {
          workspaceId: workspace.id,
          createdById: user.id,
          shortlistItemId: body.shortlistItemId,
          channel: body.channel,
          subject: body.subject,
          body: body.body,
        },
      });

      const approval = await tx.approval.create({
        data: {
          workspaceId: workspace.id,
          createdById: user.id,
          outreachDraftId: draft.id,
          type: "SEND_OUTREACH",
          title: buildApprovalTitle(body.channel, body.subject),
          summary: "Review this outreach draft before any external message is sent. Mako prepared the draft for internal approval only.",
          riskLevel: body.approvalRisk,
          metadata: {
            source: "outreach-draft-created",
            safeClaims: ["Draft is queued for human review before external send."],
            blockedClaims: ["No external message has been sent by Mako.", "No payment or usage-rights commitment has been made."],
          } satisfies Prisma.InputJsonValue,
        },
      });

      return { draft, approval };
    });

    return created({ draft, approval });
  } catch (error) {
    return apiError(error, "Failed to create outreach draft.");
  }
}

function buildApprovalTitle(channel: OutreachChannel, subject?: string) {
  const channelLabel = channel.toLowerCase();
  if (subject) {
    return `Approve ${channelLabel} outreach: ${subject}`;
  }
  return `Approve ${channelLabel} outreach draft`;
}
