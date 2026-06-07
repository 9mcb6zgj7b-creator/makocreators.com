"use client";

import { FormEvent, useState } from "react";

type Step = "identifier" | "code";

type ApiResponse = {
  error?: string | Array<{ message?: string }>;
  identifier?: string;
  delivery?: string;
  devCode?: string;
};

export function LoginForm({ nextPath }: { nextPath: string }) {
  const [step, setStep] = useState<Step>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [normalizedIdentifier, setNormalizedIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

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
      setMessage(data.devCode ? "Local preview code is ready." : "Verification code sent.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: normalizedIdentifier || identifier, code }),
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
    <main className="login-page">
      <section className="login-shell" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark">m</span>
          <span>
            <strong>Mako Creator</strong>
            <small>The first of its kind Creator Network for local services</small>
          </span>
        </div>

        <div className="login-card">
          <span className="login-kicker">Secure workspace</span>
          <h1 id="login-title">Sign in to your creator campaign workspace</h1>
          <p>Use your email or phone number. We will verify it before opening your private dashboard.</p>

          {step === "identifier" ? (
            <form className="login-form" onSubmit={requestCode}>
              <label>
                <span>Email or phone number</span>
                <input
                  autoComplete="username"
                  inputMode="email"
                  placeholder="you@example.com or +1 555 0100"
                  value={identifier}
                  onChange={event => setIdentifier(event.target.value)}
                  required
                />
              </label>

              <button className="login-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Continue"}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={verifyCode}>
              <label>
                <span>Verification code</span>
                <input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  placeholder="Enter the 6-digit code"
                  value={code}
                  onChange={event => setCode(event.target.value)}
                  required
                />
              </label>

              {devCode ? (
                <div className="dev-code" role="status">
                  Local preview code: <strong>{devCode}</strong>
                </div>
              ) : null}

              <button className="login-submit" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
              <button className="login-secondary" type="button" onClick={() => setStep("identifier")}>
                Use a different email or phone
              </button>
            </form>
          )}

          {message ? <p className="form-message">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}

function formatApiError(error: ApiResponse["error"]) {
  if (Array.isArray(error)) {
    return error.map(issue => issue.message).filter(Boolean).join(" ") || "Request failed.";
  }
  return error || "Request failed.";
}
