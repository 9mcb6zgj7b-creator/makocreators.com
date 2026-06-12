// [Claude 2026-06-11] Calendar invite support for Inbox threads.
// 1) extractVisitDateHint: find a concrete date mention in a creator reply
//    (English "June 20", "6/20" and Chinese "6月20日/号" formats).
// 2) sendCalendarInviteEmail: email a standard .ics invite (METHOD:REQUEST) to the
//    signed-in user via Resend, plus an "Add to Google Calendar" link. No Google
//    OAuth required — Gmail renders the .ics as a one-click calendar invite.
import { UserFacingError } from "@/lib/api";

export type VisitDateHint = {
  iso: string; // YYYY-MM-DD
  raw: string; // the matched text, e.g. "June 20" or "6月20号"
  time: string | null; // HH:MM (24h), e.g. "19:00"
  rawTime: string | null; // the matched text, e.g. "7pm" or "下午7点"
};

// [Claude 2026-06-12] Also scan for a time-of-day mention ("7pm", "7:30 pm", "19:00",
// "下午7点", "7点半") so the suggestion can prefill the time, not just the date.
export function extractVisitTimeHint(text: string): { time: string; raw: string } | null {
  const ampm = text.match(/\b(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  if (ampm) {
    let hour = Number(ampm[1]);
    const minute = ampm[2] ? Number(ampm[2]) : 0;
    if (hour >= 1 && hour <= 12) {
      const isPm = ampm[3].toLowerCase().startsWith("p");
      if (isPm && hour !== 12) hour += 12;
      if (!isPm && hour === 12) hour = 0;
      return { time: formatTime(hour, minute), raw: ampm[0].trim() };
    }
  }

  const chinese = text.match(/(早上|上午|中午|下午|晚上)?\s*(\d{1,2})\s*点\s*(半|[0-5]?\d\s*分)?/);
  if (chinese) {
    let hour = Number(chinese[2]);
    if (hour >= 0 && hour <= 23) {
      const period = chinese[1] || "";
      if ((period === "下午" || period === "晚上") && hour < 12) hour += 12;
      const minute = chinese[3] === "半" ? 30 : chinese[3] ? Number(chinese[3].replace(/[分\s]/g, "")) : 0;
      return { time: formatTime(hour, minute), raw: chinese[0].trim() };
    }
  }

  const h24 = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (h24) {
    return { time: formatTime(Number(h24[1]), Number(h24[2])), raw: h24[0] };
  }

  return null;
}

function formatTime(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

const MONTH_NAMES: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

// [Claude 2026-06-12] Bug fix: email bodies contain quoted reply history, including
// Gmail's attribution line ("On Wed, Jun 11, 2026 at 4:52 PM Mike <...> wrote:"),
// whose date was being picked up as the "mentioned" visit date. Strip quoted content
// before scanning so only the creator's OWN words are considered.
export function stripQuotedReply(text: string) {
  let cut = text.length;

  // Gmail / Apple Mail attribution: "On <date> ... wrote:" (possibly wrapped).
  const onWrote = text.match(/\bOn [^\n]{0,160}?\n?[^\n]{0,160}?wrote:/i);
  if (onWrote && typeof onWrote.index === "number") cut = Math.min(cut, onWrote.index);

  // Chinese Gmail attribution: "在 ... 写道："
  const chineseWrote = text.match(/在[^\n]{0,160}写道[:：]/);
  if (chineseWrote && typeof chineseWrote.index === "number") cut = Math.min(cut, chineseWrote.index);

  // Outlook-style separators and forwarded headers.
  for (const marker of ["-----Original Message-----", "________________________________"]) {
    const index = text.indexOf(marker);
    if (index >= 0) cut = Math.min(cut, index);
  }
  const fromHeader = text.match(/^From:\s.+$/m);
  if (fromHeader && typeof fromHeader.index === "number") cut = Math.min(cut, fromHeader.index);

  // Drop classic ">" quote lines anywhere in what remains.
  return text
    .slice(0, cut)
    .split("\n")
    .filter(line => !line.trimStart().startsWith(">"))
    .join("\n");
}

export function extractVisitDateHint(rawText: string, now = new Date()): VisitDateHint | null {
  if (!rawText) return null;
  const text = stripQuotedReply(rawText);
  const timeHint = extractVisitTimeHint(text);
  const withTime = (hint: { iso: string; raw: string }): VisitDateHint => ({
    ...hint,
    time: timeHint?.time ?? null,
    rawTime: timeHint?.raw ?? null,
  });

  // English month-name format: "June 20", "Jun 20th"
  const monthName = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (monthName) {
    const month = MONTH_NAMES[monthName[1].toLowerCase()];
    const day = Number(monthName[2]);
    const iso = buildUpcomingIso(month, day, now);
    if (iso) return withTime({ iso, raw: monthName[0].trim() });
  }

  // Chinese format: "6月20日" / "6月20号"
  const chinese = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*[日号]/);
  if (chinese) {
    const iso = buildUpcomingIso(Number(chinese[1]), Number(chinese[2]), now);
    if (iso) return withTime({ iso, raw: chinese[0].trim() });
  }

  // Numeric format: "6/20" or "6-20" (US month-first; skip if it looks like a year)
  const numeric = text.match(/\b(\d{1,2})[\/-](\d{1,2})\b(?![\/-]?\d)/);
  if (numeric) {
    const iso = buildUpcomingIso(Number(numeric[1]), Number(numeric[2]), now);
    if (iso) return withTime({ iso, raw: numeric[0].trim() });
  }

  return null;
}

function buildUpcomingIso(month: number, day: number, now: Date): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  let year = now.getFullYear();
  const candidate = new Date(year, month - 1, day);
  if (candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null;
  // If the date already passed this year (more than a day ago), assume next year.
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (candidate < startOfToday) year += 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export type CalendarInviteInput = {
  toEmail: string;
  toName: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string | null; // HH:MM (24h), optional → all-day
  durationMinutes?: number;
  description: string;
};

export async function sendCalendarInviteEmail(input: CalendarInviteInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new UserFacingError("Resend is not configured, so the calendar invite email cannot be sent.", 503);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    throw new UserFacingError("Provide the event date as YYYY-MM-DD.");
  }
  if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) {
    throw new UserFacingError("Provide the event time as HH:MM.");
  }

  const ics = buildIcs(input, from);
  const googleLink = buildGoogleCalendarLink(input);
  const dateLabel = input.time ? `${input.date} ${input.time}` : input.date;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.toEmail,
      subject: `Calendar invite: ${input.title} (${dateLabel})`,
      text: [
        `Calendar invite: ${input.title}`,
        `When: ${dateLabel}`,
        "",
        input.description,
        "",
        `Add to Google Calendar: ${googleLink}`,
        "",
        "An .ics invite is attached — open it to add the event to any calendar app.",
      ].join("\n"),
      attachments: [
        {
          filename: "invite.ics",
          content: Buffer.from(ics, "utf8").toString("base64"),
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 240);
    console.error("Calendar invite email failed:", detail);
    throw new UserFacingError("Sending the calendar invite email failed. Please try again.", 502);
  }

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  return { providerMessageId: data.id ?? null, googleLink };
}

function buildIcs(input: CalendarInviteInput, organizerEmail: string) {
  const uid = `mako-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@makocreators.com`;
  const dtstamp = toIcsUtc(new Date());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mako Creator//Outreach//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
  ];

  const day = input.date.replace(/-/g, "");
  if (input.time) {
    const start = input.time.replace(":", "") + "00";
    const duration = Math.min(Math.max(input.durationMinutes ?? 60, 15), 12 * 60);
    const endDate = addMinutes(input.date, input.time, duration);
    // Floating local time (no Z): calendar apps place it in the viewer's timezone.
    lines.push(`DTSTART:${day}T${start}`);
    lines.push(`DTEND:${endDate}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${day}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(input.date)}`);
  }

  lines.push(
    `SUMMARY:${escapeIcsText(input.title)}`,
    `DESCRIPTION:${escapeIcsText(input.description)}`,
    `ORGANIZER;CN=Mako Creator:mailto:${organizerEmail}`,
    `ATTENDEE;CN=${escapeIcsText(input.toName)};ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:${input.toEmail}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return lines.join("\r\n");
}

function buildGoogleCalendarLink(input: CalendarInviteInput) {
  const day = input.date.replace(/-/g, "");
  let dates: string;
  if (input.time) {
    const start = input.time.replace(":", "") + "00";
    const duration = Math.min(Math.max(input.durationMinutes ?? 60, 15), 12 * 60);
    dates = `${day}T${start}/${addMinutes(input.date, input.time, duration)}`;
  } else {
    dates = `${day}/${nextDay(input.date)}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates,
    details: input.description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function addMinutes(date: string, time: string, minutes: number) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hour, minute + minutes);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(value.getDate())}T${pad(value.getHours())}${pad(value.getMinutes())}00`;
}

function nextDay(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(year, month - 1, day + 1);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${value.getFullYear()}${pad(value.getMonth() + 1)}${pad(value.getDate())}`;
}

function toIcsUtc(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
