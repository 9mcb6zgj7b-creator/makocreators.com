import { AppShell, Icon } from "@/components/app-shell";
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
            <h2 id="draft-title">Safe draft package</h2>
            <div className="ops-draft-stack">
              {overview.creators.slice(0, 3).map(creator => (
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
              {overview.approvals.map(item => (
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

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
