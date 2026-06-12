"use client";

// [Claude 2026-06-11] Suggestion card shown when the latest creator reply mentions a
// concrete date: one click sends a .ics calendar invite to the signed-in user's email.
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CalendarInviteSuggestion({
  threadId,
  creatorName,
  userEmail,
  detectedDate,
  detectedRaw,
  detectedTime,
  detectedRawTime,
}: {
  threadId: string;
  creatorName: string;
  userEmail: string;
  detectedDate: string;
  detectedRaw: string;
  detectedTime?: string | null;
  detectedRawTime?: string | null;
}) {
  const router = useRouter();
  const [date, setDate] = useState(detectedDate);
  const [time, setTime] = useState(detectedTime || "");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [googleLink, setGoogleLink] = useState("");
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function send() {
    if (sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${threadId}/calendar-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time: time || null }),
      });
      const payload = (await res.json().catch(() => ({}))) as { sentTo?: string; googleLink?: string; error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Failed to send the calendar invite.");
      setSentTo(payload.sentTo || userEmail);
      setGoogleLink(payload.googleLink || "");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send the calendar invite.");
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <aside className="calendar-suggestion sent">
        <p className="calendar-suggestion-title">Calendar invite sent</p>
        <p className="calendar-suggestion-text">
          The invite was emailed to <strong>{sentTo}</strong> — open it there to add the event.
          {googleLink ? (
            <>
              {" "}Or <a href={googleLink} target="_blank" rel="noreferrer">add it to Google Calendar directly</a>.
            </>
          ) : null}
        </p>
      </aside>
    );
  }

  return (
    <aside className="calendar-suggestion" aria-label="Calendar suggestion">
      <p className="calendar-suggestion-title">Schedule this visit?</p>
      <p className="calendar-suggestion-text">
        {creatorName} mentioned <strong>{detectedRaw}{detectedRawTime ? ` · ${detectedRawTime}` : ""}</strong> in their reply. Send a calendar invite to {userEmail}?
      </p>
      <div className="calendar-suggestion-controls">
        <label>
          <span>Date</span>
          <input type="date" value={date} disabled={sending} onChange={event => setDate(event.target.value)} />
        </label>
        <label>
          <span>Time (optional)</span>
          <input type="time" value={time} disabled={sending} onChange={event => setTime(event.target.value)} />
        </label>
        <button type="button" className="calendar-suggestion-send" disabled={sending || !date} onClick={send}>
          {sending ? "Sending…" : "Send calendar invite"}
        </button>
        <button type="button" className="calendar-suggestion-dismiss" disabled={sending} onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
      {error ? <p className="creator-drawer-error">{error}</p> : null}
    </aside>
  );
}
