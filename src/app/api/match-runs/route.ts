import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMatchRun } from "@/lib/creator-matching";

export const dynamic = "force-dynamic";

const createRunSchema = z.object({
  personaId: z.string().optional(),
  query: z.record(z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())])).optional(),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const runs = await prisma.creatorMatchRun.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: {
        persona: true,
        results: {
          include: { creator: { include: { profiles: true } } },
          orderBy: { score: "desc" },
          take: 10,
        },
      },
    });
    return ok({ runs });
  } catch (error) {
    return apiError(error, "读取匹配任务失败");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createRunSchema.parse(await req.json());

    if (body.personaId) {
      const persona = await prisma.creatorPersona.findFirst({
        where: { id: body.personaId, workspaceId: workspace.id },
        select: { id: true },
      });
      if (!persona) return ok({ error: "Persona not found" }, { status: 404 });
    }

    const run = await createMatchRun({
      workspaceId: workspace.id,
      createdById: user.id,
      personaId: body.personaId,
      query: (body.query ?? {}) as Prisma.InputJsonObject,
    });

    return created({ run });
  } catch (error) {
    return apiError(error, "创建匹配任务失败");
  }
}
