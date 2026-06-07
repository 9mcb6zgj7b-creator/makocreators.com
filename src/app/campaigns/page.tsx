import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";
import { getWorkspaceCampaigns } from "@/lib/workspace-data";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const { user, workspace, role } = await requirePageContext("/campaigns");
  const campaigns = await getWorkspaceCampaigns(workspace.id);

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
      <section className="campaigns-page">
        <div className="page-heading-row">
          <h1>Campaign List</h1>
          <a className="new-plan-button" href="/campaigns/new">
            New Campaign
          </a>
        </div>

        {campaigns.length ? (
          <div className="campaign-grid" aria-label="Campaigns">
            {campaigns.map(campaign => (
              <article className="campaign-card" key={campaign.id}>
                <a className="campaign-card-main" href={`/campaigns/${campaign.id}`}>
                  <span className="campaign-icon-box" aria-hidden="true">
                    <Icon name="building" />
                  </span>
                  <h2>{campaign.name}</h2>
                </a>

                <div className="campaign-card-footer">
                  <span className="status-badge">
                    <span />
                    {formatStatus(campaign.status)}
                  </span>
                  <button className="more-button" type="button" aria-label={`More actions for ${campaign.name}`}>
                    <Icon name="more" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <section className="campaign-empty-panel" aria-label="No campaigns">
            <div className="empty-illustration" aria-hidden="true">
              <div className="paper" />
              <span className="spark spark-one" />
              <span className="spark spark-two" />
            </div>
            <strong>No campaigns yet</strong>
            <p>Create your first campaign to start matching creators, reviewing shortlists, and tracking performance.</p>
          </section>
        )}
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
