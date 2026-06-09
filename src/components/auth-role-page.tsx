"use client";

import { FormEvent, useState } from "react";

const SF = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';

type Role = "brand" | "creator";
type Mode = "login" | "signup";

type ApiResponse = {
  error?: string | Array<{ message?: string }>;
  identifier?: string;
  devCode?: string;
};

const brandFeatures = [
  "Access verified local creators",
  "AI-powered matching in minutes",
  "Creator intake, shortlists, and campaign reports",
  "Private workspace for every account",
];

const creatorFeatures = [
  "Get matched with brands in your niche",
  "Share the creator profile you want brands to see",
  "Keep campaign conversations organized",
  "Build your portfolio with local services",
];

export function AuthRolePage({ mode, role, nextPath = "/dashboard" }: { mode: Mode; role: Role; nextPath?: string }) {
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [normalizedIdentifier, setNormalizedIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"identifier" | "code">("identifier");

  const isCreator = role === "creator";
  const isSignup = mode === "signup";
  const label = isCreator ? "Creator" : "Brand";
  const otherRole = isCreator ? "brand" : "creator";
  const otherLabel = isCreator ? "Brand" : "Creator";
  const features = isCreator ? creatorFeatures : brandFeatures;

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(formatApiError(data.error));

      setNormalizedIdentifier(data.identifier || identifier);
      setDevCode(data.devCode || "");
      setStep("code");
      setStatus(data.devCode ? "Local preview code is ready." : "Verification code sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: normalizedIdentifier || identifier,
          code,
          name: name || undefined,
          role,
        }),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) throw new Error(formatApiError(data.error));
      window.location.assign(nextPath);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#faf8f4", fontFamily: SF, display: "flex" }}>
      <section className="auth-marketing-panel">
        <div className="auth-glow" />
        <div style={{ position: "relative", textAlign: "center" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", marginBottom: 48, textDecoration: "none" }}>
            <span style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1a", fontWeight: 900, fontSize: 20 }}>
              M
            </span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>Mako Creator</span>
          </a>

          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
            {isSignup ? (
              isCreator ? (
                <>
                  Start earning from
                  <br />
                  <span style={{ color: "#f97316" }}>brand partnerships.</span>
                </>
              ) : (
                <>
                  Launch your first
                  <br />
                  <span style={{ color: "#f97316" }}>creator campaign.</span>
                </>
              )
            ) : isCreator ? (
              <>
                Find brand deals
                <br />
                <span style={{ color: "#f97316" }}>that fit your voice.</span>
              </>
            ) : (
              <>
                Find creators
                <br />
                <span style={{ color: "#f97316" }}>who drive results.</span>
              </>
            )}
          </h1>

          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.56)", lineHeight: 1.65, marginBottom: 34 }}>
            {isCreator
              ? "Join local service campaigns and keep your creator opportunities organized."
              : "Run creator matching, shortlists, campaign tasks, and reports from one private workspace."}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, textAlign: "left" }}>
            {features.map(feature => (
              <div key={feature} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(249,115,22,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1.5 4l2.3 2.3 4.7-4.7" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 32px" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 40, background: "#f0ece5", borderRadius: 12, padding: 4 }}>
            {(["brand", "creator"] as const).map(item => (
              <a
                key={item}
                href={`/${mode}/${item}`}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "10px 0",
                  borderRadius: 9,
                  fontFamily: SF,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                  background: role === item ? "#fff" : "transparent",
                  color: role === item ? "#1a1a1a" : "#888",
                  boxShadow: role === item ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: role === item ? "#f97316" : "#bbb", display: "flex" }}>{item === "brand" ? <BrandIcon /> : <CreatorIcon />}</span>
                {item === "brand" ? "Brand" : "Creator"}
              </a>
            ))}
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", color: "#1a1a1a", fontFamily: SF, marginBottom: 6 }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: 15, color: "#888", fontFamily: SF, marginBottom: 32 }}>
            {isSignup ? "Signing up" : "Log in"} as a <strong style={{ color: "#1a1a1a" }}>{label}</strong>
          </p>

          <p className="auth-status" style={{ marginBottom: 20 }}>
            Use email verification to access your private workspace. Google and TikTok OAuth will appear here after official OAuth setup is complete.
          </p>

          {step === "identifier" ? (
            <form onSubmit={requestCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isSignup ? (
                <TextField
                  label={isCreator ? "Full name" : "Brand / Company name"}
                  placeholder={isCreator ? "Your name" : "e.g. Sweetgreen"}
                  value={name}
                  focused={focusedField === "name"}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  onChange={setName}
                />
              ) : null}
              <TextField
                label="Email or phone number"
                placeholder="you@company.com or +1 555 0100"
                value={identifier}
                focused={focusedField === "identifier"}
                onFocus={() => setFocusedField("identifier")}
                onBlur={() => setFocusedField(null)}
                onChange={setIdentifier}
              />
              <button type="submit" className="auth-submit-button" disabled={isLoading}>
                {isLoading ? "Sending..." : isSignup ? "Sign Up" : "Log in"}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyCode} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TextField
                label="Verification code"
                placeholder="Enter the code"
                value={code}
                focused={focusedField === "code"}
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField(null)}
                onChange={setCode}
              />
              {devCode ? <p className="auth-status">Local preview code: <strong>{devCode}</strong></p> : null}
              <button type="submit" className="auth-submit-button" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Continue to dashboard"}
              </button>
              <button type="button" className="auth-secondary-button" onClick={() => setStep("identifier")}>
                Use a different email or phone
              </button>
            </form>
          )}

          {status ? <p role="status" className="auth-status">{status}</p> : null}
          {error ? <p role="alert" className="auth-error">{error}</p> : null}

          <p style={{ textAlign: "center", fontSize: 13, color: "#888", fontFamily: SF, marginTop: 24 }}>
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <a href={`/${isSignup ? "login" : "signup"}/${role}`} style={{ color: "#f97316", fontWeight: 600, textDecoration: "none" }}>
              {isSignup ? `Log in as ${label}` : `Sign up as ${label}`}
            </a>
          </p>
          <p style={{ textAlign: "center", fontSize: 12, color: "#bbb", fontFamily: SF, marginTop: 8 }}>
            Are you a {otherLabel}?{" "}
            <a href={`/${mode}/${otherRole}`} style={{ color: "#888", textDecoration: "underline" }}>
              {isSignup ? `Sign up as ${otherLabel}` : `Log in as ${otherLabel}`}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}

function TextField({
  label,
  placeholder,
  value,
  focused,
  onFocus,
  onBlur,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#555", fontFamily: SF, marginBottom: 6 }}>{label}</span>
      <input
        required
        placeholder={placeholder}
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 10,
          fontFamily: SF,
          fontSize: 14,
          border: `1.5px solid ${focused ? "#f97316" : "#e8e3da"}`,
          outline: "none",
          background: "#fff",
          color: "#1a1a1a",
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
      />
    </label>
  );
}

function BrandIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="7" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 7V5a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CreatorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14 3l1 1-5 5-2-2 5-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" fill="#fff" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function formatApiError(error: ApiResponse["error"]) {
  if (Array.isArray(error)) {
    return error.map(issue => issue.message).filter(Boolean).join(" ") || "Request failed.";
  }
  return error || "Request failed.";
}
