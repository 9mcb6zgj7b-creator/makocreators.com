"use client";

// [Claude 2026-06-10] Feature 3 + 4 — "Today's outreach picks" panel with a
// preview-before-send step. Approve opens a preview: the human adds a style note
// ("what I liked about their content"), the opener is generated anchored on it, and
// only after a look/edit does the first email actually send. Skip snoozes the creator.
import { useEffect, useState } from "react";
import type { OutreachPick, OutreachPicksResult } from "@/lib/outreach-picks";

type ItemState = "idle" | "working" | "approved" | "skipped";

type PreviewState = {
  leadId: string;
  name: string;
  styleNote: string;
  referencePost: string;
  subject: string;
  body: string;
  loading: boolean;
  sending: boolean;
  error: string;
};

export function OutreachPicksPanel() {
  const [data, setData] = useState<OutreachPicksResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemState, setItemState] = useState<Record<string, ItemState>>({});
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/outreach-picks");
        const payload = (await res.json()) as OutreachPicksResult & { error?: unknown };
        if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Could not load outreach picks.");
        if (active) setData(payload);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load outreach picks.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  async function generatePreview(leadId: string, styleNote: string, referencePost: string) {
    const res = await fetch("/api/outreach-picks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "preview", leadId, styleNote, referencePost }),
    });
    const payload = (await res.json()) as { subject?: string; body?: string; styleNote?: string | null; referencePost?: string | null; error?: unknown };
    if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Could not generate preview.");
    return payload;
  }

  async function openPreview(pick: OutreachPick) {
    setPreview({ leadId: pick.leadId, name: pick.name, styleNote: "", referencePost: "", subject: "", body: "", loading: true, sending: false, error: "" });
    try {
      const r = await generatePreview(pick.leadId, "", "");
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? "", body: r.body ?? "", styleNote: r.styleNote ?? "", referencePost: r.referencePost ?? "", loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function regenerate() {
    if (!preview) return;
    setPreview({ ...preview, loading: true, error: "" });
    try {
      const r = await generatePreview(preview.leadId, preview.styleNote, preview.referencePost);
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? prev.subject, body: r.body ?? prev.body, loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function send() {
    if (!preview) return;
    setPreview({ ...preview, sending: true, error: "" });
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", leadId: preview.leadId, subject: preview.subject, body: preview.body, styleNote: preview.styleNote, referencePost: preview.referencePost }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(typeof payload.error === "string" ? payload.error : "Send failed.");
      }
      setItemState(prev => ({ ...prev, [preview.leadId]: "approved" }));
      setPreview(null);
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, sending: false, error: caught instanceof Error ? caught.message : "Send failed." } : prev));
    }
  }

  async function skip(pick: OutreachPick) {
    setItemState(prev => ({ ...prev, [pick.leadId]: "working" }));
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip", leadId: pick.leadId }),
      });
      if (!res.ok) throw new Error("Skip failed.");
      setItemState(prev => ({ ...prev, [pick.leadId]: "skipped" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Skip failed.");
      setItemState(prev => ({ ...prev, [pick.leadId]: "idle" }));
    }
  }

  return (
    <section className="ops-panel outreach-picks-panel" aria-labelledby="outreach-picks-title">
      <div className="ops-panel-header compact">
        <div>
          <p className="section-eyebrow">Daily outreach</p>
          <h2 id="outreach-picks-title">Today&apos;s picks</h2>
        </div>
        {data ? (
          <span className="outreach-picks-meta">
            {data.picks.length} to contact · {data.needsContactInfo} need email · {data.excludedCount} held back
          </span>
        ) : null}
      </div>

      {loading ? <p className="creator-drawer-status">Scoring creators…</p> : null}
      {error ? <p className="creator-drawer-error">{error}</p> : null}

      {data && !loading ? (
        data.picks.length ? (
          <div className="outreach-picks-list">
            {data.picks.map(pick => (
              <OutreachPickCard key={pick.leadId} pick={pick} state={itemState[pick.leadId] ?? "idle"} onApprove={openPreview} onSkip={skip} />
            ))}
          </div>
        ) : (
          <div className="creator-list-empty">
            <strong>No one to contact today</strong>
            <p>The system is holding back {data.excludedCount} creator{data.excludedCount === 1 ? "" : "s"} (do-not-contact, in flight, or too soon){data.needsContactInfo ? `, and ${data.needsContactInfo} need an email first` : ""}. Saying no is fine — import new creators or wait for replies.</p>
          </div>
        )
      ) : null}

      {preview ? <PreviewModal preview={preview} setPreview={setPreview} onRegenerate={regenerate} onSend={send} /> : null}
    </section>
  );
}

