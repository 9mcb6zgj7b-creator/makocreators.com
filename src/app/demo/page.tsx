import { PublicSite } from "@/components/public-site";

export default function DemoPage() {
  return (
    <PublicSite active="/demo">
      <section className="public-simple-page demo-page">
        <span className="public-badge">Demo</span>
        <h1>Book a walkthrough</h1>
        <p>Use this page as the demo placeholder while we connect scheduling. The production version can embed Calendly or route to your sales form.</p>
        <div className="demo-panel">
          <h2>What we will cover</h2>
          <p>Campaign setup, creator strategy, brief generation, creator database, and reporting.</p>
          <a href="/signup/brand">Start with a workspace</a>
        </div>
      </section>
    </PublicSite>
  );
}
