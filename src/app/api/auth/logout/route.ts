import { NextResponse } from "next/server";
import { apiError, ok } from "@/lib/api";
import { SESSION_COOKIE, getSessionCookieOptions, logoutCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await logoutCurrentSession();
    const res = ok({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", { ...getSessionCookieOptions(), maxAge: 0 });
    return res;
  } catch (error) {
    return apiError(error, "退出登录失败");
  }
}
