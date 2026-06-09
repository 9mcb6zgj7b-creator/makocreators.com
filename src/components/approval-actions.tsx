"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ApprovalActionStatus = "APPROVED" | "NEEDS_CHANGES" | "REJECTED";
type ApiErrorResponse = {
  error?: string | Array<{ message?: string }>;
};

const actions: Array<{ status: ApprovalActionStatus; label: string; note: string }> = [
  { status: "APPROVED", label: "Approve", note: "Approved by a human inside Mako." },
  { status: "NEEDS_CHANGES", label: "Needs changes", note: "Returned for revision before any action." },
  { status: "REJECTED", label: "Reject", note: "Rejected before any external action." },
];

export function ApprovalActions({ approvalId, isPreview, title }: { approvalId?: string; isPreview?: boolean; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<ApprovalActionStatus | null>(null);
  const [error, setError] = useState("");

  if (isPreview || !approvalId) {
    return <span className="ops-preview-note">Preview item</span>;
  }

  function updateApproval(status: ApprovalActionStatus, note: string) {
    setError("");
    setPendingStatus(status);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/approvals/${approvalId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            decisionNotes: `${note} Item: ${title}`,
          }),
        });

        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
          throw new Error(formatApiError(data.error) || "Could not update approval.");
        }

        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Could not update approval.");
        setPendingStatus(null);
      }
    });
  }

  return (
    <div className="ops-approval-actions">
      {actions.map(action => (
        <button
          type="button"
          key={action.status}
          disabled={isPending}
          onClick={() => updateApproval(action.status, action.note)}
        >
          {isPending && pendingStatus === action.status ? "Saving..." : action.label}
        </button>
      ))}
      {error ? <span role="status">{error}</span> : null}
    </div>
  );
}

function formatApiError(error: ApiErrorResponse["error"]) {
  if (Array.isArray(error)) {
    return error.map(issue => issue.message).filter(Boolean).join(" ");
  }

  return error || "";
}
