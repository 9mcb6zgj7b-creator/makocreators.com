"use client";

// [Claude 2026-06-11] Open ops task list — shows what the "Open ops tasks" count
// contains: expandable details, a link to the related Inbox thread, and Mark done.
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OpsTask } from "@/lib/ops-overview";

export function OpsTaskList({ tasks: initialTasks }: { tasks: OpsTask[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function markDone(taskId: string) {
    setBusyId(taskId);
    setError("");
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
        throw new Error(typeof payload.error === "string" ? payload.error : "Could not mark the task done.");
      }
      setTasks(prev => prev.filter(task => task.id !== taskId));
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not mark the task done.");
    } finally {
      setBusyId(null);
    }
  }

  if (!tasks.length) {
    return (
      <div className="creator-list-empty">
        <strong>No open tasks</strong>
        <p>Follow-ups and review work created by outreach automation will appear here.</p>
      </div>
    );
  }

  return (
    <div className="ops-task-list">
      {error ? <p className="creator-drawer-error">{error}</p> : null}
      {tasks.map(task => {
        const expanded = expandedId === task.id;
        const busy = busyId === task.id;
        return (
          <article className="ops-task-row" key={task.id}>
            <div className="ops-task-main">
              <div className="ops-card-title-row">
                <strong>{task.title}</strong>
                <span className="ops-task-type">{task.type}</span>
                {task.priority >= 8 ? <span className="ops-task-priority">High priority</span> : null}
              </div>
              <small>{formatTaskDate(task.createdAt)}</small>
              {expanded && task.description ? <p className="ops-task-description">{task.description}</p> : null}
            </div>
            <div className="ops-task-actions">
              {task.description ? (
                <button type="button" onClick={() => setExpandedId(expanded ? null : task.id)}>
                  {expanded ? "Hide details" : "Details"}
                </button>
              ) : null}
              {task.threadId ? (
                <a className="ops-task-thread-link" href={`/inbox/${task.threadId}`}>
                  Open thread
                </a>
              ) : null}
              <button type="button" className="ops-task-done" disabled={busy} onClick={() => markDone(task.id)}>
                {busy ? "Saving…" : "Mark done"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatTaskDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}
