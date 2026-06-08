import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { getDashboardData } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, workspace, role } = await getRequestContext();
    const dashboard = await getDashboardData(workspace.id);

    return ok({
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        imageUrl: user.imageUrl,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        role,
      },
      navigation: [
        { key: "home", label: "Home", href: "/dashboard" },
        { key: "ops", label: "Ops", href: "/ops" },
        { key: "creators", label: "Creators", href: "/creators" },
        { key: "campaigns", label: "Campaigns", href: "/campaigns" },
        { key: "reports", label: "Reports", href: "/reports" },
      ],
      campaigns: dashboard.campaigns,
      tasks: dashboard.openTasks,
      stats: dashboard.stats,
      support: {
        title: "Contact Mako Creator Support",
        description: "Get help from our creator campaign support team.",
        channels: [
          { key: "chat", label: "Live Chat", available: true },
          { key: "email", label: "Email Support", available: true },
        ],
      },
      emptyState: {
        title: "All clear. No pending tasks right now.",
        actionLabel: "New Campaign",
      },
    });
  } catch (error) {
    return apiError(error, "Failed to load dashboard data.");
  }
}
