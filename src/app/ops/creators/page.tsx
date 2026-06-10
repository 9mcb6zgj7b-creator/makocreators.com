import { AppShell } from "@/components/app-shell";
import { CreatorMemoryList } from "@/components/creator-memory-drawer";
import { getWorkspaceCreatorListRows } from "@/lib/ops-overview";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

type CreatorListPageProps = {
  searchParams?: {
    view?: string;
  };
};

export default async function CreatorListPage({ searchParams }: CreatorListPageProps) {
  const { user, workspace, role } = await requirePageContext("/ops/creators");
  const contactableOnly = searchParams?.view === "contactable";
  const creators = await getWorkspaceCreatorListRows(workspace.id, { contactableOnly });
  const title = contactableOnly ? "Contactable Creators" : "Creators Tracked";
  const description = contactableOnly
    ? "Creators in this workspace with an email available for outreach preparation."
    : "Unique creators saved or imported in this workspace.";

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
      <section className="ops-page creator-list-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Creator list</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>
          <a className="new-plan-button secondary" href="/ops">
            Back to Ops
          </a>
        </div>

        <section className="ops-panel creator-list-panel" aria-labelledby="creator-list-title">
          <div className="ops-panel-header compact">
            <h2 id="creator-list-title">{creators.length} creator{creators.length === 1 ? "" : "s"}</h2>
            <a className="creator-list-toggle" href={contactableOnly ? "/ops/creators" : "/ops/creators?view=contactable"}>
              {contactableOnly ? "Show all creators" : "Show contactable only"}
            </a>
          </div>

          {/* [Claude 2026-06-10] Rows are now clickable and open a memory dossier drawer. */}
          <CreatorMemoryList rows={creators} title={title} contactableOnly={contactableOnly} />
        </section>
      </section>
    </AppShell>
  );
}
