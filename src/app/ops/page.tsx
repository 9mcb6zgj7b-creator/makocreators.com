import { AppShell, Icon } from "@/components/app-shell";
import { OpsMetricCards } from "@/components/ops-metric-cards";
import { OutreachPicksPanel } from "@/components/outreach-picks-panel";
import { TodayTodoPanel } from "@/components/today-todo-panel";
import { getOpenOpsTasks, getOpsOverview, getWorkspaceCreatorListRows } from "@/lib/ops-overview";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const { user, workspace, role } = await requirePageContext("/ops");
  const [overview, creatorRows, contactableCreatorRows, openTasks] = await Promise.all([
    getOpsOverview(workspace.id),
    getWorkspaceCreatorListRows(workspace.id),
    getWorkspaceCreatorListRows(workspace.id, { contactableOnly: true }),
    getOpenOpsTasks(workspace.id),
  ]);

  return (
    <AppShell
      activeNav="ops"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="ops-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Mako Creators MVP</p>
            <h1>Creator Ops Cockpit</h1>
            <p>Score creators, choose the right collaboration path, prepare safe drafts, and keep sensitive actions gated.</p>
          </div>
          <a className="new-plan-button" href="/campaigns/new">
            New Campaign
          </a>
        </div>

        <section className="ops-safety-strip" aria-label="Safety boundary">
          <Icon name="shield" />
          <div>
            <strong>Human approval is required for external actions.</strong>
            <span>Mako can recommend, draft, score, and queue. It cannot send, ship, promise payment, approve rights, publish, or launch ads.</span>
          </div>
        </section>

        {/* [Claude 2026-06-11] "Today's To-Do" replaces the standalone picks panel and
            the 1-5 workflow strip: one card with everything to clear today. */}
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
