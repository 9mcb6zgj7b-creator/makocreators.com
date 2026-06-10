// [Claude 2026-06-10] Feature 1 — returns the creator memory dossier for the drawer.
import { NextRequest } from "next/server";
import { apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { getCreatorMemory } from "@/lib/creator-memory";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { workspace } = await getRequestContext();
    const leadId = req.nextUrl.searchParams.get("leadId");
    if (!leadId) {
      return notFound("Provide a leadId to load creator memory.");
    }
    const memory = await getCreatorMemory(workspace.id, leadId);
    if (!memory) {
      return notFound("Creator not found in this workspace.");
    }
    return ok({ memory });
  } catch (error) {
    return apiError(error, "Failed to load creator memory.");
  }
}
