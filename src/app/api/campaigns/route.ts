import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createCampaignSchema = z.object({
  name: z.string().min(1).max(120),
  objective: z.string().max(1000).optional(),
  budgetMin: z.number().int().min(0).optional(),
  budgetMax: z.number().int().min(0).optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const campaigns = await prisma.campaign.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ campaigns });
  } catch (error) {
    return apiError(error, "读取活动失败");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const body = createCampaignSchema.parse(await req.json());
    const campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        name: body.name,
        objective: body.objective,
        budgetMin: body.budgetMin,
        budgetMax: body.budgetMax,
        startsAt: body.startsAt ? new Date(body.startsAt) : undefined,
        endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
      },
    });
    return created({ campaign });
  } catch (error) {
    return apiError(error, "创建活动失败");
  }
}
