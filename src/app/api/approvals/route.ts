import { NextRequest } from "next/server";
import { ApprovalRisk, ApprovalStatus, ApprovalType, Prisma } from "@prisma/client";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const listApprovalsSchema = z.object({
  campaignId: z.string().optional(),
  status: z.nativeEnum(ApprovalStatus).optional(),
  type: z.nativeEnum(ApprovalType).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const createApprovalSchema = z.object({
  campaignId: z.string().optional(),
  creatorId: z.string().optional(),
  outreachDraftId: z.string().optional(),
  type: z.nativeEnum(ApprovalType).default("GENERAL_REVIEW"),
  title: z.string().min(1).max(160),
  summary: z.string().min(1).max(4000),
  riskLevel: z.nativeEnum(ApprovalRisk).default("MEDIUM"),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const query = listApprovalsSchema.parse(Object.fromEntries(req.nextUrl.searchParams));

    const approvals = await prisma.approval.findMany({
      where: {
        workspaceId: workspace.id,
        campaignId: query.campaignId,
        status: query.status,
        type: query.type,
      },
      orderBy: [{ riskLevel: "desc" }, { createdAt: "desc" }],
      take: query.limit,
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
        outreachDraft: {
          select: { id: true, channel: true, subject: true, status: true },
        },
      },
    });

    return ok({ approvals });
  } catch (error) {
    return apiError(error, "Failed to load approvals.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createApprovalSchema.parse(await req.json());

    await assertWorkspaceReferences(workspace.id, {
      campaignId: body.campaignId,
      creatorId: body.creatorId,
      outreachDraftId: body.outreachDraftId,
    });

    const approval = await prisma.approval.create({
      data: {
        workspaceId: workspace.id,
        createdById: user.id,
        campaignId: body.campaignId,
        creatorId: body.creatorId,
        outreachDraftId: body.outreachDraftId,
        type: body.type,
        title: body.title,
        summary: body.summary,
        riskLevel: body.riskLevel,
        metadata: (body.metadata ?? {}) as Prisma.InputJsonValue,
      },
    });

    return created({ approval });
  } catch (error) {
    return apiError(error, "Failed to create approval.");
  }
}

async function assertWorkspaceReferences(
  workspaceId: string,
  input: { campaignId?: string; creatorId?: string; outreachDraftId?: string },
) {
  const checks = [];

  if (input.campaignId) {
    checks.push(
      prisma.campaign.findFirst({
        where: { id: input.campaignId, workspaceId },
        select: { id: true },
      }).then(result => {
        if (!result) throw new Error("Campaign not found.");
      }),
    );
  }

  if (input.creatorId) {
    checks.push(
      prisma.creator.findFirst({
        where: { id: input.creatorId },
        select: { id: true },
      }).then(result => {
        if (!result) throw new Error("Creator not found.");
      }),
    );
  }

  if (input.outreachDraftId) {
    checks.push(
      prisma.outreachDraft.findFirst({
        where: { id: input.outreachDraftId, workspaceId },
        select: { id: true },
      }).then(result => {
        if (!result) throw new Error("Outreach draft not found.");
      }),
    );
  }

  await Promise.all(checks);
}
