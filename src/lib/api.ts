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

export function apiError(error: unknown, fallback = "Request failed.") {
  if (error instanceof AuthError) {
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
