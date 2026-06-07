import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { splitUrls } from "@/lib/url";

export const dynamic = "force-dynamic";

const createPersonaSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  business: z.string().min(1).max(4000),
  referenceUrls: z.union([z.string(), z.array(z.string())]).optional(),
  competitorUrls: z.union([z.string(), z.array(z.string())]).optional(),
  idealCreator: z.string().max(4000).optional(),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const personas = await prisma.creatorPersona.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ personas });
  } catch (error) {
    return apiError(error, "Failed to load creator personas.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createPersonaSchema.parse(await req.json());
    const referenceUrls = normalizeUrls(body.referenceUrls);
    const competitorUrls = normalizeUrls(body.competitorUrls);
    const title = body.title?.trim() || inferPersonaTitle(body.business);

    const persona = await prisma.creatorPersona.create({
      data: {
        workspaceId: workspace.id,
        createdById: user.id,
        title,
        description: buildDescription(body.business, body.idealCreator),
        business: body.business,
        referenceUrls,
        competitorUrls,
        idealCreator: body.idealCreator,
        status: "GENERATED",
        metadata: {
          source: "creator-brief-wizard",
        },
      },
    });

    return created({ persona });
  } catch (error) {
    return apiError(error, "Failed to create creator persona.");
  }
}

function normalizeUrls(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map(item => item.trim()).filter(Boolean);
  return splitUrls(value);
}

function inferPersonaTitle(business: string) {
  const text = business.trim().slice(0, 70);
  return text ? `${text} Creator Persona` : "Creator Persona";
}

function buildDescription(business: string, idealCreator?: string) {
  return [
    `Business: ${business.trim()}`,
    idealCreator?.trim() ? `Ideal creator: ${idealCreator.trim()}` : null,
  ].filter(Boolean).join("\n\n");
}
