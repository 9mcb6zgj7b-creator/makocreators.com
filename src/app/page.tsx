import { AppShell, Icon } from "@/components/app-shell";

const supportItems = [
  {
    title: "Contact MACO Creators Support",
    description: "Get help from our creator campaign support team.",
  },
  {
    title: "Review Creator Intake Progress",
    description: "Track creators waiting for analysis, review, and approval.",
  },
];

export default function HomePage() {
  return (
    <AppShell activeNav="home">
      <section className="dashboard">
        <div className="welcome-row">
          <div>
            <h1>Welcome back!</h1>
            <p>Your creator campaign workspace is ready.</p>
          </div>
          <button className="new-plan-button" type="button">
            New Campaign
          </button>
        </div>

        <section className="operation-panel" aria-labelledby="operation-title">
          <div className="operation-header">
            <h2 id="operation-title">Campaign Actions</h2>
            <label className="campaign-select">
              <span>Campaign</span>
              <select defaultValue="">
                <option value="" disabled>
                  Select a campaign
                </option>
                <option value="la-restaurant">LA Restaurant Launch</option>
                <option value="beauty-launch">Beauty Studio Opening</option>
              </select>
            </label>
          </div>

          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true">
              <div className="paper" />
              <span className="spark spark-one" />
              <span className="spark spark-two" />
            </div>
            <strong>All clear. No pending tasks right now.</strong>
            <p>Creator reviews, content approvals, and campaign follow-ups will appear here once a campaign is active.</p>
          </div>
        </section>

        <section className="support-panel" aria-labelledby="support-title">
          <h2 id="support-title">We are here whenever you need help</h2>
          <div className="support-list">
            {supportItems.map(item => (
              <a className="support-row" href="/support" key={item.title}>
                <span className="support-icon">
                  <Icon name="support" />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
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
