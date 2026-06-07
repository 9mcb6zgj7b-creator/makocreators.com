import type { ReactNode } from "react";

type NavKey = "home" | "creators" | "campaigns" | "reports";

const navigation: Array<{ key: NavKey; label: string; href: string; icon: string }> = [
  { key: "home", label: "Home", href: "/", icon: "home" },
  { key: "creators", label: "Creators", href: "/creators", icon: "users" },
  { key: "campaigns", label: "Campaigns", href: "/campaigns", icon: "plan" },
  { key: "reports", label: "Reports", href: "/reports", icon: "report" },
];

export function AppShell({ activeNav, children }: { activeNav: NavKey; children: ReactNode }) {
  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="MACO Creators">
          <span className="brand-mark">m</span>
          <span>MACO Creators</span>
        </a>

        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(item => (
            <a className={item.key === activeNav ? "nav-item active" : "nav-item"} href={item.href} key={item.key}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="account-actions">
          <button className="icon-button" type="button" aria-label="Messages">
            <Icon name="message" />
          </button>
          <button className="profile-button" type="button" aria-label="Account menu">
            <span className="avatar">SL</span>
          </button>
        </div>
      </header>

      {children}

      <button className="chat-button" type="button" aria-label="Live support">
        <Icon name="chat" />
      </button>
    </main>
  );
}

export function Icon({ name }: { name: string }) {
  return <span className={`icon icon-${name}`} aria-hidden="true" />;
}
