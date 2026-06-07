import { PublicSite } from "@/components/public-site";

const plans = [
  { name: "Starter", price: "Free", text: "Build your first creator campaign workspace and test the workflow." },
  { name: "Campaign", price: "10%", text: "A flat platform fee when paid creator collaborations go live." },
  { name: "Managed", price: "Custom", text: "Hands-on support for teams that want strategy, setup, and reporting help." },
];

export default function PricingPage() {
  return (
    <PublicSite active="/pricing">
      <section className="public-simple-page">
        <span className="public-badge">Pricing</span>
        <h1>Simple pricing for creator campaigns</h1>
        <p>Start with the product workflow, then scale into campaign fees and managed support as your creator program grows.</p>
        <div className="pricing-grid">
          {plans.map(plan => (
            <article key={plan.name}>
              <h2>{plan.name}</h2>
              <strong>{plan.price}</strong>
              <p>{plan.text}</p>
              <a href="/signup/brand">Get started</a>
            </article>
          ))}
        </div>
      </section>
    </PublicSite>
  );
}
