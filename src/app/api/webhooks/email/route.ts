import { NextRequest } from "next/server";
import { apiError, ok } from "@/lib/api";
import { recordInboundCreatorReply } from "@/lib/conversation-automation";
import { extractInboundEmailPayload, verifyResendWebhookSignature } from "@/lib/resend-webhook";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    verifyResendWebhookSignature(rawBody, req.headers);
    const payload = JSON.parse(rawBody) as unknown;
    const inbound = extractInboundEmailPayload(payload);
    const result = await recordInboundCreatorReply(inbound);
    return ok({ ok: true, ...result });
  } catch (error) {
    return apiError(error, "Failed to process inbound email webhook.");
  }
}
