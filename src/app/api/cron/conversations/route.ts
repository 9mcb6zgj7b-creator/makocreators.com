import { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api";
import { processDueConversationThreads } from "@/lib/conversation-automation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    assertCronAuthorized(req);
    const result = await processDueConversationThreads();
    return ok(result);
  } catch (error) {
    return apiError(error, "Failed to process conversation cron.");
  }
}

function assertCronAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return;
  const auth = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  if (auth !== `Bearer ${secret}` && querySecret !== secret) {
    throw new Error("Unauthorized cron request.");
  }
}
