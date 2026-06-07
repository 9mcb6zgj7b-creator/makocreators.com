"use client";

import { useMemo, useState } from "react";

const majorSteps = [
  { label: "Create Campaign", state: "done" },
  { label: "Optimize Creator Strategy", state: "done" },
  { label: "Set Content Brief", state: "active" },
  { label: "Set Budget & Publish", state: "upcoming" },
];

const contentSteps = [
  {
    eyebrow: "3.1",
    title: "Paste or upload your content brief",
    description: "Add an existing creator brief, product link, campaign notes, or upload a file. We will structure it for creators.",
  },
  {
    eyebrow: "3.2",
    title: "Campaign information",
    description: "Tell creators what this campaign is and what outcome you want.",
  },
  {
    eyebrow: "3.3",
    title: "Product or service information",
    description: "Give creators the context they need to understand what they are promoting.",
  },
  {
    eyebrow: "3.4",
    title: "Content requirements",
    description: "Set deliverables, talking points, references, and anything creators should avoid.",
  },
];

export function CampaignWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [campaignName, setCampaignName] = useState("Los Angeles Restaurant Review Influencer Campaign");
  const [goal, setGoal] = useState("Increase brand exposure and attract customers for Los Angeles restaurants");
  const [productName, setProductName] = useState("Los Angeles Restaurant Review Influencer Campaign");
  const progress = useMemo(() => `${activeStep + 1} / ${contentSteps.length}`, [activeStep]);
  const current = contentSteps[activeStep];

  function goNext() {
    setActiveStep(step => Math.min(step + 1, contentSteps.length - 1));
  }

  function goBack() {
    if (activeStep === 0) {
      window.location.assign("/campaigns");
      return;
    }
    setActiveStep(step => Math.max(step - 1, 0));
  }

  return (
    <main className="campaign-wizard">
      <header className="campaign-wizard-header">
        <a className="wizard-brand" href="/dashboard" aria-label="Mako Creator">
          <span>m</span>
          <strong>Mako Creator</strong>
        </a>

        <ol className="wizard-stepper" aria-label="Campaign setup progress">
          {majorSteps.map((step, index) => (
            <li className={`wizard-step ${step.state}`} key={step.label}>
              <span>{step.state === "done" ? "✓" : index + 1}</span>
              <strong>{step.label}</strong>
            </li>
          ))}
        </ol>

        <a className="wizard-exit" href="/campaigns">
          Save & Exit
        </a>
      </header>

      <section className="campaign-wizard-body">
        <aside className="creator-visible-banner">
          <strong>Invited creators will see the content you add in this section.</strong>
          <span>This helps them understand your campaign, product, and creative requirements before accepting.</span>
          <button type="button" aria-label="Dismiss note">×</button>
        </aside>

        <section className="wizard-card" aria-labelledby="wizard-step-title">
          <div className="wizard-card-header">
            <div>
              <span className="wizard-eyebrow">{current.eyebrow}</span>
              <h1 id="wizard-step-title">{current.title}</h1>
              <p>{current.description}</p>
            </div>
            <span className="wizard-progress">{progress}</span>
          </div>

          <div className="wizard-step-content">
            {activeStep === 0 ? <BriefStep /> : null}
            {activeStep === 1 ? (
              <CampaignInfoStep campaignName={campaignName} goal={goal} onCampaignName={setCampaignName} onGoal={setGoal} />
            ) : null}
            {activeStep === 2 ? <ProductInfoStep productName={productName} onProductName={setProductName} /> : null}
            {activeStep === 3 ? <ContentRequirementsStep /> : null}
          </div>
        </section>
      </section>

      <footer className="wizard-footer">
        <button type="button" onClick={goBack}>
          {activeStep === 0 ? "Back to Campaigns" : "Back"}
        </button>
        <button type="button" onClick={goNext} disabled={activeStep === contentSteps.length - 1}>
          {activeStep === contentSteps.length - 1 ? "Ready for Budget" : "Next"}
        </button>
      </footer>
    </main>
  );
}

function BriefStep() {
  return (
    <div className="brief-step">
      <label className="wizard-field">
        <span>Brief text, product link, or campaign notes</span>
        <textarea rows={7} placeholder="Paste your creator brief, product URL, campaign goal, offer details, or content notes..." />
      </label>
      <div className="brief-upload" role="button" tabIndex={0}>
        <span>Click to upload or drag files here</span>
        <strong>PDF, DOCX, PPT</strong>
      </div>
      <button className="brief-generate" type="button" disabled>
        Generate structured brief
      </button>
    </div>
  );
}

function CampaignInfoStep({
  campaignName,
  goal,
  onCampaignName,
  onGoal,
}: {
  campaignName: string;
  goal: string;
  onCampaignName: (value: string) => void;
  onGoal: (value: string) => void;
}) {
  return (
    <div className="field-stack">
      <label className="wizard-field">
        <span>Campaign Name <strong>*</strong></span>
        <input value={campaignName} maxLength={50} onChange={event => onCampaignName(event.target.value)} />
        <small>{campaignName.length} / 50</small>
      </label>

      <label className="wizard-field">
        <span>Campaign Background / Goal <em>Optional</em></span>
        <textarea value={goal} rows={5} onChange={event => onGoal(event.target.value)} />
        <p>Creators can make better content when they understand the goal. A few sentences are enough.</p>
      </label>
    </div>
  );
}

function ProductInfoStep({ productName, onProductName }: { productName: string; onProductName: (value: string) => void }) {
  return (
    <div className="product-step-grid">
      <section className="logo-upload-card" aria-labelledby="logo-title">
        <h2 id="logo-title">Product Logo</h2>
        <div className="logo-upload-box">
          <span className="logo-placeholder" aria-hidden="true" />
          <button type="button">Upload</button>
        </div>
      </section>

      <div className="field-stack">
        <label className="wizard-field">
          <span>Product Name <strong>*</strong></span>
          <input value={productName} onChange={event => onProductName(event.target.value)} />
        </label>

        <label className="wizard-field">
          <span>Product / Service Description</span>
          <textarea rows={6} placeholder="Describe what creators should know about your product, service, offer, location, audience, and any content boundaries." />
        </label>
      </div>
    </div>
  );
}

function ContentRequirementsStep() {
  return (
    <div className="requirement-grid">
      <label className="wizard-field">
        <span>Required Deliverables</span>
        <textarea rows={4} placeholder="Example: 1 TikTok video, 1 Instagram Reel, 3 story frames..." />
      </label>
      <label className="wizard-field">
        <span>Talking Points</span>
        <textarea rows={4} placeholder="Example: location, signature dishes, special offer, booking link..." />
      </label>
      <label className="wizard-field">
        <span>Reference Links</span>
        <textarea rows={4} placeholder="Paste creator examples, competitor videos, moodboard links, or product pages..." />
      </label>
      <label className="wizard-field">
        <span>Do Not Mention</span>
        <textarea rows={4} placeholder="Competitors, expired promos, restricted claims, or sensitive topics..." />
      </label>
    </div>
  );
}
