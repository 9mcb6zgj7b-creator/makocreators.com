import { FeatureBand, PublicHero, PublicSite } from "@/components/public-site";

export default function ForCreatorsPage() {
  return (
    <PublicSite active="/for-creators">
      <PublicHero
        badge="For creators"
        title="Find local campaigns that fit your voice"
        text="Mako Creator is being built so creators can understand campaign expectations upfront and choose work that matches their audience."
        primaryHref="/signup/creator"
        primaryLabel="Join as a creator"
      />
      <FeatureBand
        title="Creator experience"
        items={[
          { title: "Clear campaign context", text: "See the brand, product, content requirements, and reference links before deciding." },
          { title: "Better fit", text: "Campaigns are organized around creator style, audience, city, category, and past performance." },
          { title: "Simple workspace", text: "Keep campaign opportunities, notes, and communication easier to manage." },
        ]}
      />
    </PublicSite>
  );
}
