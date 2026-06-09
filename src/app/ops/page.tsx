import { AppShell, Icon } from "@/components/app-shell";
import { ApprovalActions } from "@/components/approval-actions";
import { getOpsOverview } from "@/lib/ops-overview";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function OpsPage() {
  const { user, workspace, role } = await requirePageContext("/ops");
  const overview = await getOpsOverview(workspace.id);

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

        <section className="ops-workflow-strip" aria-label="Core MVP workflow">
          {coreWorkflowSteps.map((step, index) => (
            <article key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.summary}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="ops-metrics" aria-label="Operations metrics">
          {overview.metrics.map(metric => (
            <Metric label={metric.label} value={metric.value} note={metric.note} key={metric.label} />
          ))}
        </section>

        <div className="ops-grid">
          <section className="ops-panel ops-panel-large" aria-labelledby="recommendations-title">
            <div className="ops-panel-header">
              <div>
                <h2 id="recommendations-title">Recommended next moves</h2>
                <p>Ranked by fit score, approval state, and campaign readiness.</p>
              </div>
              <SourcePill source={overview.creatorSource} />
            </div>
            <div className="ops-recommendation-list">
              {overview.creators.map(creator => (
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
              {overview.pipeline.map(stage => (
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
              {overview.creators.map(creator => (
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
            <div className="ops-panel-header compact">
              <h2 id="draft-title">Safe draft package</h2>
              <SourcePill source={overview.draftSource} />
            </div>
            <div className="ops-draft-stack">
              {overview.drafts.map(draft => (
                <article className="ops-draft-card" key={draft.id || draft.title}>
                  <div className="ops-card-title-row">
                    <strong>{draft.title}</strong>
                    <span className="ops-chip neutral">{draft.status}</span>
                  </div>
                  {draft.channel ? <small>{draft.channel}</small> : null}
                  <p>{draft.summary}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="ops-grid">
          <section className="ops-panel" aria-labelledby="approval-title">
            <div className="ops-panel-header compact">
              <h2 id="approval-title">Approval queue</h2>
              <SourcePill source={overview.approvalSource} />
            </div>
            {overview.approvals.length ? (
              <div className="ops-approval-list">
                {overview.approvals.map(item => (
                  <article className="ops-approval-card" key={item.title}>
                    <div className="ops-card-title-row">
                      <strong>{item.title}</strong>
                      <span className={`ops-risk ${item.risk.toLowerCase()}`}>{item.risk}</span>
                    </div>
                    <small>{item.type}</small>
                    <p>{item.summary}</p>
                    <ApprovalActions approvalId={item.id} isPreview={item.isPreview} title={item.title} />
                  </article>
                ))}
              </div>
            ) : (
              <div className="ops-empty-state">
                <strong>No pending approvals</strong>
                <p>Workspace approval items will appear here after a draft, shipment, paid collaboration, usage-rights, or AI script action is queued for human review.</p>
              </div>
            )}
          </section>

          <section className="ops-panel ops-panel-large" aria-labelledby="agent-title">
            <h2 id="agent-title">Latest agent workflow</h2>
            <div className="ops-agent-timeline">
              {overview.agentSteps.map(step => (
                <article className="ops-agent-step" key={step.title}>
                  <span className={step.state === "Blocked for approval" ? "blocked" : ""} />
                  <div>
                    <div className="ops-card-title-row">
                      <strong>{step.title}</strong>
                      <small>{step.state}</small>
                    </div>
                    <p>{step.summary}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="ops-panel" aria-labelledby="blocked-title">
          <h2 id="blocked-title">Blocked actions</h2>
          <div className="ops-blocked-grid">
            {overview.blockedActions.map(action => (
              <span key={action}>{action}</span>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}

const coreWorkflowSteps = [
  {
    title: "Start with creator leads",
    summary: "Bring in creator profiles, links, or imported pipeline records.",
  },
  {
    title: "Score and split paths",
    summary: "Choose product seeding, AI content collab, hold, or review.",
  },
  {
    title: "Prepare safe drafts",
    summary: "Generate outreach, concepts, scripts, and internal next steps.",
  },
  {
    title: "Route approvals",
    summary: "Gate sending, samples, payment, rights, publishing, and ads.",
  },
  {
    title: "Human executes",
    summary: "The user approves and performs external actions outside Mako.",
  },
];

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function SourcePill({ source }: { source: "workspace" | "preview" | "derived" }) {
  const label = source === "workspace" ? "Workspace" : source === "derived" ? "Derived" : "Preview";
  return <span className={`ops-source-pill ${source}`}>{label}</span>;
}
