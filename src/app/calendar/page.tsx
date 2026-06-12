// [Claude 2026-06-12] Visit calendar — every scheduled creator visit in one month
// view: which creator is visiting which workspace/venue, on which day. Events are
// the calendar invites sent from Inbox threads; click-through goes to the thread.
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/db";
import { requirePageContext } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

type CalendarEvent = {
  date: string; // YYYY-MM-DD
  time: string | null;
  creatorName: string;
  venueName: string;
  threadId: string;
};

export default async function CalendarPage({ searchParams }: { searchParams?: { m?: string } }) {
  const { user, workspace, role } = await requirePageContext("/calendar");

  const now = new Date();
  const monthParam = searchParams?.m && /^\d{4}-\d{2}$/.test(searchParams.m) ? searchParams.m : null;
  const [year, month] = monthParam
    ? monthParam.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const inviteMessages = await prisma.conversationMessage.findMany({
    where: {
      direction: "INTERNAL",
      subject: "Calendar invite sent",
      thread: { workspaceId: workspace.id },
    },
    orderBy: { createdAt: "asc" },
    include: {
      thread: {
        select: {
          id: true,
          creatorEmail: true,
          creatorLead: { select: { displayName: true, handle: true } },
        },
      },
    },
  });

  const events: CalendarEvent[] = [];
  for (const message of inviteMessages) {
    const metadata = isRecord(message.metadata) ? message.metadata : {};
    const date = typeof metadata.date === "string" ? metadata.date : null;
    if (!date) continue;
    events.push({
      date,
      time: typeof metadata.time === "string" ? metadata.time : null,
      creatorName: message.thread.creatorLead?.displayName || message.thread.creatorLead?.handle || message.thread.creatorEmail || "Creator",
      venueName: workspace.name,
      threadId: message.thread.id,
    });
  }

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    if (!event.date.startsWith(monthKey)) continue;
    eventsByDay.set(event.date, [...(eventsByDay.get(event.date) ?? []), event]);
  }

  const weeks = buildMonthGrid(year, month);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(year, month - 1, 1));
  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcoming = events
    .filter(event => event.date >= todayIso)
    .sort((left, right) => (left.date + (left.time || "")).localeCompare(right.date + (right.time || "")))
    .slice(0, 8);

  return (
    <AppShell
      activeNav="calendar"
      user={{ name: user.name, email: user.email, phone: user.phone, workspaceName: workspace.name, role }}
    >
      <section className="ops-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Visits</p>
            <h1>Calendar</h1>
            <p>Every scheduled creator visit — who is visiting {workspace.name}, and when.</p>
          </div>
          <div className="calendar-nav">
            <a className="calendar-nav-button" href={`/calendar?m=${prev}`} aria-label="Previous month">←</a>
            <strong>{monthLabel}</strong>
            <a className="calendar-nav-button" href={`/calendar?m=${next}`} aria-label="Next month">→</a>
          </div>
        </div>

        <div className="calendar-grid" role="table" aria-label={`Visit calendar for ${monthLabel}`}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(label => (
            <div className="calendar-grid-head" key={label}>{label}</div>
          ))}
          {weeks.flat().map((cell, index) => {
            const dayEvents = cell ? eventsByDay.get(cell.iso) ?? [] : [];
            return (
              <div
                className={`calendar-cell${cell ? "" : " empty"}${cell?.iso === todayIso ? " today" : ""}`}
                key={cell ? cell.iso : `empty-${index}`}
              >
                {cell ? <span className="calendar-day-number">{cell.day}</span> : null}
                {dayEvents.map(event => (
                  <a className="calendar-event" href={`/inbox/${event.threadId}`} key={`${event.threadId}-${event.time}`}>
                    <strong>{event.time ? `${event.time} · ` : ""}{event.creatorName}</strong>
                    <span>@ {event.venueName}</span>
                  </a>
                ))}
              </div>
            );
          })}
        </div>

        <section className="calendar-upcoming" aria-label="Upcoming visits">
          <h2>Upcoming visits</h2>
          {upcoming.length ? (
            <ul>
              {upcoming.map(event => (
                <li key={`${event.threadId}-${event.date}-${event.time}`}>
                  <a href={`/inbox/${event.threadId}`}>
                    <strong>{formatDateLabel(event.date)}{event.time ? ` · ${event.time}` : ""}</strong>
                    <span>{event.creatorName} visits {event.venueName}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="calendar-empty-note">No upcoming visits yet. When a creator confirms a date in the Inbox, send the calendar invite and it will appear here.</p>
          )}
        </section>
      </section>
    </AppShell>
  );
}

function buildMonthGrid(year: number, month: number) {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ iso: string; day: number } | null> = [];
  for (let blank = 0; blank < firstDow; blank += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, day });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<{ iso: string; day: number } | null>> = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

function shiftMonth(year: number, month: number, delta: number) {
  const value = new Date(year, month - 1 + delta, 1);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateLabel(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(year, month - 1, day));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
