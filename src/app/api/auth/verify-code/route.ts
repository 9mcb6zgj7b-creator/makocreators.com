import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { SESSION_COOKIE, getSessionCookieOptions, verifyLoginChallenge } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(3),
  code: z.string().min(4).max(12),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const session = await verifyLoginChallenge(body.identifier, body.code);
    const res = ok({
      ok: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        phone: session.user.phone,
        name: session.user.name,
      },
      workspace: {
        id: session.workspace.id,
        name: session.workspace.name,
        slug: session.workspace.slug,
      },
    });
    res.cookies.set(SESSION_COOKIE, session.token, getSessionCookieOptions());
    return res;
  } catch (error) {
    return apiError(error, "Sign-in failed.");
  }
}
