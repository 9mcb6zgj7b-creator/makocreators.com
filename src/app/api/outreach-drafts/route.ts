import { NextRequest } from "next/server";
import { z } from "zod";
import { OutreachChannel } from "@prisma/client";
import { apiError, created, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const createDraftSchema = z.object({
  shortlistItemId: z.string().optional(),
  channel: z.nativeEnum(OutreachChannel).default("EMAIL"),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(8000),
});

export async function GET() {
  try {
    const { workspace } = await getRequestContext();
    const drafts = await prisma.outreachDraft.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });
    return ok({ drafts });
  } catch (error) {
    return apiError(error, "读取邀约草稿失败");
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = createDraftSchema.parse(await req.json());
    const draft = await prisma.outreachDraft.create({
      data: {
        workspaceId: workspace.id,
        createdById: user.id,
        shortlistItemId: body.shortlistItemId,
        channel: body.channel,
        subject: body.subject,
        body: body.body,
      },
    });
    return created({ draft });
  } catch (error) {
    return apiError(error, "创建邀约草稿失败");
  }
}
