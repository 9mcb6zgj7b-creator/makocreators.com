import { prisma } from "@/lib/db";

const previewCampaign = {
  id: "preview-campaign-1",
  workspaceId: "preview-workspace-brand",
  name: "Los Angeles Restaurant Review Influencer Campaign",
  status: "DRAFT",
  budgetMin: 1200,
  budgetMax: 2400,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

export async function getDashboardData(workspaceId: string) {
  if (!process.env.DATABASE_URL) {
    const campaigns = [previewCampaign];
    return {
      campaigns,
      openTasks: [],
      stats: {
        activeCampaigns: 1,
        openTasks: 0,
        pendingCreatorLeads: 0,
        shortlists: 0,
        matchRuns: 0,
      },
    };
  }

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
  if (!process.env.DATABASE_URL) {
    return [previewCampaign].slice(0, take);
  }

  return prisma.campaign.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getReportSummary(workspaceId: string) {
  if (!process.env.DATABASE_URL) {
    const campaigns = [previewCampaign];
    return {
      campaigns,
      totalBudgetMin: previewCampaign.budgetMin,
      totalBudgetMax: previewCampaign.budgetMax,
      publishedContentCount: 0,
    };
  }

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
