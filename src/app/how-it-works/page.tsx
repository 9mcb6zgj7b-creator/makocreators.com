import { PublicSite } from "@/components/public-site";

const steps = [
  { title: "Create a campaign", text: "Add campaign goals, product details, and content requirements one step at a time." },
  { title: "Shape the creator strategy", text: "Use references, competitor videos, and ideal creator notes to guide matching." },
  { title: "Review and shortlist", text: "Compare creators, keep notes, and move the best fits into campaign shortlists." },
  { title: "Track outcomes", text: "Use reports to understand budget, published content, and performance." },
];

export default function HowItWorksPage() {
  return (
    <PublicSite active="/how-it-works">
      <section className="public-simple-page">
        <span className="public-badge">Workflow</span>
        <h1>How Mako Creator works</h1>
        <p>The product is campaign-first: creators, briefs, shortlists, outreach, and reports all stay attached to the campaign they belong to.</p>
        <div className="process-list">
          {steps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicSite>
  );
}
