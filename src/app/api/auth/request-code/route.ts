import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { createLoginChallenge } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const challenge = await createLoginChallenge(body.identifier);
    return ok({
      ok: true,
      identifier: challenge.identifier,
      delivery: challenge.delivery,
      devCode: process.env.AUTH_SHOW_DEV_CODE === "true" ? challenge.code : undefined,
    });
  } catch (error) {
    return apiError(error, "无法发送验证码");
  }
}
