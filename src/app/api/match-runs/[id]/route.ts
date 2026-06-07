import { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { workspace } = await getRequestContext();
    const run = await prisma.creatorMatchRun.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: {
        persona: true,
        results: {
          include: { creator: { include: { profiles: true } } },
          orderBy: { score: "desc" },
        },
      },
    });
    if (!run) return ok({ error: "Not found" }, { status: 404 });
    return ok({ run });
  } catch (error) {
    return apiError(error, "读取匹配任务失败");
  }
}
