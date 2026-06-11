// [Claude 2026-06-10] Inbox — conversation threads with creators, including their
// replies (which only lived in the database until now). List view; click into a
// thread for the full message history.
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/db";
import { requirePageContext } from "@/lib/page-auth";
import { describeThreadState, formatTimestamp } from "@/lib/inbox-format";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const { user, workspace, role } = await requirePageContext("/inbox");

  const threads = await prisma.conversationThread.findMany({
    where: { workspaceId: workspace.id, state: { not: "DRAFT" } },
    orderBy: [{ lastMessageAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 100,
    include: {
      creatorLead: { select: { displayName: true, handle: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { direction: true, textBody: true, subject: true, createdAt: true },
      },
      _count: { select: { messages: true } },
    },
  });

  const awaitingReply = threads.filter(thread => thread.state === "NEEDS_HUMAN").length;

  return (
    <AppShell
      activeNav="inbox"
      user={{ name: user.name, email: user.email, phone: user.phone, workspaceName: workspace.name, role }}
    >
      <section className="ops-page">
        <div className="page-heading-row">
          <div>
            <p className="section-eyebrow">Conversations</p>
            <h1>Inbox</h1>
            <p>Every outreach thread and creator reply in one place.{awaitingReply ? ` ${awaitingReply} thread${awaitingReply === 1 ? "" : "s"} need${awaitingReply === 1 ? "s" : ""} your attention.` : ""}</p>
          </div>
        </div>

        {threads.length ? (
          <div className="inbox-thread-list">
            {threads.map(thread => {
              const creatorName = thread.creatorLead?.displayName || thread.creatorLead?.handle || thread.creatorEmail || "Unknown creator";
              const lastMessage = thread.messages[0];
              const stateInfo = describeThreadState(thread.state);
              return (
                <a className="inbox-thread-row" href={`/inbox/${thread.id}`} key={thread.id}>
                  <div className="inbox-thread-main">
                    <div className="inbox-thread-title-row">
                      <strong>{creatorName}</strong>
                      <span className={`inbox-state ${stateInfo.tone}`}>{stateInfo.label}</span>
                      {lastMessage?.direction === "INBOUND" ? <span className="inbox-state replied">Creator replied</span> : null}
                    </div>
                    <p className="inbox-thread-subject">{thread.subject || lastMessage?.subject || "(no subject)"}</p>
                    {lastMessage?.textBody ? <p className="inbox-thread-snippet">{lastMessage.textBody.slice(0, 140)}</p> : null}
                  </div>
                  <div className="inbox-thread-meta">
                    <span>{formatTimestamp(thread.lastMessageAt || thread.createdAt)}</span>
                    <span>{thread._count.messages} message{thread._count.messages === 1 ? "" : "s"}</span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="creator-list-empty">
            <strong>No conversations yet</strong>
            <p>Once you approve outreach from Today&apos;s picks, threads and creator replies will appear here.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
