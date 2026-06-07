import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, workspace, role } = await getRequestContext();
    return ok({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
      },
      role,
    });
  } catch (error) {
    return apiError(error, "Failed to load the current user.");
  }
}
