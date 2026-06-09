import { AppShell } from "@/components/app-shell";
import { CreatorImportForm } from "@/app/creators/import/creator-import-form";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function CreatorImportPage() {
  const { user, workspace, role } = await requirePageContext("/creators/import");

  return (
    <AppShell
      activeNav="creators"
      user={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        workspaceName: workspace.name,
        role,
      }}
    >
      <section className="creator-import-page">
        <div className="page-heading-row">
          <div>
            <h1>Import Creators</h1>
            <p>Add creator leads from profile links or a spreadsheet, then review them in the Creator Ops Cockpit.</p>
          </div>
          <a className="new-plan-button secondary" href="/creators">
            Back to Creators
          </a>
        </div>

        <CreatorImportForm databaseConfigured={Boolean(process.env.DATABASE_URL)} />
      </section>
    </AppShell>
  );
}
