import { AppShell, Icon } from "@/components/app-shell";

export default function ReportsPage() {
  return (
    <AppShell activeNav="reports">
      <section className="reports-page">
        <div className="reports-hero">
          <div>
            <h1>Welcome back, Mike Liu!</h1>
            <p>Review campaign budget, creator performance, and published content.</p>
          </div>
          <button className="new-plan-button" type="button">
            New Campaign
          </button>
        </div>

        <section className="report-filters" aria-labelledby="report-filters-title">
          <h2 id="report-filters-title">Select Campaign</h2>
          <div className="filter-row">
            <select aria-label="Campaign">
              <option>Select a campaign</option>
              <option>Los Angeles Restaurant Review Influencer Campaign</option>
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
              <span>-</span>
            </article>
            <article className="metric-card">
              <div>
                <strong>Budget</strong>
                <button className="edit-button" type="button" aria-label="Edit budget">
                  <Icon name="edit" />
                </button>
              </div>
              <p>Your budget determines how many creators Mako Creator can invite.</p>
              <span>-</span>
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
            <p>No data yet</p>
          </div>

          <section className="published-section" aria-labelledby="published-title">
            <h2 id="published-title">Published Content</h2>
            <div className="report-empty media-empty">
              <div className="empty-media-art" aria-hidden="true">
                <span className="media-doc" />
                <span className="media-tile" />
              </div>
              <p>No published content yet</p>
            </div>
          </section>
        </section>
      </section>
    </AppShell>
  );
}
