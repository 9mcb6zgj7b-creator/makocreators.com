"use client";

import { useState } from "react";
import { ApprovalActions, ReopenApprovalButton } from "@/components/approval-actions";
import { ComposeOutreachButton } from "@/components/compose-outreach-button";
import { OpsTaskList } from "@/components/ops-task-list";
import type { OpsApproval, OpsCreatorListRow, OpsMetric, OpsTask } from "@/lib/ops-overview";

type ActiveList = "all" | "contactable" | "approvals" | "tasks" | null;

export function OpsMetricCards({
  metrics,
  creators,
  contactableCreators,
  approvals,
  reviewedApprovals = [], // [Claude 2026-06-10]
  tasks = [], // [Claude 2026-06-11] open ops tasks for the 4th card's modal
}: {
  metrics: OpsMetric[];
  creators: OpsCreatorListRow[];
  contactableCreators: OpsCreatorListRow[];
  approvals: OpsApproval[];
  reviewedApprovals?: OpsApproval[];
  tasks?: OpsTask[];
}) {
  const [activeList, setActiveList] = useState<ActiveList>(null);
  const activeRows = activeList === "contactable" ? contactableCreators : creators;
  const activeTitle = activeList === "tasks"
    ? "Open Ops Tasks"
    : activeList === "approvals" ? "Approvals" : activeList === "contactable" ? "Contactable Creators" : "Creators Tracked";
  const activeDescription = activeList === "tasks"
    ? "Follow-ups and review work created by outreach automation. Mark items done to clear them."
    : activeList === "approvals"
      ? "Pending human approval gates, plus recently reviewed decisions you can reopen."
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

          if (metric.label === "Open ops tasks") {
            return (
              <MetricAction
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                onOpen={() => setActiveList("tasks")}
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

            {activeList === "tasks" ? (
              <OpsTaskList tasks={tasks} />
            ) : activeList === "approvals" ? (
              <ApprovalList approvals={approvals} reviewedApprovals={reviewedApprovals} />
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
        <span>Actions</span>
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
            <span>
              {creator.leadId && creator.email !== "missing" ? (
                <ComposeOutreachButton leadId={creator.leadId} name={creator.name} />
              ) : (
                <span className="compose-outcome suppressed">No email</span>
              )}
            </span>
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

// [Claude 2026-06-10] Show pending approvals (with action buttons) AND recently reviewed
// approvals (with a Reopen button) so actioned items no longer disappear from the UI.
function ApprovalList({ approvals, reviewedApprovals }: { approvals: OpsApproval[]; reviewedApprovals: OpsApproval[] }) {
  return (
    <div className="ops-modal-approval-list">
      {approvals.length ? (
        approvals.map(approval => (
          <article key={approval.id || approval.title} className="ops-approval-card">
            <div className="ops-card-title-row">
              <strong>{approval.title}</strong>
              <span className={`ops-risk ${approval.risk.toLowerCase()}`}>{approval.risk}</span>
            </div>
            <small>{approval.type}</small>
            <p>{approval.summary}</p>
            <ApprovalActions approvalId={approval.id} isPreview={approval.isPreview} title={approval.title} />
          </article>
        ))
      ) : (
        <div className="creator-list-empty">
          <strong>No pending approvals</strong>
          <p>Asset sends, visit scheduling, and low-confidence replies will appear here when a human decision is needed.</p>
        </div>
      )}

      {reviewedApprovals.length ? (
        <section className="ops-reviewed-approvals" aria-label="Recently reviewed approvals">
          <h3 className="section-eyebrow">Recently reviewed</h3>
          {reviewedApprovals.map(approval => (
            <article key={approval.id || approval.title} className="ops-approval-card reviewed">
              <div className="ops-card-title-row">
                <strong>{approval.title}</strong>
                <span className={`ops-approval-status ${(approval.status || "").toLowerCase()}`}>{formatStatusLabel(approval.status)}</span>
              </div>
              <small>{approval.type}</small>
              <p>{approval.summary}</p>
              {approval.decisionNotes ? <p className="ops-decision-notes">Note: {approval.decisionNotes}</p> : null}
              <ReopenApprovalButton approvalId={approval.id} isPreview={approval.isPreview} />
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}

function formatStatusLabel(status?: string) {
  switch (status) {
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "NEEDS_CHANGES":
      return "Needs changes";
    default:
      return status || "Reviewed";
  }
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
