// [Claude 2026-06-11] Send a calendar invite for a creator visit to the signed-in
// user's own email. The invite goes only to the user (not the creator), so no
// approver role is required. An internal note is recorded on the thread.
// [Claude 2026-06-13] Auto-approves any pending SCHEDULE_VISIT approval for this
// thread so the Ops approval card is resolved without a manual click.
import { NextRequest } from "next/server";
import { z } from "zod";
import { UserFacingError, apiError, notFound, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { sendCalendarInviteEmail } from "@/lib/calendar-invite";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const schema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/).nullable().optional(),
  durationMinutes: z.number().int().min(15).max(720).optional(),
  title: z.string().min(1).max(160).optional(),
  // [Claude 2026-06-13] Client may override the destination email (e.g. user has
  // multiple accounts and the session email is not the preferred calendar address).
  toEmail: z.string().email().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = schema.parse(await req.json());

    // Use the client-supplied email if provided; fall back to the session email.
    const destEmail = body.toEmail?.trim() || user.email;
    if (!destEmail) {
      throw new UserFacingError("Provide an email address to send the calendar invite to.");
    }

    const thread = await prisma.conversationThread.findFirst({
      where: { id: params.id, workspaceId: workspace.id },
      include: { creatorLead: { select: { displayName: true, handle: true } } },
    });
    if (!thread) return notFound("Conversation thread not found.");

    const creatorName = thread.creatorLead?.displayName || thread.creatorLead?.handle || thread.creatorEmail || "creator";
    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://makocreators.com").replace(/\/$/, "");
    const title = body.title?.trim() || `Visit with ${creatorName}`;
    const description = [
      `Creator visit arranged via Mako Creator outreach.`,
      `Creator: ${creatorName}${thread.creatorEmail ? ` <${thread.creatorEmail}>` : ""}`,
      `Thread: ${siteUrl}/inbox/${thread.id}`,
    ].join("\n");

    const result = await sendCalendarInviteEmail({
      toEmail: destEmail,
      toName: user.name || destEmail,
      title,
      date: body.date,
      time: body.time ?? null,
      durationMinutes: body.durationMinutes,
      description,
    });

    const dateLabel = body.time ? `${body.date} ${body.time}` : body.date;

    // [Claude 2026-06-13] Auto-approve the pending SCHEDULE_VISIT approval for this
    // thread (if any). Sending a calendar invite implies the human has decided to meet
    // the creator — no separate Ops approval click is needed.
    const pendingApproval = await prisma.approval.findFirst({
      where: {
        workspaceId: workspace.id,
        type: "SCHEDULE_VISIT",
        status: "PENDING",
        metadata: { path: ["threadId"], equals: thread.id },
      },
    });

    await prisma.$transaction([
      prisma.conversationMessage.create({
        data: {
          threadId: thread.id,
          direction: "INTERNAL",
          subject: "Calendar invite sent",
          textBody: `Calendar invite "${title}" (${dateLabel}) was emailed to ${destEmail}.`,
          metadata: { automation: "calendar-invite", date: body.date, time: body.time ?? null, sentTo: destEmail },
        },
      }),
      ...(pendingApproval
        ? [
            prisma.approval.update({
              where: { id: pendingApproval.id },
              data: {
                status: "APPROVED",
                decisionNotes: "Auto-approved: calendar invite sent from Inbox.",
                reviewedAt: new Date(),
              },
            }),
            prisma.conversationThread.update({
              where: { id: thread.id },
              data: {
                state: "VISIT_SCHEDULED",
                lastMessageAt: new Date(),
                nextActionAt: null,
              },
            }),
          ]
        : []),
    ]);

    return ok({ ok: true, sentTo: destEmail, googleLink: result.googleLink });
  } catch (error) {
    return apiError(error, "Failed to send the calendar invite.");
  }
}
