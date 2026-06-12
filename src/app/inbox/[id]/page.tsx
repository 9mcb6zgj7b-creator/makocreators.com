// [Claude 2026-06-10] Inbox thread detail — full message history for one creator
// conversation: outbound emails, creator replies (with AI classification), and
// internal system notes.
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CalendarInviteSuggestion } from "@/components/calendar-invite-suggestion";
import { InboxReplyForm } from "@/components/inbox-reply-form";
import { extractVisitDateHint } from "@/lib/calendar-invite";
import { prisma } from "@/lib/db";
import { requirePageContext } from "@/lib/page-auth";
import { describeThreadState, formatTimestamp } from "@/lib/inbox-format";

export const dynamic = "force-dynamic";

export default async function InboxThreadPage({ params }: { params: { id: string } }) {
  const { user, workspace, role } = await requirePageContext(`/inbox/${params.id}`);

  const thread = await prisma.conversationThread.findFirst({
    where: { id: params.id, workspaceId: workspace.id },
    include: {
      creatorLead: { select: { displayName: true, handle: true, platform: true, profileUrl: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!thread) notFound();

  const creatorName = thread.creatorLead?.displayName || thread.creatorLead?.handle || thread.creatorEmail || "Unknown creator";
  const stateInfo = describeThreadState(thread.state);

  // [Claude 2026-06-11] If the latest creator reply mentions a concrete date, suggest
  // sending a calendar invite to the signed-in user's email. The suggestion is hidden
  // once an invite for this thread already appears in the message history.
  const lastInbound = [...thread.messages].reverse().find(message => message.direction === "INBOUND");
  const inviteAlreadySent = thread.messages.some(
    message => message.direction === "INTERNAL" && message.subject === "Calendar invite sent"
  );
  const dateHint = !inviteAlreadySent && lastInbound
    ? extractVisitDateHint(lastInbound.textBody || "")
    : null;

  return (
    <AppShell
      activeNav="inbox"
      user={{ name: user.name, email: user.email, phone: user.phone, workspaceName: workspace.name, role }}
    >
      <section className="ops-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow"><a href="/inbox" className="inbox-back-link">← Inbox</a></p>
            <h1>{creatorName}</h1>
            <p>
              {thread.creatorEmail || "No email on file"}
              {thread.creatorLead?.platform ? ` · ${thread.creatorLead.platform}` : ""}
              {" · "}
              <span className={`inbox-state ${stateInfo.tone}`}>{stateInfo.label}</span>
            </p>
          </div>
        </div>

        <div className="inbox-message-list">
          {thread.messages.map(message => {
            const directionClass = message.direction === "INBOUND" ? "inbound" : message.direction === "OUTBOUND" ? "outbound" : "internal";
            const who = message.direction === "INBOUND" ? creatorName : message.direction === "OUTBOUND" ? "You (Mako outreach)" : "System note";
            return (
              <article className={`inbox-message ${directionClass}`} key={message.id}>
                <header>
                  <strong>{who}</strong>
                  <span>{formatTimestamp(message.createdAt)}</span>
                </header>
                {message.subject ? <p className="inbox-message-subject">{message.subject}</p> : null}
                <p className="inbox-message-body">{message.textBody || "(no text content)"}</p>
                {message.direction === "INBOUND" && message.intent ? (
                  <footer>
                    AI read this as: <em>{message.intent.replace(/_/g, " ")}</em>
                    {typeof message.confidence === "number" ? ` (${Math.round(message.confidence * 100)}% confident)` : ""}
                  </footer>
                ) : null}
              </article>
            );
          })}
        </div>

        {dateHint && user.email ? (
          <CalendarInviteSuggestion
            threadId={thread.id}
            creatorName={creatorName}
            userEmail={user.email}
            detectedDate={dateHint.iso}
            detectedRaw={dateHint.raw}
          />
        ) : null}

        {thread.creatorEmail ? (
          <InboxReplyForm
            threadId={thread.id}
            creatorEmail={thread.creatorEmail}
            disabled={thread.state === "CLOSED"}
            disabledReason="This creator unsubscribed — sending more email is blocked."
          />
        ) : (
          <p className="inbox-reply-hint">This thread has no creator email on file, so replying is unavailable.</p>
        )}
      </section>
    </AppShell>
  );
}
