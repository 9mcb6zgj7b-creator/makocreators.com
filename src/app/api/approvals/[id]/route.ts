import { NextRequest } from "next/server";
import { ApprovalStatus } from "@prisma/client";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
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
      return ok({ approval: null }, { status: 404 });
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

    return ok({ approval });
  } catch (error) {
    return apiError(error, "Failed to update approval.");
  }
}
