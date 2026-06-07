import type { ReactNode } from "react";

type NavKey =
  | "creator-studio"
  | "social-studio"
  | "support-studio"
  | "campaigns"
  | "calendar"
  | "analytics"
  | "connections"
  | "settings";

const studioItems: Array<{
  key: NavKey;
  label: string;
  description: string;
  href: string;
  icon: string;
}> = [
  { key: "creator-studio", label: "Creator Studio", description: "Find creators", href: "/", icon: "users" },
  { key: "social-studio", label: "Social Studio", description: "Content distribution", href: "/social", icon: "megaphone" },
  { key: "support-studio", label: "Support Studio", description: "Customer conversations", href: "/support", icon: "headset" },
];

const toolItems: Array<{ key: NavKey; label: string; href: string; icon: string }> = [
  { key: "campaigns", label: "Campaigns", href: "/campaigns", icon: "plan" },
  { key: "calendar", label: "Publish Calendar", href: "/calendar", icon: "calendar" },
  { key: "analytics", label: "Analytics", href: "/reports", icon: "analytics" },
  { key: "connections", label: "Account Connections", href: "/connections", icon: "plug" },
  { key: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

export function AppShell({ activeNav, children }: { activeNav: NavKey; children: ReactNode }) {
  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Workspace navigation">
        <a className="brand-card" href="/" aria-label="MACO Creators">
          <span className="brand-logo">Mako AI</span>
          <small>AI Ads and Creative</small>
        </a>

        <nav className="sidebar-nav" aria-label="Studios">
          {studioItems.map(item => (
            <a className={activeNav === item.key ? "studio-link active" : "studio-link"} href={item.href} key={item.key}>
              <span className={`studio-icon studio-icon-${item.icon}`}>
                <Icon name={item.icon} />
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
              <Icon name="chevron" />
            </a>
          ))}
        </nav>

        <div className="tool-section">
          <p>Management Tools</p>
          <nav className="tool-nav" aria-label="Management tools">
            {toolItems.map(item => (
              <a className={activeNav === item.key ? "tool-link active" : "tool-link"} href={item.href} key={item.key}>
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <a className="logout-link" href="/logout">
          <Icon name="logout" />
          <span>Log out</span>
        </a>
      </aside>

      <section className="workspace">{children}</section>
    </main>
  );
}

export function Icon({ name }: { name: string }) {
  return <span className={`icon icon-${name}`} aria-hidden="true" />;
}
