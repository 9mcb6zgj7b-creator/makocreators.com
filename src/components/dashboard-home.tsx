import { AppShell, Icon, type AppShellUser } from "@/components/app-shell";
import type { getDashboardData } from "@/lib/workspace-data";

type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

const supportItems = [
  {
    title: "Contact Mako Creator Support",
    description: "Get help from our creator campaign support team.",
  },
  {
    title: "Review Creator Intake Progress",
    description: "Track creators waiting for analysis, review, and approval.",
  },
];

export function DashboardHome({ user, dashboard }: { user: AppShellUser; dashboard: DashboardData }) {
  const firstName = user.name?.split(/[ @+]/)[0] || "there";
  const selectedCampaign = dashboard.campaigns[0];

  return (
    <AppShell activeNav="home" user={user}>
      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <h1>Welcome back, {firstName}!</h1>
            <p>Your creator campaign workspace is ready.</p>
          </div>
          <div className="dashboard-primary-actions" aria-label="Primary workspace actions">
            <a className="new-plan-button secondary" href="/creators/import">
              Import Creators
            </a>
            <a className="new-plan-button" href="/campaigns/new">
              New Campaign
            </a>
          </div>
        </div>

        <section className="operation-panel" aria-labelledby="operation-title">
          <div className="operation-header">
            <h2 id="operation-title">Campaign Actions</h2>
            <label className="campaign-select">
              <span>Campaign</span>
              <select defaultValue={selectedCampaign?.id || ""}>
                {dashboard.campaigns.length ? (
                  dashboard.campaigns.map(campaign => (
                    <option value={campaign.id} key={campaign.id}>
                      {campaign.name}
                    </option>
                  ))
                ) : (
                  <option value="">No campaigns yet</option>
                )}
              </select>
            </label>
          </div>

          {dashboard.openTasks.length ? (
            <div className="task-list" aria-label="Open tasks">
              {dashboard.openTasks.map(task => (
                <article className="task-card" key={task.id}>
                  <span>{task.type.replaceAll("_", " ").toLowerCase()}</span>
                  <strong>{task.title}</strong>
                  {task.description ? <p>{task.description}</p> : null}
                  {task.campaign ? <small>{task.campaign.name}</small> : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true">
                <div className="paper" />
                <span className="spark spark-one" />
                <span className="spark spark-two" />
              </div>
              <strong>All clear. No pending tasks right now.</strong>
              <p>Creator reviews, content approvals, and campaign follow-ups will appear here once a campaign is active.</p>
            </div>
          )}
        </section>

        <section className="ops-entry-panel" aria-labelledby="ops-entry-title">
          <div>
            <span className="section-eyebrow">MVP workspace</span>
            <h2 id="ops-entry-title">Creator Ops Cockpit</h2>
            <p>Review saved creator contacts, prepare safe outreach drafts, and route every external send through human approval.</p>
            <div className="ops-entry-actions" aria-label="Creator ops shortcuts">
              <a href="/creators/import">Import creator emails or spreadsheet</a>
              <a href="/creators">Open Creator Workspace</a>
            </div>
            <div className="ops-entry-stats" aria-label="Creator ops status">
              <span>
                <strong>{dashboard.stats.pendingApprovals}</strong>
                Pending approvals
              </span>
              <span>
                <strong>{dashboard.stats.pendingCreatorLeads}</strong>
                Creator leads waiting review
              </span>
            </div>
          </div>
          <a className="new-plan-button" href="/ops">
            Open Ops
          </a>
        </section>

        <section className="workspace-stats" aria-label="Workspace stats">
          <article>
            <strong>{dashboard.stats.activeCampaigns}</strong>
            <span>Active campaigns</span>
          </article>
          <article>
            <strong>{dashboard.stats.pendingCreatorLeads}</strong>
            <span>Creators pending review</span>
          </article>
          <article>
            <strong>{dashboard.stats.pendingApprovals}</strong>
            <span>Pending approvals</span>
          </article>
          <article>
            <strong>{dashboard.stats.matchRuns}</strong>
            <span>Match runs</span>
          </article>
        </section>

        <section className="support-panel" aria-labelledby="support-title">
          <h2 id="support-title">We are here whenever you need help</h2>
          <div className="support-list">
            {supportItems.map(item => (
              <a className="support-row" href="/support" key={item.title}>
                <span className="support-icon">
                  <Icon name="support" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <Icon name="chevron" />
              </a>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
