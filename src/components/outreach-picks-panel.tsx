"use client";

// [Claude 2026-06-10] Feature 3 — "Today's outreach picks" panel.
// Loads the ranked daily list from /api/outreach-picks; each row shows why_now + play +
// score with one-click Approve (starts outreach / sends first touch) or Skip (snoozes).
import { useEffect, useState } from "react";
import type { OutreachPick, OutreachPicksResult } from "@/lib/outreach-picks";

type ItemState = "idle" | "working" | "approved" | "skipped";

export function OutreachPicksPanel() {
  const [data, setData] = useState<OutreachPicksResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [itemState, setItemState] = useState<Record<string, ItemState>>({});

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

  async function act(pick: OutreachPick, action: "approve" | "skip") {
    setItemState(prev => ({ ...prev, [pick.leadId]: "working" }));
    try {
      const res = await fetch("/api/outreach-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, leadId: pick.leadId }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(typeof payload.error === "string" ? payload.error : "Action failed.");
      }
      setItemState(prev => ({ ...prev, [pick.leadId]: action === "approve" ? "approved" : "skipped" }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Action failed.");
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
              <OutreachPickCard key={pick.leadId} pick={pick} state={itemState[pick.leadId] ?? "idle"} onAct={act} />
            ))}
          </div>
        ) : (
          <div className="creator-list-empty">
            <strong>No one to contact today</strong>
            <p>The system is holding back {data.excludedCount} creator{data.excludedCount === 1 ? "" : "s"} (do-not-contact, in flight, or too soon){data.needsContactInfo ? `, and ${data.needsContactInfo} need an email first` : ""}. Saying no is fine — import new creators or wait for replies.</p>
          </div>
        )
      ) : null}
    </section>
  );
}

function OutreachPickCard({ pick, state, onAct }: { pick: OutreachPick; state: ItemState; onAct: (pick: OutreachPick, action: "approve" | "skip") => void }) {
  if (state === "approved") {
    return (
      <article className="outreach-pick-card done">
        <strong>{pick.name}</strong>
        <span className="outreach-pick-result approved">Outreach started — first email queued</span>
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
        <button type="button" className="primary" disabled={working} onClick={() => onAct(pick, "approve")}>
          {working ? "Working…" : "Approve"}
        </button>
        <button type="button" disabled={working} onClick={() => onAct(pick, "skip")}>
          Skip
        </button>
      </div>
    </article>
  );
}
