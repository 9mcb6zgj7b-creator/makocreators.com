import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const taskStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "DONE", "ARCHIVED"]);
const taskTypeSchema = z.enum(["GENERAL", "CREATOR_REVIEW", "CAMPAIGN_SETUP", "OUTREACH", "REPORT"]);

const listTasksSchema = z.object({
  campaignId: z.string().optional(),
  status: taskStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const createTaskSchema = z.object({
  campaignId: z.string().optional(),
  title: z.string().min(1).max(160),
  description: z.string().max(4000).optional(),
  type: taskTypeSchema.default("GENERAL"),
  priority: z.number().int().min(0).max(100).default(0),
  dueAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const query = listTasksSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const tasks = await prisma.dashboardTask.findMany({
      where: {
        workspaceId: workspace.id,
        campaignId: query.campaignId,
        status: query.status,
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: query.limit,
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
      },
    });
    return ok({ tasks });
  } catch (error) {
    return apiError(error, "Failed to load tasks.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createTaskSchema.parse(await req.json());

    if (body.campaignId) {
      const campaign = await prisma.campaign.findFirst({
        where: { id: body.campaignId, workspaceId: workspace.id },
        select: { id: true },
      });
      if (!campaign) {
        throw new Error("Campaign not found.");
      }
    }

    const task = await prisma.dashboardTask.create({
      data: {
        workspaceId: workspace.id,
        createdById: user.id,
        campaignId: body.campaignId,
        title: body.title,
        description: body.description,
        type: body.type,
        priority: body.priority,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        metadata: (body.metadata ?? {}) as Prisma.InputJsonValue,
      },
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return created({ task });
  } catch (error) {
    return apiError(error, "Failed to create task.");
  }
}
