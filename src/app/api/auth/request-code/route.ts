import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, ok } from "@/lib/api";
import { createLoginChallenge, getClientIp } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  identifier: z.string().min(3),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const challenge = await createLoginChallenge(body.identifier, { ip: getClientIp(req) });
    return ok({
      ok: true,
      identifier: challenge.identifier,
      delivery: challenge.delivery,
      devCode: process.env.AUTH_SHOW_DEV_CODE === "true" && process.env.NODE_ENV !== "production" ? challenge.code : undefined,
    });
  } catch (error) {
    return apiError(error, "Failed to send the verification code.");
  }
}
