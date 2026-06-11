"use client";

// [Claude 2026-06-10] Reply composer for the Inbox thread page.
import { useState } from "react";
import { useRouter } from "next/navigation";

export function InboxReplyForm({ threadId, creatorEmail, disabled, disabledReason }: { threadId: string; creatorEmail: string; disabled?: boolean; disabledReason?: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function send() {
    if (!body.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const payload = (await res.json().catch(() => ({}))) as { error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Failed to send the reply.");
      setBody("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send the reply.");
    } finally {
      setSending(false);
    }
  }

  if (disabled) {
    return <p className="inbox-reply-hint">{disabledReason || "Replying is not available for this thread."}</p>;
  }

  return (
    <div className="inbox-reply-form">
      <p className="inbox-reply-form-title">Reply to {creatorEmail}</p>
      <textarea
        rows={4}
        value={body}
        disabled={sending}
        placeholder="Write your reply… (an unsubscribe line is added automatically)"
        onChange={event => setBody(event.target.value)}
      />
      {error ? <p className="creator-drawer-error">{error}</p> : null}
      <div className="inbox-reply-form-actions">
        <button type="button" className="inbox-reply-send" disabled={sending || !body.trim()} onClick={send}>
          {sending ? "Sending…" : "Send reply"}
        </button>
        <span className="outreach-rewrite-hint">Sends from your outreach address — the creator&apos;s reply will land back in this thread.</span>
      </div>
    </div>
  );
}
