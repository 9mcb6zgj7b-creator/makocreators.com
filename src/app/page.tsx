import { FeatureBand, PublicHero, PublicSite } from "@/components/public-site";

export default function HomePage() {
  return (
    <PublicSite active="/">
      <PublicHero
        badge="Chosen by local service teams"
        title="The first of its kind Creator Network for local services"
        text="Mako Creator helps restaurants, beauty studios, home services, wellness teams, and local operators find creators, brief them clearly, and manage campaigns from one workspace."
      />
      <FeatureBand
        title="Built for campaigns that need real local context"
        items={[
          {
            title: "Campaign-first matching",
            text: "Every creator search starts from a campaign brief, goals, references, budget, and content requirements.",
          },
          {
            title: "Creator-facing briefs",
            text: "Turn scattered notes, links, and docs into structured instructions creators can actually follow.",
          },
          {
            title: "One workspace",
            text: "Keep campaigns, creator records, shortlists, outreach, and reports connected under the same account.",
          },
        ]}
      />
    </PublicSite>
  );
}
