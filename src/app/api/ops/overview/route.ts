import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { getOpsOverview } from "@/lib/ops-overview";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const overview = await getOpsOverview(workspace.id);
    return ok({ overview });
  } catch (error) {
    return apiError(error, "Failed to load creator ops overview.");
  }
}
