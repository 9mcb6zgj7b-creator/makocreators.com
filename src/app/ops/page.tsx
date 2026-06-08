import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

const creators = [
  {
    name: "Ava Chen",
    handle: "@avaskinnotes",
    channel: "TikTok",
    audience: "Gen Z skincare beginners",
    score: 92,
    path: "Product seeding",
    pathClass: "seed",
    stage: "Needs approval",
    risk: "Sample shipment approval required",
    driver: "Strong ingredient education match with high trust around sensitive-skin routines.",
    draft: "Invite Ava to try the serum first, then decide whether it earns a place in a routine video.",
  },
  {
    name: "Mina Park",
    handle: "@minamakes",
    channel: "Instagram",
    audience: "Millennial clean beauty buyers",
    score: 86,
    path: "AI content collab",
    pathClass: "ai",
    stage: "Draft ready",
    risk: "Usage rights discussion gated",
    driver: "Strong visual language for creator-style scripts without personal-use claims.",
    draft: "Prepare a calm shelf-edit concept that frames GlowLab as a product discovery.",
  },
  {
    name: "Jules Rivera",
    handle: "@julesgetsready",
    channel: "YouTube Shorts",
    audience: "Busy professionals building simple routines",
    score: 81,
    path: "Product seeding",
    pathClass: "seed",
    stage: "Needs approval",
    risk: "Follow-up send approval required",
    driver: "Useful routine context and strong product fit, with moderate engagement.",
    draft: "Follow up with a no-pressure seeding idea for a travel kit series.",
  },
  {
    name: "Nora Smith",
    handle: "@noraformulas",
    channel: "TikTok",
    audience: "Ingredient-conscious shoppers",
    score: 68,
    path: "Hold",
    pathClass: "hold",
    stage: "Research needed",
    risk: "Brand safety review needed",
    driver: "Good category overlap, but recent comparative claims need review.",
    draft: "Hold outreach until brand safety context is reviewed.",
  },
];

const approvals = [
  {
    type: "Send outreach",
    title: "Approve Ava outreach draft",
    summary: "Personalized product seeding message is ready. Human approval is required before any external send.",
    risk: "Medium",
  },
  {
    type: "Send follow-up",
    title: "Approve Jules follow-up",
    summary: "Follow-up draft avoids payment language and asks only about product trial interest.",
    risk: "Medium",
  },
  {
    type: "Usage rights",
    title: "Review usage rights boundary",
    summary: "Mako prepared a concept, but usage rights must be handled by a human before paid media.",
    risk: "High",
  },
];

const pipeline = [
  { label: "Scored", count: 4 },
  { label: "Draft ready", count: 2 },
  { label: "Needs approval", count: 3 },
  { label: "Approved for action", count: 1 },
];

const agentSteps = [
  ["Normalize profiles", "Completed", "Creator handles, channels, audience notes, and prior context were mapped into campaign records."],
  ["Score creator fit", "Completed", "Mako scored audience fit, content quality, brand safety, product relevance, and engagement signal."],
  ["Select path", "Completed", "Creators were split between product seeding, AI content collaboration, and hold."],
  ["Draft internal output", "Completed", "Outreach and concept drafts were prepared for internal review only."],
  ["Guardrail scan", "Completed", "Payment promises, usage-rights commitments, first-person false claims, and external sends were blocked."],
  ["Route approvals", "Blocked for approval", "Sensitive next steps are waiting for human review."],
];

const blockedActions = [
  "Promise payment",
  "Approve paid collaboration",
  "Ship samples",
  "Agree to usage rights",
  "Send external messages",
  "Publish content or launch ads",
];

