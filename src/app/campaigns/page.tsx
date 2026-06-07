import { AppShell, Icon } from "@/components/app-shell";

const campaigns = [
  {
    id: "la-restaurant-review",
    name: "Los Angeles Restaurant Review Influencer Campaign",
    status: "Draft",
  },
];

export default function CampaignsPage() {
  return (
    <AppShell activeNav="campaigns">
      <section className="campaigns-page">
        <div className="page-heading-row">
          <h1>Campaign List</h1>
          <button className="new-plan-button" type="button">
            New Campaign
          </button>
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