function OutreachPickCard({ pick, state, onApprove, onSkip }: { pick: OutreachPick; state: ItemState; onApprove: (pick: OutreachPick) => void; onSkip: (pick: OutreachPick) => void }) {
  if (state === "approved") {
    return (
      <article className="outreach-pick-card done">
        <strong>{pick.name}</strong>
        <span className="outreach-pick-result approved">Outreach started — first email sent</span>
      </article>
    );
  }
  if (state === "skipped") {
    return (
      <article className="outreach-pick-card done">
        <strong>{pick.name}</strong>
        <span className="outreach-pick-result skipped">Skipped — snoozed for 30 days</span>
      </article>
    );
  }

  const working = state === "working";
  return (
    <article className="outreach-pick-card">
      <div className="outreach-pick-main">
        <div className="ops-card-title-row">
          <strong>{pick.name}</strong>
          <span className={`creator-warmth ${pick.warmth}`}>{pick.warmth}</span>
        </div>
        <p className="outreach-pick-why">{pick.whyNow}</p>
        <div className="outreach-pick-tags">
          <span className="outreach-pick-play">{pick.playLabel}</span>
          {pick.platform ? <span className="outreach-pick-platform">{pick.platform}</span> : null}
          <span className="outreach-pick-score">Score {pick.score}</span>
        </div>
      </div>
      <div className="outreach-pick-actions">
        <button type="button" className="primary" disabled={working} onClick={() => onApprove(pick)}>
          Approve
        </button>
        <button type="button" disabled={working} onClick={() => onSkip(pick)}>
          Skip
        </button>
      </div>
    </article>
  );
}

function PreviewModal({ preview, setPreview, onRegenerate, onSend }: { preview: PreviewState; setPreview: (value: PreviewState | null) => void; onRegenerate: () => void; onSend: () => void }) {
  const busy = preview.loading || preview.sending;
  return (
    <div className="ops-modal-backdrop" role="presentation" onClick={() => (busy ? null : setPreview(null))}>
      <section className="ops-modal outreach-preview-modal" role="dialog" aria-modal="true" aria-label="Outreach preview" onClick={event => event.stopPropagation()}>
        <div className="ops-modal-header">
          <div>
            <p className="section-eyebrow">Preview before sending</p>
            <h2>{preview.name}</h2>
            <p>Add what you genuinely liked about their content — the opener anchors on it. Leave blank to open on their niche.</p>
          </div>
          <button type="button" onClick={() => setPreview(null)} disabled={busy} aria-label="Close preview">Close</button>
        </div>

        <div className="outreach-preview-body">
        <label className="outreach-preview-field">
          <span>Style note (what you liked)</span>
          <textarea rows={2} value={preview.styleNote} disabled={busy} placeholder="e.g. their fast-paced taco reviews around East LA" onChange={event => setPreview({ ...preview, styleNote: event.target.value })} />
        </label>
        <label className="outreach-preview-field">
          <span>Reference post (optional URL)</span>
          <input value={preview.referencePost} disabled={busy} placeholder="https://…" onChange={event => setPreview({ ...preview, referencePost: event.target.value })} />
        </label>

        <button type="button" className="outreach-preview-regen" disabled={busy} onClick={onRegenerate}>
          {preview.loading ? "Generating…" : "Regenerate opener from note"}
        </button>

        <label className="outreach-preview-field">
          <span>Subject</span>
          <input value={preview.subject} disabled={busy} onChange={event => setPreview({ ...preview, subject: event.target.value })} />
        </label>
        <label className="outreach-preview-field">
          <span>Body (an unsubscribe line is added automatically)</span>
          <textarea rows={7} value={preview.body} disabled={busy} onChange={event => setPreview({ ...preview, body: event.target.value })} />
        </label>

        {preview.error ? <p className="creator-drawer-error">{preview.error}</p> : null}

        <div className="outreach-preview-actions">
          <button type="button" disabled={busy} onClick={() => setPreview(null)}>Cancel</button>
          <button type="button" className="primary" disabled={busy || !preview.subject || !preview.body} onClick={onSend}>
            {preview.sending ? "Sending…" : "Send first email"}
          </button>
        </div>
        </div>
      </section>
    </div>
  );
}
