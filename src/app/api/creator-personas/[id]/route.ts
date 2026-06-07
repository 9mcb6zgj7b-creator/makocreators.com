import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const updatePersonaSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(4000).optional(),
  idealCreator: z.string().max(4000).nullable().optional(),
  status: z.enum(["DRAFT", "GENERATED", "ARCHIVED"]).optional(),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { workspace } = await getRequestContext();
    const persona = await prisma.creatorPersona.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!persona) return ok({ error: "Not found" }, { status: 404 });
    return ok({ persona });
  } catch (error) {
    return apiError(error, "Failed to load creator persona.");
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { workspace } = await getRequestContext();
    const data = updatePersonaSchema.parse(await req.json());
    const existing = await prisma.creatorPersona.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      select: { id: true },
    });
    if (!existing) return ok({ error: "Not found" }, { status: 404 });

    const persona = await prisma.creatorPersona.update({
      where: { id: params.id },
      data,
    });
    return ok({ persona });
  } catch (error) {
    return apiError(error, "Failed to update creator persona.");
  }
}
