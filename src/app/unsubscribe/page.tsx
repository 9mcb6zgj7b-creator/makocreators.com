import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// [Claude 2026-06-10] Security/compliance fix (M2): the unsubscribe used to happen as a
// side effect of rendering the GET page, so email security gateways (Outlook SafeLinks,
// AV link scanners) that prefetch links silently closed threads. The GET now only renders
// a confirmation form; the actual close runs in a POST server action.

type UnsubscribePageProps = {
  searchParams?: {
    thread?: string;
    done?: string;
  };
};

async function confirmUnsubscribe(formData: FormData) {
  "use server";

  const threadId = String(formData.get("thread") || "").trim();
  if (threadId) {
    const thread = await prisma.conversationThread.findUnique({ where: { id: threadId } });
    if (thread && thread.state !== "CLOSED") {
      const metadata = Boolean(thread.metadata) && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
        ? thread.metadata as Record<string, unknown>
        : {};
      await prisma.$transaction([
        prisma.conversationThread.update({
          where: { id: threadId },
          data: {
            state: "CLOSED",
            nextActionAt: null,
            metadata: { ...metadata, unsubscribe: true },
          },
        }),
        prisma.conversationMessage.create({
          data: {
            threadId,
            direction: "INTERNAL",
            subject: "Creator unsubscribed",
            textBody: "Creator confirmed the unsubscribe link. Thread closed.",
            metadata: { automation: "unsubscribe-link" },
          },
        }),
      ]);
    }
  }

  redirect(`/unsubscribe?thread=${encodeURIComponent(threadId)}&done=1`);
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const threadId = searchParams?.thread?.trim() || "";
  const done = searchParams?.done === "1";

  const thread = threadId
    ? await prisma.conversationThread.findUnique({ where: { id: threadId }, select: { id: true, state: true } })
    : null;

  const confirmed = done || thread?.state === "CLOSED";
  const heading = confirmed
    ? "Unsubscribe confirmed"
    : thread
      ? "Confirm unsubscribe"
      : "Link not recognized";
  const body = confirmed
    ? "You have been unsubscribed from this creator outreach thread. No further emails will be sent."
    : thread
      ? "Click the button below to stop receiving emails from this outreach thread."
      : "We could not find that outreach thread, but no further action is needed.";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#faf8f4" }}>
      <section style={{ maxWidth: 520, border: "1px solid #e8e3da", borderRadius: 20, background: "#fff", padding: 28, boxShadow: "0 20px 60px rgba(15,23,42,0.08)" }}>
        <p style={{ margin: "0 0 8px", color: "#f97316", fontWeight: 900, textTransform: "uppercase", fontSize: 12 }}>Mako Creator</p>
        <h1 style={{ margin: "0 0 10px", fontSize: 30, letterSpacing: "-0.04em" }}>{heading}</h1>
        <p style={{ margin: 0, color: "#687080", fontWeight: 700, lineHeight: 1.6 }}>{body}</p>
        {!confirmed && thread ? (
          <form action={confirmUnsubscribe} style={{ marginTop: 20 }}>
            <input type="hidden" name="thread" value={thread.id} />
            <button
              type="submit"
              style={{
                border: "none",
                borderRadius: 12,
                background: "#f97316",
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                padding: "12px 22px",
                cursor: "pointer",
              }}
            >
              Unsubscribe me
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
