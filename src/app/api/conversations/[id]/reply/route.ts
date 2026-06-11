// [Claude 2026-06-10] Human reply from the Inbox. The human composes and sends, so this
// IS the human approval — no extra gate. The email keeps the thread reply-to address and
// X-Mako-Thread-ID header so the creator's next reply lands back in the same thread.
import { NextRequest } from "next/server";
import { z } from "zod";
import { UserFacingError, apiError, notFound, ok } from "@/lib/api";
import { getRequestContext, requireApproverRole } from "@/lib/auth";
import { buildUnsubscribeUrl, sendConversationEmail } from "@/lib/conversation-email";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  body: z.string().min(1).max(6000),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, workspace, role } = await getRequestContext();
    requireApproverRole(role);
    const body = schema.parse(await req.json());

    const thread = await prisma.conversationThread.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
    });
    if (!thread) return notFound("Conversation thread not found.");
    if (!thread.creatorEmail) throw new UserFacingError("This thread has no creator email on file.");
    if (thread.state === "CLOSED") throw new UserFacingError("This creator unsubscribed — sending more email is blocked.");

    const subject = thread.subject
      ? /^re:/i.test(thread.subject) ? thread.subject : `Re: ${thread.subject}`
      : "Re: your conversation";
    const text = `${body.body.trim()}\n\nUnsubscribe: ${buildUnsubscribeUrl(thread.id)}`;
    const email = await sendConversationEmail({ thread, to: thread.creatorEmail, subject, text });

    await prisma.$transaction([
      prisma.conversationMessage.create({
        data: {
          threadId: thread.id,
          direction: "OUTBOUND",
          provider: email.provider,
          providerMessageId: email.providerMessageId,
          fromEmail: process.env.RESEND_FROM_EMAIL,
          toEmail: thread.creatorEmail,
          subject,
          textBody: text,
          metadata: { manualReply: true, sentById: user.id },
        },
      }),
      prisma.conversationThread.update({
        where: { id: thread.id },
        data: {
          lastMessageAt: new Date(),
          // A human reply resolves the "needs human" flag; automation stays paused
          // (nextActionAt remains null, so no robo follow-ups resume).
          state: thread.state === "NEEDS_HUMAN" ? "REPLIED" : thread.state,
        },
      }),
    ]);

    return ok({ ok: true, threadId: thread.id });
  } catch (error) {
    return apiError(error, "Failed to send the reply.");
  }
}
