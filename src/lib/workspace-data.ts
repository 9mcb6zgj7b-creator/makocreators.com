import { prisma } from "@/lib/db";

export async function getDashboardData(workspaceId: string) {
  const [campaigns, openTasks, creatorLeadCounts, activeCampaignCount, shortlistCount, matchRunCount] = await Promise.all([
    getWorkspaceCampaigns(workspaceId, 20),
    prisma.dashboardTask.findMany({
      where: {
        workspaceId,
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
      where: { workspaceId },
      _count: { _all: true },
    }),
    prisma.campaign.count({
      where: { workspaceId, status: { in: ["DRAFT", "ACTIVE"] } },
    }),
    prisma.shortlist.count({ where: { workspaceId } }),
    prisma.creatorMatchRun.count({ where: { workspaceId } }),
  ]);

  const creatorLeads = creatorLeadCounts.reduce<Record<string, number>>((counts, item) => {
    counts[item.status] = item._count._all;
    return counts;
  }, {});

  return {
    campaigns,
    openTasks,
    stats: {
      activeCampaigns: activeCampaignCount,
      openTasks: openTasks.length,
      pendingCreatorLeads: creatorLeads.PENDING_ANALYSIS ?? 0,
      shortlists: shortlistCount,
      matchRuns: matchRunCount,
    },
  };
}

export async function getWorkspaceCampaigns(workspaceId: string, take = 100) {
  return prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getReportSummary(workspaceId: string) {
  const [campaigns, publishedContentCount] = await Promise.all([
    getWorkspaceCampaigns(workspaceId, 100),
    prisma.outreachDraft.count({ where: { workspaceId, status: "SENT" } }),
  ]);

  const totalBudgetMin = campaigns.reduce((sum, campaign) => sum + (campaign.budgetMin ?? 0), 0);
  const totalBudgetMax = campaigns.reduce((sum, campaign) => sum + (campaign.budgetMax ?? 0), 0);

  return {
    campaigns,
    totalBudgetMin,
    totalBudgetMax,
    publishedContentCount,
  };
}
