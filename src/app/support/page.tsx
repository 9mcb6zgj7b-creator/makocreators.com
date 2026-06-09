import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

const supportRows = [
  {
    title: "Creator lead review",
    description: "Check imported profiles, missing contact details, and creators waiting for analysis.",
    href: "/creators/import",
  },
  {
    title: "Approval queue",
    description: "Review outreach, shipment, paid collaboration, usage-rights, and AI script approval items.",
    href: "/ops",
  },
  {
    title: "Campaign setup",
    description: "Create or revise campaign briefs before creator matching and outreach preparation.",
    href: "/campaigns/new",
  },
];

export default async function SupportPage() {
  const { user, workspace, role } = await requirePageContext("/support");

  return (
    <AppShell
      activeNav="home"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="support-page">
        <div className="page-heading-row">
          <div>
            <h1>Support</h1>
            <p>Jump to the workspace area that matches the item you want to review.</p>
          </div>
          <a className="new-plan-button secondary" href="/dashboard">
            Back to Home
          </a>
        </div>

        <section className="support-panel">
          <div className="support-list">
            {supportRows.map(row => (
              <a className="support-row" href={row.href} key={row.title}>
                <span className="support-icon">
                  <Icon name="support" />
                </span>
                <span>
                  <strong>{row.title}</strong>
                  <small>{row.description}</small>
                </span>
                <Icon name="chevron" />
              </a>
            ))}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
