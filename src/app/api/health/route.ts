import { ok } from "@/lib/api";
import { getRequestContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

// [Claude 2026-06-10] L1 fix: configuration booleans (which services are/aren't set
// up) are reconnaissance gold for attackers, so they're only returned to a signed-in
// user. Unauthenticated callers (uptime monitors) get a bare liveness response.
export async function GET() {
  const base = {
    ok: true,
    service: "makocreators.com",
    checkedAt: new Date().toISOString(),
  };

  try {
    await getRequestContext();
  } catch {
    return ok(base);
  }

  return ok({
    ...base,
    environment: process.env.NODE_ENV,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    resendApiKeyConfigured: Boolean(process.env.RESEND_API_KEY),
    resendFromEmailConfigured: Boolean(process.env.RESEND_FROM_EMAIL),
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_PHONE),
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
    localPreviewAuthEnabled: process.env.AUTH_SHOW_DEV_CODE === "true" && process.env.NODE_ENV !== "production",
  });
}
