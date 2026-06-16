import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const briefSchema = z.object({
  deliverables: z.string().max(2000).nullable().optional(),
  talkingPoints: z.string().max(2000).nullable().optional(),
  referenceLinks: z.string().max(2000).nullable().optional(),
  doNotMention: z.string().max(2000).nullable().optional(),
}).optional();

const createCampaignSchema = z.object({
  name: z.string().min(1).max(120),
  objective: z.string().max(4000).optional(),
  brief: briefSchema,
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
    return apiError(error, "Failed to load campaigns.");
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
        metadata: body.brief ? { brief: body.brief } : {},
      },
    });
    return created({ campaign });
  } catch (error) {
    return apiError(error, "Failed to create campaign.");
  }
}
