import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";
import { startCreatorOutreachAutomation } from "@/lib/conversation-automation";

export const dynamic = "force-dynamic";

const schema = z.object({
  creatorLeadIds: z.array(z.string()).max(100).optional(),
  maxThreads: z.number().int().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { user, workspace } = await getRequestContext();
    const body = schema.parse(await req.json().catch(() => ({})));
    const result = await startCreatorOutreachAutomation(workspace.id, user.id, body);
    return ok(result);
  } catch (error) {
    return apiError(error, "Failed to start creator outreach automation.");
  }
}
