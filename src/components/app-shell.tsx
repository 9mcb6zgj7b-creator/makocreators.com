import type { ReactNode } from "react";
import { LogoutButton } from "@/components/logout-button";

type NavKey = "home" | "ops" | "creators" | "campaigns" | "reports";

const navigation: Array<{ key: NavKey; label: string; href: string; icon: string }> = [
  { key: "home", label: "Home", href: "/dashboard", icon: "home" },
  { key: "ops", label: "Ops", href: "/ops", icon: "shield" },
  { key: "campaigns", label: "Campaigns", href: "/campaigns", icon: "plan" },
  { key: "reports", label: "Reports", href: "/reports", icon: "report" },
];

export type AppShellUser = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  workspaceName?: string | null;
  role?: string | null;
};

export function AppShell({ activeNav, children, user }: { activeNav: NavKey; children: ReactNode; user?: AppShellUser }) {
  const displayName = user?.name || user?.email || user?.phone || "Account";
  const initials = getInitials(displayName);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/dashboard" aria-label="Mako Creator">
          <span className="brand-mark">m</span>
          <span>Mako Creator</span>
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
          <div className="account-menu" aria-label="Current account">
            <span className="avatar">{initials}</span>
            <span className="account-copy">
              <strong>{displayName}</strong>
              <small>{user?.workspaceName || "Private workspace"}</small>
            </span>
            <LogoutButton />
          </div>
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

function getInitials(value: string) {
  const clean = value.replace(/^\+/, "").trim();
  const parts = clean.split(/[\s@._-]+/).filter(Boolean);
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : clean.slice(0, 2);
  return letters.toUpperCase();
}
