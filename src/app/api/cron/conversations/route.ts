import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api";
import { purgeExpiredAuthRows } from "@/lib/auth";
import { processDueConversationThreads } from "@/lib/conversation-automation";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    assertCronAuthorized(req);
    const result = await processDueConversationThreads();

    // [Claude 2026-06-10] L4: housekeeping piggybacks on the daily cron; a cleanup
    // failure must never fail the outreach run.
    let cleanup: Awaited<ReturnType<typeof purgeExpiredAuthRows>> | null = null;
    try {
      cleanup = await purgeExpiredAuthRows();
    } catch (error) {
      console.error("Cron: auth row cleanup failed", error);
    }

    return ok({ ...result, cleanup });
  } catch (error) {
    return apiError(error, "Failed to process conversation cron.");
  }
}

function assertCronAuthorized(req: NextRequest) {
  // [Claude 2026-06-09] Security fix: fail closed when CRON_SECRET is missing.
  // Previously an unset secret returned early and left this endpoint fully open,
  // letting anyone trigger outreach follow-up emails. In production we now require
  // the secret; unauthenticated access is only allowed in local development.
  // [Claude 2026-06-10] M1 hardening: the secret is no longer accepted via query
  // string (query params end up in access logs and proxies), and the comparison is
  // timing-safe. Vercel cron sends `Authorization: Bearer ${CRON_SECRET}` natively.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRON_SECRET is not configured.");
    }
    return;
  }
  const auth = req.headers.get("authorization") || "";
  if (!safeEqual(auth, `Bearer ${secret}`)) {
    throw new Error("Unauthorized cron request.");
  }
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
