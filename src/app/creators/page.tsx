import { AppShell, Icon } from "@/components/app-shell";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

const intakePrompts = [
  {
    number: "1.1",
    title: "Describe your business",
    description: "Tell us your industry, city, services, audience, and core offer.",
    placeholder: "Example: Los Angeles restaurant, family-style Thai food, dinner crowd, catering...",
  },
  {
    number: "1.2",
    title: "Reference creator profile links",
    description: "Best: creator email addresses. Optional: Instagram, TikTok, YouTube, or creator website links.",
    placeholder: "creator@example.com or https://www.instagram.com/example",
  },
  {
    number: "1.3",
    title: "Competitor video links",
    description: "Optional videos from competitors or creators whose format you like.",
    placeholder: "Paste one or more video URLs...",
  },
  {
    number: "1.4",
    title: "Describe your ideal creator",
    description: "Optional notes about vibe, follower range, language, budget, or red lines.",
    placeholder: "Example: Local, warm personality, comfortable with short interviews...",
  },
];

export default async function CreatorsPage() {
  const { user, workspace, role } = await requirePageContext("/creators");

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
      <section className="creators-page">
        <div className="page-heading-row">
          <div>
            <h1>Creator Workspace</h1>
            <p>Import creator emails, review outreach readiness, and prepare safe campaign follow-ups.</p>
          </div>
          <a className="new-plan-button" href="/creators/import">
            Import Creators
          </a>
        </div>

        <div className="creator-workspace-grid">
          <section className="creator-agent-panel" aria-labelledby="creator-agent-title">
            <div className="agent-title-row">
              <span className="agent-icon">
                <Icon name="users" />
              </span>
              <div>
                <h2 id="creator-agent-title">AI agent intake</h2>
              <p>Answer each prompt in order. The agent uses this to prepare creator outreach context.</p>
              </div>
            </div>

            <div className="prompt-list">
              {intakePrompts.map(prompt => (
                <label className="prompt-card" key={prompt.number}>
                  <span className="prompt-number">{prompt.number}</span>
                  <span className="prompt-copy">
                    <strong>{prompt.title}</strong>
                    <small>{prompt.description}</small>
                  </span>
                  <textarea placeholder={prompt.placeholder} rows={prompt.number === "1.1" ? 4 : 3} />
                </label>
              ))}
            </div>

            <button className="generate-button" type="button">
              Generate creator profiles
            </button>
          </section>

          <aside className="creator-side-panel" aria-label="Creator intake tools">
            <article>
              <strong>Creator emails</strong>
              <p>Paste creator emails when you have them. Email-first contacts are ready for outreach drafting.</p>
              <a href="/creators/import">Add creator emails</a>
            </article>
            <article>
              <strong>Spreadsheet import</strong>
              <p>Upload an Excel or CSV list with emails, names, profile links, notes, and campaign context.</p>
              <a href="/creators/import">Upload spreadsheet</a>
            </article>
            <article>
              <strong>Private workspace</strong>
              <p>Every imported creator, match run, shortlist, and campaign belongs only to this workspace.</p>
              <span>{workspace.name}</span>
            </article>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}
