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
          {overview.metrics.map(metric => {
            if (metric.label === "Creators tracked") {
              return (
                <MetricLink
                  href="/ops/creators"
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                  key={metric.label}
                />
              );
            }

            if (metric.label === "Contactable creators") {
              return (
                <MetricLink
                  href="/ops/creators?view=contactable"
                  label={metric.label}
                  value={metric.value}
                  note={metric.note}
                  key={metric.label}
                />
              );
            }

            return <Metric label={metric.label} value={metric.value} note={metric.note} key={metric.label} />;
          })}
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

function MetricLink({ href, label, value, note }: { href: string; label: string; value: number; note: string }) {
  return (
    <article className="ops-metric-link-card">
      <a href={href} aria-label={`Open ${label} list`}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
        <em>Open List</em>
      </a>
    </article>
  );
}
