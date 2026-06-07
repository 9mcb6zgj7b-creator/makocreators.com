import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createShortlistSchema = z.object({
  name: z.string().min(1).max(120),
  notes: z.string().max(4000).optional(),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const shortlists = await prisma.shortlist.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            creator: { include: { profiles: true } },
            persona: true,
          },
          orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        },
      },
    });
    return ok({ shortlists });
  } catch (error) {
    return apiError(error, "读取候选名单失败");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createShortlistSchema.parse(await req.json());
    const shortlist = await prisma.shortlist.create({
      data: {
        workspaceId: workspace.id,
        createdById: user.id,
        name: body.name,
        notes: body.notes,
      },
    });
    return created({ shortlist });
  } catch (error) {
    return apiError(error, "创建候选名单失败");
  }
}
