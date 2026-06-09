import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    { error: "Google OAuth is not configured. Please use email verification." },
    { status: 410 }
  );
}
