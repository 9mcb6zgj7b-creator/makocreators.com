"use client";

// [Claude 2026-06-10] Feature 3 + 4 — "Today's outreach picks" panel with a
// preview-before-send step. Approve opens a preview: the human adds a style note
// ("what I liked about their content"), the opener is generated anchored on it, and
// only after a look/edit does the first email actually send. Skip snoozes the creator.
// [Claude 2026-06-16] PreviewModal includes campaign picker.
// [Claude 2026-06-16] "Send All" opens PreviewModal in bulk mode — generate a preview
// from the first creator, edit it, then send to every pending pick at once.
// The server substitutes {creatorName} per creator before sending.
import { useEffect, useState } from "react";
import type { OutreachPick, OutreachPicksResult } from "@/lib/outreach-picks";

// Detect platform from URL (more reliable than the stored platform field).
function detectPlatform(url: string, stored: string): string {
  if (/tiktok\.com/i.test(url)) return "TIKTOK";
  if (/instagram\.com/i.test(url)) return "INSTAGRAM";
  if (/youtube\.com|youtu\.be/i.test(url)) return "YOUTUBE";
  return stored;
}

function platformLabel(platform: string): string {
  const p = platform.toUpperCase();
  if (p === "INSTAGRAM") return "Instagram";
  if (p === "TIKTOK") return "TikTok";
  if (p === "YOUTUBE") return "YouTube";
  return platform;
}

function platformIcon(platform: string): string {
  const p = platform.toUpperCase();
  if (p === "INSTAGRAM") return "📷";
  if (p === "TIKTOK") return "🎵";
  if (p === "YOUTUBE") return "▶️";
  return "🔗";
}

// Profile picture via unavatar.io (free, no API key needed).
function avatarSrc(platformLinks: { platform: string; url: string; handle: string | null }[]): string | null {
  for (const pl of platformLinks) {
    const platform = detectPlatform(pl.url, pl.platform).toUpperCase();
    if (!pl.handle) continue;
    if (platform === "INSTAGRAM") return `https://unavatar.io/instagram/${pl.handle}`;
    if (platform === "TIKTOK") return `https://unavatar.io/tiktok/${pl.handle}`;
  }
  return null;
}

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtPrice(min: number | null, max: number | null): string {
  if (min != null && max != null) return `$${min.toLocaleString()}–$${max.toLocaleString()}`;
  if (min != null) return `$${min.toLocaleString()}+`;
  if (max != null) return `up to $${max.toLocaleString()}`;
  return "—";
}

type ItemState = "idle" | "working" | "approved" | "skipped";
type Campaign = { id: string; name: string };

// [Claude 2026-06-12] Exported so ComposeOutreachButton (email any creator from the
// creator list) can reuse the same preview modal and state shape.
export type PreviewState = {
  leadId: string;
  name: string;
  campaignId: string;
  styleNote: string;
  referencePost: string;
  subject: string;
  body: string;
  rewriteNote: string;
  loading: boolean;
  sending: boolean;
  rewriting: boolean;
  error: string;
  // When set, modal is in bulk mode: send to all these leadIds instead of just leadId.
  bulkLeadIds?: string[];
};

export async function generateOutreachPreview(leadId: string, styleNote: string, referencePost: string, campaignId?: string) {
  const res = await fetch("/api/outreach-picks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "preview", leadId, styleNote, referencePost, campaignId: campaignId || undefined }),
  });
  const payload = (await res.json()) as { subject?: string; body?: string; styleNote?: string | null; referencePost?: string | null; error?: unknown };
  if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Could not generate preview.");
  return payload;
}

