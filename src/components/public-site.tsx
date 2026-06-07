import type { ReactNode } from "react";

const navItems = [
  { href: "/for-creators", label: "For Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-brands", label: "For Brands" },
];

type PublicPageProps = {
  active?: string;
  children: ReactNode;
};

export function PublicSite({ active, children }: PublicPageProps) {
  return (
    <main className="public-site">
      <header className="public-header">
        <a className="public-brand" href="/">
          <span>m</span>
          <strong>Mako Creator</strong>
        </a>
        <nav className="public-nav" aria-label="Public navigation">
          {navItems.map(item => (
            <a className={active === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="public-actions">
          <a href="/login/brand">Log in</a>
          <a href="/signup/brand">Sign up</a>
          <a className="public-demo-link" href="/demo">Book a demo</a>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <div>
          <a className="public-brand dark" href="/">
            <span>m</span>
            <strong>Mako Creator</strong>
          </a>
          <p>The first of its kind Creator Network for local services.</p>
        </div>
        <nav aria-label="Footer navigation">
          {navItems.map(item => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a href="/signup/brand">Get started</a>
        </nav>
      </footer>
    </main>
  );
}

export function PublicHero({
  badge,
  title,
  text,
  primaryHref = "/signup/brand",
  primaryLabel = "Start a campaign",
  secondaryHref = "/demo",
  secondaryLabel = "Book a demo",
}: {
  badge: string;
  title: string;
  text: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="public-hero">
      <div className="public-hero-copy">
        <span className="public-badge">{badge}</span>
        <h1>{title}</h1>
        <p>{text}</p>
        <div className="public-hero-actions">
          <a href={primaryHref}>{primaryLabel}</a>
          <a href={secondaryHref}>{secondaryLabel}</a>
        </div>
      </div>
      <div className="public-hero-visual" aria-hidden="true">
        <div className="creator-card creator-card-main">
          <span className="creator-avatar">LA</span>
          <strong>Local Food Storytellers</strong>
          <small>128 matched creators</small>
        </div>
        <div className="creator-card creator-card-side">
          <strong>Campaign fit</strong>
          <span>94%</span>
        </div>
        <div className="creator-card creator-card-bottom">
          <strong>Brief ready</strong>
          <small>Creator-facing content generated</small>
        </div>
      </div>
    </section>
  );
}

export function FeatureBand({
  title,
  items,
}: {
  title: string;
  items: Array<{ title: string; text: string }>;
}) {
  return (
    <section className="public-band">
      <h2>{title}</h2>
      <div className="public-feature-grid">
        {items.map(item => (
          <article key={item.title}>
            <span />
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
