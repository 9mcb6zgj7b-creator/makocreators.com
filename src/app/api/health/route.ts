import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    ok: true,
    service: "makocreators.com",
    environment: process.env.NODE_ENV,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    resendApiKeyConfigured: Boolean(process.env.RESEND_API_KEY),
    resendFromEmailConfigured: Boolean(process.env.RESEND_FROM_EMAIL),
    twilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_PHONE),
    authSecretConfigured: Boolean(process.env.AUTH_SECRET),
    localPreviewAuthEnabled: process.env.AUTH_SHOW_DEV_CODE === "true" && process.env.NODE_ENV !== "production",
    checkedAt: new Date().toISOString(),
  });
}
