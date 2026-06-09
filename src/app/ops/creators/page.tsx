import { AppShell } from "@/components/app-shell";
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

          <div className="creator-list-table" role="table" aria-label={title}>
            <div className="creator-list-table-head" role="row">
              <span>Creator&apos;s Name</span>
              <span>Platform</span>
              <span>Follower number</span>
              <span>Link</span>
              <span>Email</span>
              <span>Price</span>
              <span>Contact Date</span>
              <span>Avg. views</span>
            </div>
            {creators.length ? (
              creators.map((creator, index) => (
                <div className="creator-list-table-row" role="row" key={`${creator.name}-${creator.email}-${index}`}>
                  <span>{creator.name || "missing"}</span>
                  <span>{creator.platform || "missing"}</span>
                  <span>{creator.followerNumber || "missing"}</span>
                  <span>{creator.link || "missing"}</span>
                  <span>{creator.email || "missing"}</span>
                  <span>{creator.price || "missing"}</span>
                  <span>{creator.contactDate || "missing"}</span>
                  <span>{creator.avgViews || "missing"}</span>
                </div>
              ))
            ) : (
              <div className="creator-list-empty">
                <strong>No creators found</strong>
                <p>{contactableOnly ? "No saved creators have an email yet." : "Import a creator spreadsheet or paste creator contacts first."}</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </AppShell>
  );
}
