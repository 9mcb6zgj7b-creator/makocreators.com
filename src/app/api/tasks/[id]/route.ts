import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  description: z.string().max(4000).nullable().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "ARCHIVED"]).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  dueAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

type Params = {
  params: { id: string };
};

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { workspace } = await getRequestContext();
    const task = await prisma.dashboardTask.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
      },
    });
    if (!task) {
      return notFound("Task not found.");
    }
    return ok({ task });
  } catch (error) {
    return apiError(error, "Failed to load task.");
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { workspace } = await getRequestContext();
    const body = updateTaskSchema.parse(await req.json());
    const existing = await prisma.dashboardTask.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!existing) {
      return notFound("Task not found.");
    }

    const task = await prisma.dashboardTask.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
        priority: body.priority,
        dueAt: body.dueAt === undefined ? undefined : body.dueAt ? new Date(body.dueAt) : null,
        metadata: body.metadata as Prisma.InputJsonValue | undefined,
      },
      include: {
        campaign: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return ok({ task });
  } catch (error) {
    return apiError(error, "Failed to update task.");
  }
}
