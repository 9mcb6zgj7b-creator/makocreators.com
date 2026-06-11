import { NextRequest } from "next/server";
import { ApprovalStatus } from "@prisma/client";
import { z } from "zod";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext, requireApproverRole } from "@/lib/auth";
import { handleApprovedConversationApproval, handleReviewedConversationApproval } from "@/lib/conversation-automation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const updateApprovalSchema = z.object({
  status: z.nativeEnum(ApprovalStatus),
  decisionNotes: z.string().max(4000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, workspace, role } = await getRequestContext();
    requireApproverRole(role);
    const body = updateApprovalSchema.parse(await req.json());

    // [Claude 2026-06-09] Security fix: read the current status so we only run the
    // side-effecting automation when the approval first transitions INTO APPROVED.
    // Previously re-PATCHing an already-APPROVED approval re-sent assets / re-confirmed
    // the visit to the creator.
    const existing = await prisma.approval.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      select: { id: true, status: true },
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

    // [Claude 2026-06-09] Only fire automation on the first approval, not on repeats.
    const justApproved = body.status === "APPROVED" && existing.status !== "APPROVED";
    // [Claude 2026-06-10] Route Need Change / Reject back to a human (only on transition in).
    const justRevised = (body.status === "NEEDS_CHANGES" || body.status === "REJECTED") && existing.status !== body.status;
    const automationResult = justApproved
      ? await handleApprovedConversationApproval(approval)
      : justRevised
        ? await handleReviewedConversationApproval(approval)
        : null;

    return ok({ approval, automationResult });
  } catch (error) {
    return apiError(error, "Failed to update approval.");
  }
}
