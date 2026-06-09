import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type UnsubscribePageProps = {
  searchParams?: {
    thread?: string;
  };
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const threadId = searchParams?.thread;
  let status = "We could not find that outreach thread, but no further action is needed.";

  if (threadId) {
    const thread = await prisma.conversationThread.findUnique({ where: { id: threadId } });
    if (thread) {
      const metadata = Boolean(thread.metadata) && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
        ? thread.metadata as Record<string, unknown>
        : {};
      await prisma.conversationThread.update({
        where: { id: threadId },
        data: {
          state: "CLOSED",
          nextActionAt: null,
          metadata: { ...metadata, unsubscribe: true },
        },
      });
      await prisma.conversationMessage.create({
        data: {
          threadId,
          direction: "INTERNAL",
          subject: "Creator unsubscribed",
          textBody: "Creator used the unsubscribe link. Thread closed automatically.",
          metadata: { automation: "unsubscribe-link" },
        },
      });
      status = "You have been unsubscribed from this creator outreach thread.";
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#faf8f4" }}>
      <section style={{ maxWidth: 520, border: "1px solid #e8e3da", borderRadius: 20, background: "#fff", padding: 28, boxShadow: "0 20px 60px rgba(15,23,42,0.08)" }}>
        <p style={{ margin: "0 0 8px", color: "#f97316", fontWeight: 900, textTransform: "uppercase", fontSize: 12 }}>Mako Creator</p>
        <h1 style={{ margin: "0 0 10px", fontSize: 30, letterSpacing: "-0.04em" }}>Unsubscribe confirmed</h1>
        <p style={{ margin: 0, color: "#687080", fontWeight: 700, lineHeight: 1.6 }}>{status}</p>
      </section>
    </main>
  );
}
