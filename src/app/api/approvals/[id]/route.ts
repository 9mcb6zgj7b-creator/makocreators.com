import { NextRequest } from "next/server";
import { ApprovalStatus } from "@prisma/client";
import { z } from "zod";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { handleApprovedConversationApproval } from "@/lib/conversation-automation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const updateApprovalSchema = z.object({
  status: z.nativeEnum(ApprovalStatus),
  decisionNotes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = updateApprovalSchema.parse(await req.json());

    const existing = await prisma.approval.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      select: { id: true },
    });

    if (!existing) {
      return notFound("Approval not found.");
    }

    const isReviewedStatus = body.status === "APPROVED" || body.status === "REJECTED" || body.status === "NEEDS_CHANGES";
    const approval = await prisma.approval.update({
      where: { id: params.id },
      data: {
        status: body.status,
        decisionNotes: body.decisionNotes,
        reviewedById: isReviewedStatus ? user.id : null,
        reviewedAt: isReviewedStatus ? new Date() : null,
      },
    });

    const automationResult = body.status === "APPROVED" ? await handleApprovedConversationApproval(approval) : null;

    return ok({ approval, automationResult });
  } catch (error) {
    return apiError(error, "Failed to update approval.");
  }
}
