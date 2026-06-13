"use client";

// [Claude 2026-06-12] Right-rail visit scheduler for Inbox threads. No home-made
// calendar: "Open in Google Calendar" opens a prefilled event in the user's own
// Google Calendar (they hit Save there); editing later also happens in Google
// Calendar. The .ics email invite remains as a secondary option, and previously
// scheduled visits are listed with day-jump links into Google Calendar.
import { useState } from "react";
import { useRouter } from "next/navigation";

export type SentInvite = {
  date: string; // YYYY-MM-DD
  time: string | null;
  sentAt: string;
};

export function VisitSchedulePanel({
  threadId,
  creatorName,
  venueName,
  userEmail,
  detectedDate,
  detectedRaw,
  detectedTime,
  detectedRawTime,
  sentInvites,
}: {
  threadId: string;
  creatorName: string;
  venueName: string;
  userEmail: string | null;
  detectedDate?: string | null;
  detectedRaw?: string | null;
  detectedTime?: string | null;
  detectedRawTime?: string | null;
  sentInvites: SentInvite[];
}) {
  const router = useRouter();
  const [date, setDate] = useState(detectedDate || "");
  const [time, setTime] = useState(detectedTime || "");
  const [toEmail, setToEmail] = useState(userEmail || "");
  const [emailing, setEmailing] = useState(false);
  const [emailedTo, setEmailedTo] = useState("");
  const [error, setError] = useState("");

  const title = `${creatorName} visits ${venueName}`;
  const googleUrl = date ? buildGoogleTemplateUrl({ title, date, time, details: `Creator visit arranged via Mako Creator.\nCreator: ${creatorName}` }) : null;

  async function emailInvite() {
    if (!date || !toEmail || emailing) return;
    setEmailing(true);
    setError("");
    try {
      const res = await fetch(`/api/conversations/${threadId}/calendar-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time: time || null, title, toEmail }),
      });
      const payload = (await res.json().catch(() => ({}))) as { sentTo?: string; error?: unknown };
      if (!res.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Failed to send the invite email.");
      setEmailedTo(payload.sentTo || toEmail);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to send the invite email.");
    } finally {
      setEmailing(false);
    }
  }

  return (
    <aside className="visit-panel" aria-label="Visit scheduling">
      <p className="visit-panel-eyebrow">Visit scheduling</p>
      <h3>{title}</h3>

      {detectedRaw ? (
        <p className="visit-panel-hint">
          Detected from the latest reply: <strong>{detectedRaw}{detectedRawTime ? ` · ${detectedRawTime}` : ""}</strong>
        </p>
      ) : (
        <p className="visit-panel-hint muted">No date detected in the latest reply yet — pick one manually.</p>
      )}

      <label className="visit-panel-field">
        <span>Date</span>
        <input type="date" value={date} onChange={event => setDate(event.target.value)} />
      </label>
      <label className="visit-panel-field">
        <span>Time (optional)</span>
        <input type="time" value={time} onChange={event => setTime(event.target.value)} />
      </label>

      <a
        className={`visit-panel-google${googleUrl ? "" : " disabled"}`}
        href={googleUrl ?? undefined}
        target="_blank"
        rel="noreferrer"
        aria-disabled={!googleUrl}
        onClick={event => {
          if (!googleUrl) event.preventDefault();
        }}
      >
        Open in Google Calendar
      </a>

      <label className="visit-panel-field">
        <span>Send invite to</span>
        <input
          type="email"
          value={toEmail}
          onChange={event => setToEmail(event.target.value)}
          placeholder="your@email.com"
        />
      </label>

      <button type="button" className="visit-panel-email" disabled={!date || !toEmail || emailing} onClick={emailInvite}>
        {emailing ? "Sending…" : "Email me the .ics invite"}
      </button>

      {emailedTo ? <p className="visit-panel-success">Invite emailed to {emailedTo}.</p> : null}
      {error ? <p className="creator-drawer-error">{error}</p> : null}

      <div className="visit-panel-history">
        <p className="visit-panel-eyebrow">Scheduled visits</p>
        {sentInvites.length ? (
          <ul>
            {sentInvites.map(invite => (
              <li key={`${invite.date}-${invite.time}-${invite.sentAt}`}>
                <span>
                  {invite.date}
                  {invite.time ? ` · ${invite.time}` : ""}
                </span>
                <a href={buildGoogleDayUrl(invite.date)} target="_blank" rel="noreferrer">
                  View / edit in Google Calendar
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="visit-panel-hint muted">No visits scheduled for this creator yet.</p>
        )}
      </div>
    </aside>
  );
}

function buildGoogleTemplateUrl({ title, date, time, details }: { title: string; date: string; time: string; details: string }) {
  const day = date.replace(/-/g, "");
  let dates: string;
  if (time) {
    const start = time.replace(":", "") + "00";
    dates = `${day}T${start}/${day}T${addHour(time)}00`;
  } else {
    dates = `${day}/${nextDay(date)}`;
  }
  const params = new URLSearchParams({ action: "TEMPLATE", text: title, dates, details });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function addHour(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const endHour = (hour + 1) % 24;
  return `${String(endHour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
}

function nextDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day + 1);
  return `${value.getFullYear()}${String(value.getMonth() + 1).padStart(2, "0")}${String(value.getDate()).padStart(2, "0")}`;
}

function buildGoogleDayUrl(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return `https://calendar.google.com/calendar/u/0/r/day/${year}/${month}/${day}`;
}
