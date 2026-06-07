import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

const campaigns = [
  {
    id: "la-restaurant-review",
    name: "Los Angeles Restaurant Review Influencer Campaign",
    status: "Draft",
  },
];

export default async function CampaignsPage() {
  const { user, workspace, role } = await requirePageContext("/campaigns");

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
                  {campaign.status}
                </span>
                <button className="more-button" type="button" aria-label={`More actions for ${campaign.name}`}>
                  <Icon name="more" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
