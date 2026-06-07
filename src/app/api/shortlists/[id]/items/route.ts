import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const addItemSchema = z.object({
  creatorId: z.string().min(1),
  personaId: z.string().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { workspace } = await getRequestContext();
    const body = addItemSchema.parse(await req.json());
    const shortlist = await prisma.shortlist.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!shortlist) return ok({ error: "Shortlist not found" }, { status: 404 });

    if (body.personaId) {
      const persona = await prisma.creatorPersona.findFirst({
        where: { id: body.personaId, workspaceId: workspace.id },
        select: { id: true },
      });
      if (!persona) return ok({ error: "Persona not found" }, { status: 404 });
    }

    const item = await prisma.shortlistItem.upsert({
      where: {
        shortlistId_creatorId: {
          shortlistId: shortlist.id,
          creatorId: body.creatorId,
        },
      },
      update: {
        personaId: body.personaId,
        priority: body.priority,
        notes: body.notes,
      },
      create: {
        shortlistId: shortlist.id,
        creatorId: body.creatorId,
        personaId: body.personaId,
        priority: body.priority ?? 0,
        notes: body.notes,
      },
      include: {
        creator: { include: { profiles: true } },
        persona: true,
      },
    });

    return created({ item });
  } catch (error) {
    return apiError(error, "加入候选名单失败");
  }
}
