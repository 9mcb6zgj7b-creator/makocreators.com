// [Claude 2026-06-11] Send a calendar invite for a creator visit to the signed-in
// user's own email. The invite goes only to the user (not the creator), so no
// approver role is required. An internal note is recorded on the thread.
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
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = schema.parse(await req.json());

    if (!user.email) {
      throw new UserFacingError("Your account has no email address, so a calendar invite cannot be sent to you.");
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
      toEmail: user.email,
      toName: user.name || user.email,
      title,
      date: body.date,
      time: body.time ?? null,
      durationMinutes: body.durationMinutes,
      description,
    });

    const dateLabel = body.time ? `${body.date} ${body.time}` : body.date;
    await prisma.conversationMessage.create({
      data: {
        threadId: thread.id,
        direction: "INTERNAL",
        subject: "Calendar invite sent",
        textBody: `Calendar invite "${title}" (${dateLabel}) was emailed to ${user.email}.`,
        metadata: { automation: "calendar-invite", date: body.date, time: body.time ?? null, sentTo: user.email },
      },
    });

    return ok({ ok: true, sentTo: user.email, googleLink: result.googleLink });
  } catch (error) {
    return apiError(error, "Failed to send the calendar invite.");
  }
}
