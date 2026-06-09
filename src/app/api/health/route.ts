import { ok } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok({
    ok: true,
    service: "makocreators.com",
    environment: process.env.NODE_ENV,
    databaseConfigured: Boolean(process.env.DATABASE_URL),
    localPreviewAuthEnabled: process.env.AUTH_SHOW_DEV_CODE === "true",
    checkedAt: new Date().toISOString(),
  });
}
