import { FeatureBand, PublicHero, PublicSite } from "@/components/public-site";

export default function ForBrandsPage() {
  return (
    <PublicSite active="/for-brands">
      <PublicHero
        badge="For local brands"
        title="Launch creator campaigns without hiring an agency"
        text="Describe your business, upload your brief, and build a campaign flow that helps creators understand exactly what to make."
      />
      <FeatureBand
        title="What brands can do"
        items={[
          { title: "Create campaign briefs", text: "Move step by step through goals, product details, content rules, and publishing requirements." },
          { title: "Invite the right creators", text: "Use campaign context to review creators by city, niche, fit, and collaboration history." },
          { title: "Track performance", text: "See campaign spend, published content, and creator performance as the campaign matures." },
        ]}
      />
    </PublicSite>
  );
}
