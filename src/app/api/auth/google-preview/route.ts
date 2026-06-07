import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { PREVIEW_SESSION_COOKIE, SESSION_COOKIE, createGooglePreviewSession, getSessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  role: z.enum(["brand", "creator"]).default("brand"),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const session = await createGooglePreviewSession(body.role);
    const res = ok({
      ok: true,
      provider: "google",
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      },
      workspace: {
        id: session.workspace.id,
        name: session.workspace.name,
        slug: session.workspace.slug,
      },
    });
    res.cookies.set(session.preview ? PREVIEW_SESSION_COOKIE : SESSION_COOKIE, session.token, getSessionCookieOptions());
    return res;
  } catch (error) {
    return apiError(error, "Google sign-in failed.");
  }
}
