import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    return ok({ id: workspace.id, name: workspace.name, slug: workspace.slug });
  } catch (error) {
    return apiError(error, "Failed to load workspace.");
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const body = patchSchema.parse(await req.json());
    const updated = await prisma.workspace.update({
      where: { id: workspace.id },
      data: { name: body.name },
      select: { id: true, name: true },
    });
    return ok({ workspace: updated });
  } catch (error) {
    return apiError(error, "Failed to update workspace.");
  }
}
