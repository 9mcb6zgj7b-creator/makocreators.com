// [Claude 2026-06-16] Merged Home + Ops into one campaign-scoped page.
// The campaign selector at the top is a URL search param (?campaignId=xxx) so the
// server renders the right campaign context. Ops cockpit content lives here directly.
import { redirect } from "next/navigation";
import { AppShell, Icon } from "@/components/app-shell";
import { OpsMetricCards } from "@/components/ops-metric-cards";
import { OutreachPicksPanel } from "@/components/outreach-picks-panel";
import { TodayTodoPanel } from "@/components/today-todo-panel";
import { CampaignSelector } from "@/components/campaign-selector";
import { requirePageContext } from "@/lib/page-auth";
import { getDashboardData } from "@/lib/workspace-data";
import { getOpenOpsTasks, getOpsOverview, getWorkspaceCreatorListRows } from "@/lib/ops-overview";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { campaignId?: string } }) {
  const { user, workspace, role } = await requirePageContext("/dashboard");

  const [dashboard, overview, creatorRows, contactableCreatorRows, openTasks] = await Promise.all([
    getDashboardData(workspace.id),
    getOpsOverview(workspace.id),
    getWorkspaceCreatorListRows(workspace.id),
    getWorkspaceCreatorListRows(workspace.id, { contactableOnly: true }),
    getOpenOpsTasks(workspace.id),
  ]);

  // Default to first campaign if none selected
  const campaignId = searchParams.campaignId ?? dashboard.campaigns[0]?.id ?? "";
  const selectedCampaign = dashboard.campaigns.find(c => c.id === campaignId) ?? dashboard.campaigns[0] ?? null;

  const appUser = {
    name: user.name,
    email: user.email,
    phone: user.phone,
    workspaceName: workspace.name,
    role,
  };

  return (
    <AppShell activeNav="home" user={appUser}>
      <section className="ops-page">
        <div className="page-heading-row">
          <div className="dashboard-welcome">
            <h1>Welcome back, {user.name?.split(/[ @+]/)[0] || "there"}!</h1>
            {selectedCampaign ? (
              <p className="dashboard-campaign-context">
                Working on <strong>{selectedCampaign.name}</strong>
              </p>
            ) : (
              <p>Your creator campaign workspace is ready.</p>
            )}
          </div>
          <div className="dashboard-primary-actions">
            <CampaignSelector
              campaigns={dashboard.campaigns.map(c => ({ id: c.id, name: c.name }))}
              selectedId={campaignId}
            />
            <a className="new-plan-button secondary" href="/creators/import">
              Import Creators
            </a>
            <a className="new-plan-button" href="/campaigns/new">
              New Campaign
            </a>
          </div>
        </div>

        <section className="ops-safety-strip" aria-label="Safety boundary">
          <Icon name="shield" />
          <div>
            <strong>Human approval is required for external actions.</strong>
            <span>Mako can recommend, draft, score, and queue. It cannot send, ship, promise payment, approve rights, publish, or launch ads.</span>
          </div>
        </section>

        <TodayTodoPanel approvals={overview.approvals} tasks={openTasks}>
          <OutreachPicksPanel />
        </TodayTodoPanel>

        <OpsMetricCards
          metrics={overview.metrics}
          creators={creatorRows}
          contactableCreators={contactableCreatorRows}
          approvals={overview.approvals}
          reviewedApprovals={overview.reviewedApprovals}
          tasks={openTasks}
        />
      </section>
    </AppShell>
  );
}
