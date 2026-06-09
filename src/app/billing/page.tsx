import { AppShell } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";
import { getReportSummary } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { user, workspace, role } = await requirePageContext("/billing");
  const summary = await getReportSummary(workspace.id);

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
      <section className="billing-page">
        <div className="page-heading-row">
          <div>
            <h1>Billing</h1>
            <p>Review campaign budget ranges and billing readiness before payment features are connected.</p>
          </div>
          <a className="new-plan-button secondary" href="/reports">
            Back to Reports
          </a>
        </div>

        <section className="report-panel budget-panel" aria-labelledby="billing-summary-title">
          <div className="report-panel-header">
            <h2 id="billing-summary-title">Billing Summary</h2>
          </div>

          <div className="budget-grid">
            <article className="metric-card">
              <strong>Campaign budget range</strong>
              <p>Budget is used for planning and creator recommendation context.</p>
              <span>{formatBudget(summary.totalBudgetMin, summary.totalBudgetMax)}</span>
            </article>
            <article className="metric-card">
              <strong>Payment status</strong>
              <p>Payment collection, escrow, and payout workflows are not connected in the MVP.</p>
              <span>Not connected</span>
            </article>
          </div>
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
