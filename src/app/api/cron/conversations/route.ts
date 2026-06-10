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
  // [Claude 2026-06-09] Security fix: fail closed when CRON_SECRET is missing.
  // Previously an unset secret returned early and left this endpoint fully open,
  // letting anyone trigger outreach follow-up emails. In production we now require
  // the secret; unauthenticated access is only allowed in local development.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRON_SECRET is not configured.");
    }
    return;
  }
  const auth = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("secret");
  if (auth !== `Bearer ${secret}` && querySecret !== secret) {
    throw new Error("Unauthorized cron request.");
  }
}
