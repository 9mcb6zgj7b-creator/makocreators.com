import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "@/lib/auth";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function notFound(message = "Not found.") {
  return NextResponse.json({ error: message }, { status: 404 });
}

// [Claude 2026-06-10] Errors whose message is safe and useful to show the end user
// (e.g. "AI rewrite is not configured"). apiError surfaces these verbatim even in
// production, unlike generic Errors which get the fallback message.
export class UserFacingError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function apiError(error: unknown, fallback = "Request failed.") {
  console.error("API route error", error);

  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof UserFacingError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.issues }, { status: 400 });
  }

  if (error instanceof Error) {
    const message = process.env.NODE_ENV === "development" ? error.message || fallback : fallback;
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ error: fallback }, { status: 500 });
}