export default async function OpsPage() {
  const { user, workspace, role } = await requirePageContext("/ops");
  const highFit = creators.filter(creator => creator.score >= 80).length;
  const aiCandidates = creators.filter(creator => creator.path === "AI content collab").length;

  return (
    <AppShell
      activeNav="ops"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="ops-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Mako Creators MVP</p>
            <h1>Creator Ops Cockpit</h1>
            <p>Score creators, choose the right collaboration path, prepare safe drafts, and keep sensitive actions gated.</p>
          </div>
          <a className="new-plan-button" href="/campaigns/new">
            New Campaign
          </a>
        </div>

        <section className="ops-safety-strip" aria-label="Safety boundary">
          <Icon name="shield" />
          <div>
            <strong>Human approval is required for external actions.</strong>
            <span>Mako can recommend, draft, score, and queue. It cannot send, ship, promise payment, approve rights, publish, or launch ads.</span>
          </div>
        </section>

        <section className="ops-metrics" aria-label="Operations metrics">
          <Metric label="Creators scored" value={creators.length} note="Demo shortlist coverage" />
          <Metric label="High-fit creators" value={highFit} note="Score 80 or higher" />
          <Metric label="Approval items" value={approvals.length} note="Human review queue" />
          <Metric label="AI collab candidates" value={aiCandidates} note="No false first-person claims" />
        </section>

        <div className="ops-grid">
          <section className="ops-panel ops-panel-large" aria-labelledby="recommendations-title">
            <div className="ops-panel-header">
              <div>
                <h2 id="recommendations-title">Recommended next moves</h2>
                <p>Ranked by fit score, approval state, and campaign readiness.</p>
              </div>
            </div>
            <div className="ops-recommendation-list">
              {creators.map(creator => (
                <article className="ops-recommendation-card" key={creator.handle}>
                  <div>
                    <div className="ops-card-title-row">
                      <strong>{creator.name}</strong>
                      <span className="ops-score">{creator.score}</span>
                    </div>
                    <p>{creator.driver}</p>
                    <div className="ops-chip-row">
                      <span className={`ops-chip ${creator.pathClass}`}>{creator.path}</span>
                      <span className="ops-chip neutral">{creator.stage}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="ops-panel" aria-labelledby="pipeline-title">
            <h2 id="pipeline-title">Pipeline</h2>
            <div className="ops-pipeline-list">
              {pipeline.map(stage => (
                <div className="ops-pipeline-row" key={stage.label}>
                  <span>{stage.label}</span>
                  <strong>{stage.count}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="ops-grid">
          <section className="ops-panel ops-panel-large" aria-labelledby="scoring-title">
            <h2 id="scoring-title">Creator scoring</h2>
            <div className="ops-table" role="table" aria-label="Creator scores">
              <div className="ops-table-head" role="row">
                <span>Creator</span>
                <span>Audience</span>
                <span>Path</span>
                <span>Risk</span>
              </div>
              {creators.map(creator => (
                <div className="ops-table-row" role="row" key={creator.handle}>
                  <span>
                    <strong>{creator.name}</strong>
                    <small>{creator.handle} · {creator.channel}</small>
                  </span>
                  <span>{creator.audience}</span>
                  <span className={`ops-chip ${creator.pathClass}`}>{creator.path}</span>
                  <span>{creator.risk}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="ops-panel" aria-labelledby="draft-title">
            <h2 id="draft-title">Safe draft package</h2>
            <div className="ops-draft-stack">
              {creators.slice(0, 3).map(creator => (
                <article className="ops-draft-card" key={creator.handle}>
                  <strong>{creator.name}</strong>
                  <p>{creator.draft}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="ops-grid">
          <section className="ops-panel" aria-labelledby="approval-title">
            <h2 id="approval-title">Approval queue</h2>
            <div className="ops-approval-list">
              {approvals.map(item => (
                <article className="ops-approval-card" key={item.title}>
                  <div className="ops-card-title-row">
                    <strong>{item.title}</strong>
                    <span className={`ops-risk ${item.risk.toLowerCase()}`}>{item.risk}</span>
                  </div>
                  <small>{item.type}</small>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="ops-panel ops-panel-large" aria-labelledby="agent-title">
            <h2 id="agent-title">Latest agent workflow</h2>
            <div className="ops-agent-timeline">
              {agentSteps.map(([title, state, summary]) => (
                <article className="ops-agent-step" key={title}>
                  <span className={state === "Blocked for approval" ? "blocked" : ""} />
                  <div>
                    <div className="ops-card-title-row">
                      <strong>{title}</strong>
                      <small>{state}</small>
                    </div>
                    <p>{summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="ops-panel" aria-labelledby="blocked-title">
          <h2 id="blocked-title">Blocked actions</h2>
          <div className="ops-blocked-grid">
            {blockedActions.map(action => (
              <span key={action}>{action}</span>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
