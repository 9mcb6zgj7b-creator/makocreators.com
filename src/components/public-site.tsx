"use client";

import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

const navLinks = [
  { href: "/for-creators", label: "For Creators" },
  { href: "/pricing", label: "Pricing" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-brands", label: "For Brands" },
];

const footerCols = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "For Brands", href: "/for-brands" },
      { label: "For Creators", href: "/for-creators" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Help Center", href: "/help" },
      { label: "API Docs", href: "/api" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

function BrandIcon({ dark = false }: { dark?: boolean }) {
  return (
    <a href="/" className="vite-public-brand" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, textDecoration: "none" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: dark ? "#f97316" : "#1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 18, fontFamily: "inherit", lineHeight: 1 }}>M</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: 17, color: dark ? "#fff" : "#1a1a1a", letterSpacing: 0 }}>
        Mako Creator
      </span>
    </a>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RoleMenu({ label, base }: { label: string; base: "login" | "signup" }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const items = [
    { label: "Brand", href: `/${base}/brand` },
    { label: "Creator", href: `/${base}/creator` },
  ];

  const showMenu = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const hideMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={showMenu}
      onMouseLeave={hideMenu}
    >
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          border: 0,
          background: "none",
          color: "#4a4a4a",
          cursor: "pointer",
          fontFamily: SF,
          fontSize: 15,
          fontWeight: 500,
          padding: "4px 0",
        }}
      >
        {label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <div
          onMouseEnter={showMenu}
          onMouseLeave={hideMenu}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
            padding: "16px 8px 8px",
            minWidth: 190,
            zIndex: 200,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: -14,
              height: 14,
            }}
          />
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#bbb", paddingLeft: 12, marginBottom: 8, textTransform: "uppercase" }}>
            {label} as a
          </div>
          {items.map(item => (
            <a
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                textDecoration: "none",
                color: "#1a1a1a",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {item.label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PublicSite({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="vite-public-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", width: "100%", background: "#faf8f4", color: "#1a1a1a", fontFamily: SF }}>
      <header className="vite-public-header" style={{ position: "sticky", top: 0, zIndex: 50, width: "100%", background: "rgba(250,248,244,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="vite-public-header-inner" style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", minHeight: 68, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <BrandIcon />
          <nav className="vite-public-nav" style={{ display: "flex", alignItems: "center", gap: 28, flex: 1, justifyContent: "center" }}>
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: pathname === link.href ? "#f97316" : "#4a4a4a",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="vite-public-actions" style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
            <RoleMenu label="Log in" base="login" />
            <RoleMenu label="Sign up" base="signup" />
            <a href="/demo" style={{ fontSize: 15, fontWeight: 600, color: "#fff", background: "#f97316", borderRadius: 999, padding: "9px 20px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Book a demo
            </a>
          </div>
          <button
            className="vite-public-menu-button"
            type="button"
            onClick={() => setMobileOpen(open => !open)}
            style={{ display: "none", color: "#1a1a1a", background: "none", border: "none", cursor: "pointer", padding: 8 }}
            aria-label="Toggle menu"
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
        {mobileOpen ? (
          <div className="vite-public-mobile-menu" style={{ display: "none" }}>
            {[...navLinks, { href: "/login/brand", label: "Log in" }, { href: "/signup/brand", label: "Sign up" }, { href: "/demo", label: "Book a demo" }].map(link => (
              <a key={link.href} href={link.href}>{link.label}</a>
            ))}
          </div>
        ) : null}
      </header>
      <main style={{ flex: 1, width: "100%" }}>{children}</main>
      <footer style={{ background: "#1a1a1a", color: "#ccc", padding: "64px 24px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 48, marginBottom: 56 }}>
            <div>
              <BrandIcon dark />
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.65, maxWidth: 240, marginTop: 16 }}>
                The smartest way for small businesses to discover and collaborate with the right creators.
              </p>
            </div>
            {footerCols.map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 20 }}>{col.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {col.links.map(link => (
                    <a key={link.href} href={link.href} style={{ fontSize: 14, color: "#888", textDecoration: "none" }}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #333", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <p style={{ fontSize: 13, color: "#555" }}>© {new Date().getFullYear()} Mako Creator. All rights reserved.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {["X", "in", "IG"].map(item => (
                <div key={item} style={{ width: 34, height: 34, borderRadius: "50%", background: "#2a2a2a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#888" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
