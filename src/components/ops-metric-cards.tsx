"use client";

import { useState } from "react";
import { ApprovalActions } from "@/components/approval-actions";
import type { OpsApproval, OpsCreatorListRow, OpsMetric } from "@/lib/ops-overview";

type ActiveList = "all" | "contactable" | "approvals" | null;

export function OpsMetricCards({
  metrics,
  creators,
  contactableCreators,
  approvals,
}: {
  metrics: OpsMetric[];
  creators: OpsCreatorListRow[];
  contactableCreators: OpsCreatorListRow[];
  approvals: OpsApproval[];
}) {
  const [activeList, setActiveList] = useState<ActiveList>(null);
  const activeRows = activeList === "contactable" ? contactableCreators : creators;
  const activeTitle = activeList === "approvals" ? "Pending Approvals" : activeList === "contactable" ? "Contactable Creators" : "Creators Tracked";
  const activeDescription = activeList === "approvals"
    ? "Human approval gates for assets, visits, and other sensitive creator actions."
    : activeList === "contactable"
      ? "Creators in this workspace with an email available for outreach preparation."
      : "Unique creators saved or imported in this workspace.";

  return (
    <>
      <section className="ops-metrics" aria-label="Operations metrics">
        {metrics.map(metric => {
          if (metric.label === "Creators tracked") {
            return (
              <MetricAction
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                onOpen={() => setActiveList("all")}
              />
            );
          }

          if (metric.label === "Contactable creators") {
            return (
              <MetricAction
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                onOpen={() => setActiveList("contactable")}
              />
            );
          }

          if (metric.label === "Pending approvals") {
            return (
              <MetricAction
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                onOpen={() => setActiveList("approvals")}
              />
            );
          }

          return <Metric key={metric.label} label={metric.label} value={metric.value} note={metric.note} />;
        })}
      </section>

      {activeList ? (
        <div className="ops-modal-backdrop" role="presentation" onClick={() => setActiveList(null)}>
          <section
            aria-labelledby="ops-creator-list-modal-title"
            aria-modal="true"
            className="ops-modal"
            role="dialog"
            onClick={event => event.stopPropagation()}
          >
            <div className="ops-modal-header">
              <div>
                <p className="section-eyebrow">Creator list</p>
                <h2 id="ops-creator-list-modal-title">{activeTitle}</h2>
                <p>{activeDescription}</p>
              </div>
              <button type="button" onClick={() => setActiveList(null)} aria-label="Close creator list">
                Close
              </button>
            </div>

            {activeList === "approvals" ? (
              <ApprovalList approvals={approvals} />
            ) : (
              <CreatorTable activeRows={activeRows} activeList={activeList} activeTitle={activeTitle} />
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}

function CreatorTable({ activeRows, activeList, activeTitle }: { activeRows: OpsCreatorListRow[]; activeList: ActiveList; activeTitle: string }) {
  return (
    <div className="creator-list-table" role="table" aria-label={activeTitle}>
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
      {activeRows.length ? (
        activeRows.map((creator, index) => (
          <div className="creator-list-table-row" role="row" key={`${creator.name}-${creator.email}-${index}`}>
            <span title={creator.name}>{valueOrMissing(creator.name)}</span>
            <span title={creator.platform}>{valueOrMissing(creator.platform)}</span>
            <span title={creator.followerNumber}>{valueOrMissing(creator.followerNumber)}</span>
            <span title={creator.link}>{valueOrMissing(creator.link)}</span>
            <span title={creator.email}>{valueOrMissing(creator.email)}</span>
            <span title={creator.price}>{valueOrMissing(creator.price)}</span>
            <span title={creator.contactDate}>{valueOrMissing(creator.contactDate)}</span>
            <span title={creator.avgViews}>{valueOrMissing(creator.avgViews)}</span>
          </div>
        ))
      ) : (
        <div className="creator-list-empty">
          <strong>No creators found</strong>
          <p>{activeList === "contactable" ? "No saved creators have an email yet." : "Import a creator spreadsheet or paste creator contacts first."}</p>
        </div>
      )}
    </div>
  );
}

function ApprovalList({ approvals }: { approvals: OpsApproval[] }) {
  if (!approvals.length) {
    return (
      <div className="creator-list-empty">
        <strong>No pending approvals</strong>
        <p>Asset sends, visit scheduling, and low-confidence replies will appear here when a human decision is needed.</p>
      </div>
    );
  }

  return (
    <div className="ops-modal-approval-list">
      {approvals.map(approval => (
        <article key={approval.id || approval.title} className="ops-approval-card">
          <div className="ops-card-title-row">
            <strong>{approval.title}</strong>
            <span className={`ops-risk ${approval.risk.toLowerCase()}`}>{approval.risk}</span>
          </div>
          <small>{approval.type}</small>
          <p>{approval.summary}</p>
          <ApprovalActions approvalId={approval.id} isPreview={approval.isPreview} title={approval.title} />
        </article>
      ))}
    </div>
  );
}

function Metric({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function MetricAction({ label, value, note, onOpen }: { label: string; value: number; note: string; onOpen: () => void }) {
  return (
    <article className="ops-metric-link-card">
      <button type="button" aria-label={`Open ${label} list`} onClick={onOpen}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
        <em>Open List</em>
      </button>
    </article>
  );
}

function valueOrMissing(value: string) {
  return value && value.trim() ? value : "missing";
}
