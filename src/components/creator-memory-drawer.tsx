"use client";

// [Claude 2026-06-10] Feature 1 — creator list with a click-to-open memory dossier drawer.
// Each row opens a right-side drawer that fetches /api/creator-memory and shows identity,
// reach, warmth, and the interaction timeline (what we saw / sent / they replied).
import { useState } from "react";
import type { CreatorMemory } from "@/lib/creator-memory";
import type { OpsCreatorListRow } from "@/lib/ops-overview";

export function CreatorMemoryList({
  rows,
  title,
  contactableOnly,
}: {
  rows: OpsCreatorListRow[];
  title: string;
  contactableOnly: boolean;
}) {
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const [memory, setMemory] = useState<CreatorMemory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openCreator(leadId?: string) {
    if (!leadId) return;
    setOpenLeadId(leadId);
    setMemory(null);
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/creator-memory?leadId=${encodeURIComponent(leadId)}`);
      const data = (await res.json()) as { memory?: CreatorMemory; error?: unknown };
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Could not load creator memory.");
      }
      setMemory(data.memory ?? null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load creator memory.");
    } finally {
      setLoading(false);
    }
  }

  function close() {
    setOpenLeadId(null);
    setMemory(null);
    setError("");
  }

  return (
    <>
      <div className="creator-list-table" role="table" aria-label={title}>
        <div className="creator-list-table-head" role="row">
          <span>Creator&apos;s Name</span>
          <span>Platform</span>
          <span>Follower number</span>
          <span>Link</span>
          <span>Email</span>
          <span>Price</span>
          <span>Contact Date</span>
          <span>Avg. views</span>
        </div>
        {rows.length ? (
          rows.map((creator, index) => (
            <div
              className={`creator-list-table-row${creator.leadId ? " clickable" : ""}`}
              role="row"
              key={`${creator.name}-${creator.email}-${index}`}
              onClick={() => openCreator(creator.leadId)}
              title={creator.leadId ? "Open creator memory" : undefined}
            >
              <span>{creator.name || "missing"}</span>
              <span>{creator.platform || "missing"}</span>
              <span>{creator.followerNumber || "missing"}</span>
              <span>{creator.link || "missing"}</span>
              <span>{creator.email || "missing"}</span>
              <span>{creator.price || "missing"}</span>
              <span>{creator.contactDate || "missing"}</span>
              <span>{creator.avgViews || "missing"}</span>
            </div>
          ))
        ) : (
          <div className="creator-list-empty">
            <strong>No creators found</strong>
            <p>{contactableOnly ? "No saved creators have an email yet." : "Import a creator spreadsheet or paste creator contacts first."}</p>
          </div>
        )}
      </div>

      {openLeadId ? (
        <div className="creator-drawer-backdrop" role="presentation" onClick={close}>
          <aside className="creator-drawer" role="dialog" aria-modal="true" aria-label="Creator memory" onClick={event => event.stopPropagation()}>
            <header className="creator-drawer-header">
              <div>
                <p className="section-eyebrow">Creator memory</p>
                <h2>{memory?.name ?? (loading ? "Loading…" : "Creator")}</h2>
              </div>
              <button type="button" onClick={close} aria-label="Close creator memory">
                Close
              </button>
            </header>

            {loading ? <p className="creator-drawer-status">Loading memory…</p> : null}
            {error ? <p className="creator-drawer-error">{error}</p> : null}
            {memory ? <MemoryBody memory={memory} /> : null}
          </aside>
        </div>
      ) : null}
    </>
  );
}

function MemoryBody({ memory }: { memory: CreatorMemory }) {
  return (
    <div className="creator-drawer-body">
      <div className="ops-card-title-row">
        <span className={`creator-warmth ${memory.warmth}`}>{memory.warmthLabel}</span>
      </div>

      <div className="creator-drawer-stats">
        <Stat label="Times contacted" value={String(memory.contactCount)} />
        <Stat label="Replies" value={String(memory.replyCount)} />
        <Stat label="Last contacted" value={formatDate(memory.lastContactedAt) || "Never"} />
      </div>

      {memory.flags.unsubscribed || memory.flags.declined || memory.flags.noResponse || memory.flags.hasOpenThread ? (
        <div className="creator-drawer-flags">
          {memory.flags.unsubscribed ? <span className="creator-flag danger">Unsubscribed</span> : null}
          {memory.flags.declined ? <span className="creator-flag danger">Declined</span> : null}
          {memory.flags.noResponse ? <span className="creator-flag warn">No response</span> : null}
          {memory.flags.hasOpenThread ? <span className="creator-flag">Open thread</span> : null}
        </div>
      ) : null}

      <dl className="creator-drawer-facts">
        <Fact label="Handle" value={memory.handle} />
        <Fact label="Email" value={memory.email} />
        <Fact label="Platforms" value={memory.platforms.join(", ") || null} />
        <Fact label="Categories" value={memory.categories.join(", ") || null} />
        <Fact label="City" value={memory.city} />
        <Fact label="Followers" value={formatNumber(memory.followers)} />
        <Fact label="Avg. views" value={formatNumber(memory.avgViews)} />
        <Fact label="Price range" value={formatPrice(memory.priceMin, memory.priceMax)} />
        <Fact label="Links" value={memory.profileUrls.join("  ·  ") || null} />
      </dl>

      <div className="creator-drawer-timeline">
        <h3 className="section-eyebrow">History</h3>
        {memory.timeline.length ? (
          memory.timeline.map((event, index) => (
            <div className={`creator-timeline-item ${event.kind}`} key={`${event.date}-${index}`}>
              <span className="creator-timeline-date">{formatDate(event.date)}</span>
              <span className="creator-timeline-summary">{event.summary}</span>
            </div>
          ))
        ) : (
          <p className="creator-drawer-status">No outreach history yet — this creator has never been contacted from this workspace.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="creator-drawer-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="creator-drawer-fact">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatNumber(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : null;
}

function formatPrice(min: number | null, max: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
  const single = min ?? max;
  return single != null ? `$${single.toLocaleString()}` : null;
}
