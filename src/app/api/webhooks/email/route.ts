// [Claude 2026-06-13] If the inbound email matches a known creator thread, it is
// processed as a creator reply. If no thread matches, the email is forwarded to
// OWNER_FORWARD_EMAIL so that mike@makocreators.com acts as a real inbox (direct
// messages, Gmail "Send As" verification codes, etc. all land in the owner's Gmail).
import { NextRequest } from "next/server";
import { UserFacingError, apiError, ok } from "@/lib/api";
import { recordInboundCreatorReply } from "@/lib/conversation-automation";
import {
  extractInboundEmailPayload,
  forwardEmailToOwner,
  hydrateInboundEmailPayload,
  verifyResendWebhookSignature,
} from "@/lib/resend-webhook";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    verifyResendWebhookSignature(rawBody, req.headers);
    const payload = JSON.parse(rawBody) as unknown;
    const inbound = await hydrateInboundEmailPayload(extractInboundEmailPayload(payload));

    try {
      const result = await recordInboundCreatorReply(inbound);
      return ok({ ok: true, ...result });
    } catch (inner) {
      // No matching creator thread — forward to owner inbox instead of erroring.
      if (inner instanceof UserFacingError && inner.status === 404) {
        await forwardEmailToOwner(inbound);
        return ok({ ok: true, action: "forwarded_to_owner" });
      }
      throw inner;
    }
  } catch (error) {
    return apiError(error, "Failed to process inbound email webhook.");
  }
}
