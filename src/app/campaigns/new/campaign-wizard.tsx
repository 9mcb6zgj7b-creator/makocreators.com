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
    title: "Campaign information",
    description: "Tell creators what this campaign is and what outcome you want.",
  },
  {
    eyebrow: "3.2",
    title: "Product or service information",
    description: "Give creators the context they need to understand what they are promoting.",
  },
  {
    eyebrow: "3.3",
    title: "Content requirements",
    description: "Set deliverables, talking points, references, and anything creators should avoid.",
  },
];

const businessOptions = ["Restaurant", "Barbershop", "Spa", "Manicure", "Others"];
const launchCities = ["Los Angeles"];

export function CampaignWizard() {
  const [mode, setMode] = useState<"intro" | "wizard">("intro");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [customBusinessType, setCustomBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [campaignName, setCampaignName] = useState("Los Angeles Restaurant Review Influencer Campaign");
  const [goal, setGoal] = useState("Increase brand exposure and attract customers for Los Angeles restaurants");
  const [productName, setProductName] = useState("Los Angeles Restaurant Review Influencer Campaign");
  const progress = useMemo(() => `${activeStep + 1} / ${contentSteps.length}`, [activeStep]);
  const current = contentSteps[activeStep];
  const resolvedBusinessType = businessType === "Others" ? customBusinessType.trim() : businessType;

  function goNext() {
    setActiveStep(step => Math.min(step + 1, contentSteps.length - 1));
  }

  function goBack() {
    if (mode === "intro") {
      window.location.assign("/campaigns");
      return;
    }
    if (activeStep === 0) {
      setMode("intro");
      return;
    }
    setActiveStep(step => Math.max(step - 1, 0));
  }

  function chooseBusiness(option: string) {
    setBusinessType(option);
    setCity("");
  }

  function enterWizard() {
    const businessLabel = resolvedBusinessType || "Local service";
    const marketLabel = city || "Los Angeles";
    setCampaignName(`${marketLabel} ${businessLabel} Creator Campaign`);
    setProductName(`${marketLabel} ${businessLabel}`);
    setGoal(`Increase visibility and attract more qualified local customers in ${marketLabel} for this ${businessLabel.toLowerCase()} business.`);
    setMode("wizard");
    setActiveStep(0);
  }

  if (mode === "intro") {
    return (
      <main className="campaign-intake">
        <header className="campaign-intake-header">
          <button type="button" className="campaign-intake-back" onClick={goBack}>
            Back
          </button>
        </header>

        <section className="campaign-intake-shell">
          <div className="campaign-chat-thread" aria-label="Campaign setup conversation">
            <article className="campaign-message assistant">
              <div className="campaign-message-avatar" aria-hidden="true">
                <span>m</span>
              </div>
              <div className="campaign-message-bubble">
                <p className="campaign-message-label">Mako Creator</p>
                <h1>What kind of business are you running?</h1>
                <p>I’ll tailor the campaign setup for your business and local market.</p>
              </div>
            </article>

            <div className="campaign-reply-group">
              <div className="campaign-quick-replies">
                {businessOptions.map(option => (
                  <button
                    key={option}
                    type="button"
                    className={`campaign-reply-chip ${businessType === option ? "selected" : ""}`}
                    onClick={() => chooseBusiness(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {businessType === "Others" ? (
                <label className="campaign-inline-field" htmlFor="custom-business-type">
                  <span>Type your business</span>
                  <input
                    id="custom-business-type"
                    value={customBusinessType}
                    onChange={event => {
                      setCustomBusinessType(event.target.value);
                      setCity("");
                    }}
                    placeholder="Roofing, dental clinic, med spa, pet grooming..."
                  />
                </label>
              ) : null}
            </div>

            {resolvedBusinessType ? (
              <article className="campaign-message user">
                <div className="campaign-message-bubble">
                  <p>{resolvedBusinessType}</p>
                </div>
              </article>
            ) : null}

            {resolvedBusinessType ? (
              <>
                <article className="campaign-message assistant">
                  <div className="campaign-message-avatar" aria-hidden="true">
                    <span>m</span>
                  </div>
                  <div className="campaign-message-bubble">
                    <p className="campaign-message-label">Mako Creator</p>
                    <h2>Which city are you starting with?</h2>
                    <p>We’re opening with Los Angeles first, then expanding to more U.S. cities.</p>
                  </div>
                </article>

                <div className="campaign-reply-group">
                  <div className="campaign-quick-replies">
                    {launchCities.map(option => (
                      <button
                        key={option}
                        type="button"
                        className={`campaign-reply-chip ${city === option ? "selected" : ""}`}
                        onClick={() => setCity(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p className="campaign-context-note">More cities will appear here as we expand.</p>
                </div>
              </>
            ) : null}

            {city ? (
              <article className="campaign-message user">
                <div className="campaign-message-bubble">
                  <p>{city}</p>
                </div>
              </article>
            ) : null}

            {city ? (
              <article className="campaign-message assistant campaign-next-message">
                <div className="campaign-message-avatar" aria-hidden="true">
                  <span>m</span>
                </div>
                <div className="campaign-message-bubble">
                  <p className="campaign-message-label">Mako Creator</p>
                  <p>Perfect. I’ll set up the next questions for a ${city} ${resolvedBusinessType.toLowerCase()} campaign.</p>
                </div>
              </article>
            ) : null}
          </div>

          <div className="campaign-composer-shell">
            <div className="campaign-composer">
              <div className="campaign-composer-copy">
                <strong>Ready to continue</strong>
                <span>We’ll use your answers to personalize the full campaign setup.</span>
              </div>
              <button type="button" className="campaign-start-button" disabled={!city} onClick={enterWizard}>
                Continue
              </button>
            </div>
          </div>
        </section>
      </main>
    );
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
            {activeStep === 0 ? (
              <CampaignInfoStep campaignName={campaignName} goal={goal} onCampaignName={setCampaignName} onGoal={setGoal} />
            ) : null}
            {activeStep === 1 ? <ProductInfoStep productName={productName} onProductName={setProductName} /> : null}
            {activeStep === 2 ? <ContentRequirementsStep /> : null}
          </div>
        </section>
      </section>

      <footer className="wizard-footer">
        <button type="button" onClick={goBack}>
          Back
        </button>
        <button type="button" onClick={goNext} disabled={activeStep === contentSteps.length - 1}>
          {activeStep === contentSteps.length - 1 ? "Ready for Budget" : "Next"}
        </button>
      </footer>
    </main>
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