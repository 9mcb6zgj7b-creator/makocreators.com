// [Claude 2026-06-25] Creator avatar image proxy. Serves the bytes cached in
// CreatorAvatar, resolving + storing on a miss (see lib/creator-avatar). Returns the
// image so the outreach cards can <img src> it directly; a 404 lets the client fall
// back to the initials circle. Public on purpose — these are profile pictures, and the
// <img> requests are unauthenticated browser loads.
import { NextResponse } from "next/server";
import { getCachedAvatarBytes } from "@/lib/creator-avatar";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { platform: string; handle: string } }
) {
  const handle = safeDecode(params.handle);
  const result = await getCachedAvatarBytes(params.platform, handle).catch(() => null);

  if (!result) {
    // Cache the miss briefly so a wall of cards doesn't re-trigger resolution every load.
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "public, max-age=3600" } });
  }

  return new NextResponse(new Uint8Array(result.data), {
    status: 200,
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
