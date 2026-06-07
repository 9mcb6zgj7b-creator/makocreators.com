import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, workspace, role } = await getRequestContext();
    const [
      campaigns,
      openTasks,
      creatorLeadCounts,
      activeCampaignCount,
      shortlistCount,
      matchRunCount,
    ] = await Promise.all([
      prisma.campaign.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.dashboardTask.findMany({
        where: {
          workspaceId: workspace.id,
          status: { in: ["OPEN", "IN_PROGRESS"] },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 10,
        include: {
          campaign: {
            select: { id: true, name: true, status: true },
          },
        },
      }),
      prisma.creatorLead.groupBy({
        by: ["status"],
        where: { workspaceId: workspace.id },
        _count: { _all: true },
      }),
      prisma.campaign.count({
        where: { workspaceId: workspace.id, status: { in: ["DRAFT", "ACTIVE"] } },
      }),
      prisma.shortlist.count({ where: { workspaceId: workspace.id } }),
      prisma.creatorMatchRun.count({ where: { workspaceId: workspace.id } }),
    ]);

    const creatorLeads = creatorLeadCounts.reduce<Record<string, number>>((counts, item) => {
      counts[item.status] = item._count._all;
      return counts;
    }, {});

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
        { key: "creators", label: "Creators", href: "/creators" },
        { key: "campaigns", label: "Campaigns", href: "/campaigns" },
        { key: "reports", label: "Reports", href: "/reports" },
      ],
      campaigns,
      tasks: openTasks,
      stats: {
        activeCampaigns: activeCampaignCount,
        openTasks: openTasks.length,
        pendingCreatorLeads: creatorLeads.PENDING_ANALYSIS ?? 0,
        creatorLeads,
        shortlists: shortlistCount,
        matchRuns: matchRunCount,
      },
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
