// [Claude 2026-06-11] "Today's To-Do" — the single card to clear every day:
// ① outreach picks ② pending approvals ③ open ops tasks.
import type { ReactNode } from "react";
import { ApprovalActions } from "@/components/approval-actions";
import { OpsTaskList } from "@/components/ops-task-list";
import type { OpsApproval, OpsTask } from "@/lib/ops-overview";

export function TodayTodoPanel({
  approvals,
  tasks,
  children,
}: {
  approvals: OpsApproval[];
  tasks: OpsTask[];
  children: ReactNode;
}) {
  return (
    <section className="ops-panel todo-panel" aria-labelledby="today-todo-title">
      <div className="ops-panel-header compact">
        <div>
          <p className="section-eyebrow">Daily operations</p>
          <h2 id="today-todo-title">Today&apos;s To-Do</h2>
        </div>
        <span className="outreach-picks-meta">
          {approvals.length} approval{approvals.length === 1 ? "" : "s"} · {tasks.length} open task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="todo-section">
        <div className="todo-section-header">
          <span className="todo-step-badge">1</span>
          <h3>Outreach picks</h3>
        </div>
        <div className="todo-section-body todo-picks-host">{children}</div>
      </div>

      <div className="todo-section">
        <div className="todo-section-header">
          <span className="todo-step-badge">2</span>
          <h3>Pending approvals</h3>
          <span className="todo-count">{approvals.length}</span>
        </div>
        <div className="todo-section-body">
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
              <strong>Nothing waiting for approval</strong>
              <p>Asset sends, visit scheduling, and low-confidence replies will appear here when a human decision is needed.</p>
            </div>
          )}
        </div>
      </div>

      <div className="todo-section">
        <div className="todo-section-header">
          <span className="todo-step-badge">3</span>
          <h3>Open ops tasks</h3>
          <span className="todo-count">{tasks.length}</span>
        </div>
        <div className="todo-section-body">
          <OpsTaskList tasks={tasks} />
        </div>
      </div>
    </section>
  );
}
