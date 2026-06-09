import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";
import { getReportSummary } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const { user, workspace, role } = await requirePageContext("/reports");
  const summary = await getReportSummary(workspace.id);
  const firstName = user.name?.split(/[ @+]/)[0] || "there";
  const selectedCampaign = summary.campaigns[0];

  return (
    <AppShell
      activeNav="reports"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="reports-page">
        <div className="reports-hero">
          <div>
            <h1>Welcome back, {firstName}!</h1>
            <p>Review campaign budget, creator performance, and published content.</p>
          </div>
          <a className="new-plan-button" href="/campaigns/new">
            New Campaign
          </a>
        </div>

        <section className="report-filters" aria-labelledby="report-filters-title">
          <h2 id="report-filters-title">Select Campaign</h2>
          <div className="filter-row">
            <select aria-label="Campaign">
              {summary.campaigns.length ? (
                summary.campaigns.map(campaign => (
                  <option value={campaign.id} key={campaign.id}>
                    {campaign.name}
                  </option>
                ))
              ) : (
                <option>No campaigns yet</option>
              )}
            </select>
            <span>Period</span>
            <select aria-label="Period">
              <option>Select a period</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </section>

        <section className="report-panel budget-panel" aria-labelledby="budget-title">
          <div className="report-panel-header">
            <h2 id="budget-title">Budget</h2>
            <button className="panel-icon-button" type="button" aria-label="Budget options">
              <span className="dot-grid" />
            </button>
          </div>

          <div className="info-banner">
            <span className="info-icon">i</span>
            <p>Your budget determines how many creators can join the campaign. Increase it if you want AI to match more creators and maximize campaign impact.</p>
            <button type="button" aria-label="Dismiss budget note">
              <Icon name="close" />
            </button>
          </div>

          <a className="billing-link" href="/billing">
            View Billing History
          </a>

          <div className="budget-grid">
            <article className="metric-card">
              <strong>Total Spend</strong>
              <p>Includes creator fees, platform fees, and applicable service fees.</p>
              <span>{summary.publishedContentCount ? "Available after billing sync" : "-"}</span>
            </article>
            <article className="metric-card">
              <div>
                <strong>Budget</strong>
                <button className="edit-button" type="button" aria-label="Edit budget">
                  <Icon name="edit" />
                </button>
              </div>
              <p>Your budget helps Mako Creator prepare creator recommendations for human review.</p>
              <span>{formatBudget(summary.totalBudgetMin, summary.totalBudgetMax)}</span>
            </article>
          </div>
        </section>

        <section className="report-panel performance-panel" aria-labelledby="performance-title">
          <div className="performance-header">
            <h2 id="performance-title">Overall Performance</h2>
            <div className="report-actions">
              <div className="segment-control" role="tablist" aria-label="Report view">
                <button className="active" type="button">Campaign</button>
                <button type="button">By Creator</button>
              </div>
              <button className="download-button" type="button">
                <Icon name="download" />
                Download
              </button>
            </div>
          </div>

          <div className="report-empty">
            <div className="empty-report-art" aria-hidden="true">
              <span className="chart-card" />
              <span className="donut-card" />
            </div>
            <p>{selectedCampaign ? "Performance data will appear after the campaign starts." : "No data yet"}</p>
          </div>

          <section className="published-section" aria-labelledby="published-title">
            <h2 id="published-title">Published Content</h2>
            <div className="report-empty media-empty">
              <div className="empty-media-art" aria-hidden="true">
                <span className="media-doc" />
                <span className="media-tile" />
              </div>
              <p>{summary.publishedContentCount ? `${summary.publishedContentCount} published items` : "No published content yet"}</p>
            </div>
          </section>
        </section>
      </section>
    </AppShell>
  );
}

function formatBudget(min: number, max: number) {
  if (!min && !max) return "-";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  return formatter.format(max || min);
}
