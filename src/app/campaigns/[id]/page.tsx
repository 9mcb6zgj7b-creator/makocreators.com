import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";
import { getWorkspaceCampaign } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function CampaignDetailPage({ params }: { params: { id: string } }) {
  const { user, workspace, role } = await requirePageContext(`/campaigns/${params.id}`);
  const campaign = await getWorkspaceCampaign(workspace.id, params.id);

  if (!campaign) {
    notFound();
  }

  return (
    <AppShell
      activeNav="campaigns"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="campaign-detail-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Campaign workspace</p>
            <h1>{campaign.name}</h1>
            <p>Review campaign setup and move creator operations through the approval-gated workflow.</p>
          </div>
          <a className="new-plan-button secondary" href="/campaigns">
            Back to Campaigns
          </a>
        </div>

        <section className="campaign-detail-grid" aria-label="Campaign details">
          <article className="campaign-detail-card">
            <span>Status</span>
            <strong>{formatStatus(campaign.status)}</strong>
            <p>Campaign state is internal until external actions are approved and completed by a human.</p>
          </article>
          <article className="campaign-detail-card">
            <span>Budget range</span>
            <strong>{formatBudget(campaign.budgetMin, campaign.budgetMax)}</strong>
            <p>Budget is planning context only. Mako does not approve payment or paid collaborations.</p>
          </article>
          <article className="campaign-detail-card">
            <span>Objective</span>
            <strong>{campaign.objective || "Not set"}</strong>
            <p>Use the campaign wizard to refine goals, audience, creator requirements, and content needs.</p>
          </article>
        </section>

        <section className="campaign-next-panel" aria-labelledby="campaign-next-title">
          <div>
            <h2 id="campaign-next-title">Next steps</h2>
            <p>Continue from campaign setup into creator import, ops review, approvals, and reports.</p>
          </div>
          <div className="campaign-next-actions">
            <a href="/creators/import">Import creators</a>
            <a href="/ops">Open Ops</a>
            <a href="/reports">View reports</a>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map(word => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatBudget(min: number | null, max: number | null) {
  if (!min && !max) return "-";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  return formatter.format(max || min || 0);
}
