import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import {
  creatorLeadLinksSchema,
  creatorLeadStatusSchema,
  dedupeCreatorLeadInputs,
  normalizeCreatorLeadInput,
} from "@/lib/creator-leads";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const listQuerySchema = z.object({
  status: creatorLeadStatusSchema.optional(),
  platform: z.enum(["INSTAGRAM", "TIKTOK", "YOUTUBE", "XIAOHONGSHU", "OTHER"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const query = listQuerySchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const leads = await prisma.creatorLead.findMany({
      where: {
        workspaceId: workspace.id,
        status: query.status,
        platform: query.platform,
      },
      orderBy: { createdAt: "desc" },
      take: query.limit,
    });
    return ok({ leads });
  } catch (error) {
    return apiError(error, "Failed to load creator leads.");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = creatorLeadLinksSchema.parse(await req.json());
    const urls = dedupeCreatorLeadInputs(
      [...(body.urls ?? []), ...(body.url ? [body.url] : [])].map(url =>
        normalizeCreatorLeadInput({
          profileUrl: url,
          source: "LINK",
          notes: body.notes,
          rawInput: { url, notes: body.notes ?? null },
        })
      )
    );

    const leads = await prisma.$transaction(
      urls.map(input =>
        prisma.creatorLead.upsert({
          where: {
            workspaceId_profileUrl: {
              workspaceId: workspace.id,
              profileUrl: input.profileUrl,
            },
          },
          update: {
            platform: input.platform,
            handle: input.handle,
            notes: input.notes,
            status: "PENDING_ANALYSIS",
            source: "LINK",
            rawInput: input.rawInput ?? {},
          },
          create: {
            workspaceId: workspace.id,
            createdById: user.id,
            source: "LINK",
            status: "PENDING_ANALYSIS",
            platform: input.platform!,
            profileUrl: input.profileUrl,
            handle: input.handle,
            categories: [],
            notes: input.notes,
            rawInput: input.rawInput ?? {},
          },
        })
      )
    );

    return created({ leads, count: leads.length });
  } catch (error) {
    return apiError(error, "Failed to submit creator links.");
  }
}