export function OutreachPicksPanel() {
  const [data, setData] = useState<OutreachPicksResult | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemState, setItemState] = useState<Record<string, ItemState>>({});
  const [preview, setPreview] = useState<PreviewState | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/outreach-picks").then(r => r.json()) as Promise<OutreachPicksResult & { error?: unknown }>,
      fetch("/api/campaigns").then(r => r.json()) as Promise<{ campaigns?: Campaign[]; error?: unknown }>,
    ]).then(([picks, camps]) => {
      if (!active) return;
      if (picks.error) { setError(typeof picks.error === "string" ? picks.error : "Could not load outreach picks."); }
      else setData(picks);
      setCampaigns(camps.campaigns ?? []);
    }).catch(caught => {
      if (active) setError(caught instanceof Error ? caught.message : "Could not load outreach picks.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function openPreview(pick: OutreachPick) {
    const defaultCampaignId = campaigns[0]?.id ?? "";
    setPreview({ leadId: pick.leadId, name: pick.name, campaignId: defaultCampaignId, styleNote: "", referencePost: "", subject: "", body: "", rewriteNote: "", loading: true, sending: false, rewriting: false, error: "" });
    try {
      const r = await generateOutreachPreview(pick.leadId, "", "", defaultCampaignId || undefined);
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? "", body: r.body ?? "", styleNote: r.styleNote ?? "", referencePost: r.referencePost ?? "", loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function openBulk() {
    if (!data) return;
    const pending = data.picks.filter(p => (itemState[p.leadId] ?? "idle") === "idle");
    if (!pending.length) return;
    const first = pending[0];
    const defaultCampaignId = campaigns[0]?.id ?? "";
    const bulkLeadIds = pending.map(p => p.leadId);
    setPreview({ leadId: first.leadId, name: first.name, campaignId: defaultCampaignId, styleNote: "", referencePost: "", subject: "", body: "", rewriteNote: "", loading: true, sending: false, rewriting: false, error: "", bulkLeadIds });
    try {
      const r = await generateOutreachPreview(first.leadId, "", "", defaultCampaignId || undefined);
      // Auto-replace the first creator's name/handle with {creatorName} so every
      // recipient gets their own name when bulk_approve does the substitution.
      const namesToReplace = [first.name, first.handle].filter(Boolean) as string[];
      const toPlaceholder = (text: string) =>
        namesToReplace.reduce((t, n) => t.replace(new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), "{creatorName}"), text);
      const subject = toPlaceholder(r.subject ?? "");
      const body = toPlaceholder(r.body ?? "");
      setPreview(prev => (prev ? { ...prev, subject, body, styleNote: r.styleNote ?? "", referencePost: r.referencePost ?? "", loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function regenerate() {
    if (!preview) return;
    setPreview({ ...preview, loading: true, error: "" });
    try {
      const r = await generateOutreachPreview(preview.leadId, preview.styleNote, preview.referencePost, preview.campaignId || undefined);
      setPreview(prev => (prev ? { ...prev, subject: r.subject ?? prev.subject, body: r.body ?? prev.body, loading: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, loading: false, error: caught instanceof Error ? caught.message : "Preview failed." } : prev));
    }
  }

  async function rewrite() {
    if (!preview || !preview.rewriteNote.trim()) return;
    setPreview({ ...preview, rewriting: true, error: "" });
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rewrite",
          leadId: preview.leadId,
          campaignId: preview.campaignId || undefined,
          subject: preview.subject,
          body: preview.body,
          styleNote: preview.styleNote,
          referencePost: preview.referencePost,
          instruction: preview.rewriteNote,
        }),
      });
      const payload = (await res.json()) as { subject?: string; body?: string; error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Rewrite failed.");
      setPreview(prev => (prev ? { ...prev, subject: payload.subject ?? prev.subject, body: payload.body ?? prev.body, rewriting: false } : prev));
    } catch (caught) {
      setPreview(prev => (prev ? { ...prev, rewriting: false, error: caught instanceof Error ? caught.message : "Rewrite failed." } : prev));
    }
  }

  async function send() {
    if (!preview) return;
    setPreview({ ...preview, sending: true, error: "" });
    try {
      if (preview.bulkLeadIds?.length) {
        // Bulk mode: send template to all pending creators.
        const res = await fetch("/api/outreach-picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulk_approve", campaignId: preview.campaignId || undefined, subject: preview.subject, body: preview.body, leadIds: preview.bulkLeadIds }),
        });
        const payload = (await res.json()) as { sent?: number; skipped?: number; error?: unknown };
        if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Bulk send failed.");
        setItemState(prev => {
          const next = { ...prev };
          for (const id of preview.bulkLeadIds!) next[id] = "approved";
          return next;
        });
      } else {
        // Single mode: send to just this creator.
        const res = await fetch("/api/outreach-picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve", leadId: preview.leadId, campaignId: preview.campaignId || undefined, subject: preview.subject, body: preview.body, styleNote: preview.styleNote, referencePost: preview.referencePost }),
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
          throw new Error(typeof payload.error === "string" ? payload.error : "Send failed.");
        }
        setItemState(prev => ({ ...prev, [preview.leadId]: "approved" }));
      }
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

  const pendingCount = data?.picks.filter(p => (itemState[p.leadId] ?? "idle") === "idle").length ?? 0;

  return (
    <section className="ops-panel outreach-picks-panel" aria-labelledby="outreach-picks-title">
      <div className="ops-panel-header compact">
        <div>
          <p className="section-eyebrow">Daily outreach</p>
          <h2 id="outreach-picks-title">Today&apos;s picks</h2>
        </div>
        <div className="outreach-picks-header-right">
          {data ? (
            <span className="outreach-picks-meta">
              {data.picks.length} to contact · {data.needsContactInfo} need email · {data.excludedCount} held back
            </span>
          ) : null}
        </div>
      </div>

      {pendingCount > 1 ? (
        <div className="outreach-send-all-bar">
          <button type="button" className="primary outreach-send-all-btn" onClick={openBulk}>
            Send all ({pendingCount})
          </button>
        </div>
      ) : null}

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

      {preview ? <PreviewModal preview={preview} setPreview={setPreview} campaigns={campaigns} onRegenerate={regenerate} onRewrite={rewrite} onSend={send} /> : null}
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
  const imgSrc = avatarSrc(pick.platformLinks);
  // Deduplicate links by detected platform+handle so the same creator doesn't appear twice.
  const seenKeys = new Set<string>();
  const uniqueLinks = pick.platformLinks.filter(pl => {
    const p = detectPlatform(pl.url, pl.platform).toUpperCase();
    const key = `${p}:${pl.handle ?? pl.url}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  return (
    <article className="outreach-pick-card">
      <div className="outreach-pick-avatar-wrap">
        {imgSrc
          ? <img className="outreach-pick-avatar" src={imgSrc} alt={pick.name} width={44} height={44} onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; (e.currentTarget.nextElementSibling as HTMLElement).style.display = "flex"; }} />
          : null}
        <div className="outreach-pick-avatar-fallback" style={imgSrc ? { display: "none" } : {}}>
          {pick.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="outreach-pick-main">
        <div className="outreach-pick-top-row">
          <div className="outreach-pick-name-row">
            <strong className="outreach-pick-name">{pick.name}</strong>
            {pick.handle ? <span className="outreach-pick-handle">@{pick.handle}</span> : null}
          </div>
          <span className={`creator-warmth ${pick.warmth}`}>{pick.warmth}</span>
        </div>
        <div className="outreach-pick-platform-links">
          {uniqueLinks.map(pl => {
            const p = detectPlatform(pl.url, pl.platform);
            return (
              <a key={pl.url} className={`outreach-platform-link`} href={pl.url} target="_blank" rel="noopener noreferrer">
                {platformIcon(p)} {platformLabel(p)}{pl.handle ? ` @${pl.handle}` : ""}
              </a>
            );
          })}
        </div>
        <div className="outreach-pick-stats">
          {pick.followers != null ? <span><span className="outreach-stat-label">Followers</span> {fmtNum(pick.followers)}</span> : null}
          {pick.avgViews != null ? <span><span className="outreach-stat-label">Avg. views</span> {fmtNum(pick.avgViews)}</span> : null}
          {(pick.priceMin != null || pick.priceMax != null) ? <span><span className="outreach-stat-label">Price</span> {fmtPrice(pick.priceMin, pick.priceMax)}</span> : null}
          {pick.email ? <span><span className="outreach-stat-label">Email</span> {pick.email}</span> : null}
        </div>
        <p className="outreach-pick-why">{pick.whyNow}</p>
        <div className="outreach-pick-tags">
          <span className="outreach-pick-play">{pick.playLabel}</span>
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

export function PreviewModal({ preview, setPreview, campaigns = [], onRegenerate, onRewrite, onSend }: { preview: PreviewState; setPreview: (value: PreviewState | null) => void; campaigns?: Campaign[]; onRegenerate: () => void; onRewrite: () => void; onSend: () => void }) {
  const busy = preview.loading || preview.sending || preview.rewriting;
  return (
    <div className="ops-modal-backdrop" role="presentation" onClick={() => (busy ? null : setPreview(null))}>
      <section className="ops-modal outreach-preview-modal" role="dialog" aria-modal="true" aria-label="Outreach preview" onClick={event => event.stopPropagation()}>
        <div className="ops-modal-header">
          <div>
            <p className="section-eyebrow">{preview.bulkLeadIds ? `Send to all ${preview.bulkLeadIds.length} creators` : "Preview before sending"}</p>
            <h2>{preview.bulkLeadIds ? "Bulk outreach" : preview.name}</h2>
            <p>{preview.bulkLeadIds
              ? <>Generated from <strong>{preview.name}</strong>. Edit the email below — use <code>{"{creatorName}"}</code> where you want their name and it will be personalised for each creator automatically.</>
              : "Add what you genuinely liked about their content — the opener anchors on it. Leave blank to open on their niche."
            }</p>
          </div>
          <button type="button" onClick={() => setPreview(null)} disabled={busy} aria-label="Close preview">Close</button>
        </div>

        <div className="outreach-preview-body">
        {campaigns.length > 0 ? (
          <label className="outreach-preview-field">
            <span>Campaign</span>
            <select
              value={preview.campaignId}
              disabled={busy}
              onChange={event => setPreview({ ...preview, campaignId: event.target.value })}
            >
              <option value="">— No campaign —</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        ) : null}

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

        <div className="outreach-rewrite-box">
          <p className="outreach-rewrite-title">Rewrite with AI</p>
          <textarea
            rows={2}
            value={preview.rewriteNote}
            disabled={busy}
            placeholder="e.g. make it shorter and more casual, mention we ship product samples"
            onChange={event => setPreview({ ...preview, rewriteNote: event.target.value })}
          />
          <div className="outreach-rewrite-actions">
            <button type="button" className="outreach-rewrite-send" disabled={busy || !preview.rewriteNote.trim() || !preview.subject || !preview.body} onClick={onRewrite}>
              {preview.rewriting ? "Rewriting…" : "Rewrite email"}
            </button>
            <span className="outreach-rewrite-hint">Rewrites subject + body. You can still edit before sending.</span>
          </div>
        </div>

        {preview.error ? <p className="creator-drawer-error">{preview.error}</p> : null}

        <div className="outreach-preview-actions">
          <button type="button" disabled={busy} onClick={() => setPreview(null)}>Cancel</button>
          <button type="button" className="primary" disabled={busy || !preview.subject || !preview.body} onClick={onSend}>
            {preview.sending ? "Sending…" : preview.bulkLeadIds ? `Send to all ${preview.bulkLeadIds.length} creators` : "Send first email"}
          </button>
        </div>
        </div>
      </section>
    </div>
  );
}
