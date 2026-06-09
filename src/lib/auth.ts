import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { deliverLoginCode } from "@/lib/delivery";

export const SESSION_COOKIE = "maco_session";
export const PREVIEW_SESSION_COOKIE = "maco_preview_session";
const SESSION_DAYS = 30;
const LOGIN_CODE_MINUTES = 10;
const MAX_LOGIN_ATTEMPTS = 5;
const REQUEST_CODE_IDENTIFIER_LIMIT = 5;
const REQUEST_CODE_IP_LIMIT = 20;
const VERIFY_CODE_IDENTIFIER_LIMIT = 15;
const VERIFY_CODE_IP_LIMIT = 60;
const RATE_LIMIT_WINDOW_MINUTES = 60;

type NormalizedIdentifier =
  | { kind: "email"; identifier: string; email: string; phone: null }
  | { kind: "phone"; identifier: string; email: null; phone: string };

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export function normalizeIdentifier(input: string): NormalizedIdentifier | null {
  const raw = input.trim();
  if (!raw) return null;

  const email = raw.toLowerCase();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { kind: "email", identifier: email, email, phone: null };
  }

  const digits = raw.replace(/[^\d+]/g, "");
  const phoneDigits = digits.startsWith("+") ? digits.slice(1) : digits;
  if (/^\d{7,15}$/.test(phoneDigits)) {
    const phone = `+${phoneDigits}`;
    return { kind: "phone", identifier: phone, email: null, phone };
  }

  return null;
}

export async function createLoginChallenge(input: string, context?: { ip?: string | null }) {
  const normalized = normalizeIdentifier(input);
  if (!normalized) {
    throw new Error("Please enter a valid email address or phone number.");
  }
  await enforceAuthRateLimit("request-code:identifier", normalized.identifier, REQUEST_CODE_IDENTIFIER_LIMIT, RATE_LIMIT_WINDOW_MINUTES);
  if (context?.ip) {
    await enforceAuthRateLimit("request-code:ip", context.ip, REQUEST_CODE_IP_LIMIT, RATE_LIMIT_WINDOW_MINUTES);
  }

  const code = randomInt(100000, 1_000_000).toString();
  await prisma.loginChallenge.create({
    data: {
      identifier: normalized.identifier,
      email: normalized.email,
      phone: normalized.phone,
      codeHash: hashToken(code),
      failedAttempts: 0,
      expiresAt: new Date(Date.now() + LOGIN_CODE_MINUTES * 60 * 1000),
    },
  });

  const delivered = await deliverLoginCode({ ...normalized, code });

  return {
    code,
    identifier: normalized.identifier,
    delivery: delivered.delivery,
  };
}

export async function verifyLoginChallenge(input: string, code: string, profile?: { name?: string }, context?: { ip?: string | null }) {
  const normalized = normalizeIdentifier(input);
  if (!normalized) {
    throw new Error("Please enter a valid email address or phone number.");
  }
  await enforceAuthRateLimit("verify-code:identifier", normalized.identifier, VERIFY_CODE_IDENTIFIER_LIMIT, RATE_LIMIT_WINDOW_MINUTES);
  if (context?.ip) {
    await enforceAuthRateLimit("verify-code:ip", context.ip, VERIFY_CODE_IP_LIMIT, RATE_LIMIT_WINDOW_MINUTES);
  }

  const challenge = await prisma.loginChallenge.findFirst({
    where: {
      identifier: normalized.identifier,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.lockedAt || challenge.failedAttempts >= MAX_LOGIN_ATTEMPTS) {
    throw new Error("The verification code is incorrect or expired.");
  }

  if (!secureHashCompare(challenge.codeHash, hashToken(code.trim()))) {
    const nextAttempts = challenge.failedAttempts + 1;
    await prisma.loginChallenge.update({
      where: { id: challenge.id },
      data: {
        failedAttempts: { increment: 1 },
        lockedAt: nextAttempts >= MAX_LOGIN_ATTEMPTS ? new Date() : undefined,
        consumedAt: nextAttempts >= MAX_LOGIN_ATTEMPTS ? new Date() : undefined,
      },
    });
    throw new Error(nextAttempts >= MAX_LOGIN_ATTEMPTS
      ? "Too many incorrect verification attempts. Please request a new code."
      : "The verification code is incorrect or expired.");
  }

  const user = await prisma.user.upsert({
    where: normalized.email ? { email: normalized.email } : { phone: normalized.phone! },
    update: profile?.name ? { name: profile.name } : {},
    create: {
      email: normalized.email,
      phone: normalized.phone,
      name: profile?.name || normalized.identifier,
    },
  });

  const workspace = await ensureDefaultWorkspace(user.id, normalized.identifier);
  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.loginChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    }),
    prisma.session.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  return { user, workspace, token };
}

export async function getRequestContext() {
  if (!process.env.DATABASE_URL && isPreviewAuthEnabled()) {
    const previewRole = cookies().get(PREVIEW_SESSION_COOKIE)?.value;
    if (previewRole === "brand" || previewRole === "creator") {
      return {
        user: {
          id: `preview-google-${previewRole}`,
          email: `google-${previewRole}@preview.makocreators.local`,
          phone: null,
          name: previewRole === "creator" ? "Google Creator User" : "Google Brand User",
          imageUrl: null,
        },
        workspace: {
          id: `preview-workspace-${previewRole}`,
          name: previewRole === "creator" ? "Google Creator Workspace" : "Google Brand Workspace",
          slug: `google-${previewRole}-workspace`,
        },
        role: "OWNER",
      };
    }
  }

  if (!process.env.DATABASE_URL) {
    throw new AuthError("Database-backed authentication is not configured.");
  }

  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError("Please sign in first.");

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        include: {
          memberships: {
            include: { workspace: true },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AuthError("Your session has expired.");
  }

  const membership = session.user.memberships[0];
  if (!membership) {
    throw new AuthError("No workspace is available for this account.");
  }

  return {
    user: session.user,
    workspace: membership.workspace,
    role: membership.role,
  };
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  };
}

export async function logoutCurrentSession() {
  if (!process.env.DATABASE_URL) return;

  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return;
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

async function ensureDefaultWorkspace(userId: string, identifier: string) {
  const existing = await prisma.workspace.findFirst({
    where: { members: { some: { userId } } },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  const baseSlug = slugify(identifier);
  return prisma.workspace.create({
    data: {
      name: "My Creator Workspace",
      slug: `${baseSlug}-${randomBytes(3).toString("hex")}`,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });
}

function hashToken(value: string) {
  const secret = getAuthSecret();
  if (secret) {
    return createHmac("sha256", secret).update(value).digest("hex");
  }
  return createHash("sha256").update(value).digest("hex");
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new AuthError("Authentication secret is not configured.", 500);
  }
  return null;
}

function secureHashCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function isPreviewAuthEnabled() {
  return process.env.AUTH_SHOW_DEV_CODE === "true" && process.env.NODE_ENV !== "production";
}

export function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    null;
}

async function enforceAuthRateLimit(action: string, key: string, limit: number, windowMinutes: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);
  const existing = await prisma.authRateLimit.findUnique({
    where: { action_key: { action, key } },
  });

  if (!existing || existing.resetAt <= now) {
    await prisma.authRateLimit.upsert({
      where: { action_key: { action, key } },
      update: { count: 1, resetAt },
      create: { action, key, count: 1, resetAt },
    });
    return;
  }

  if (existing.count >= limit) {
    throw new AuthError("Too many authentication attempts. Please try again later.", 429);
  }

  await prisma.authRateLimit.update({
    where: { id: existing.id },
    data: { count: { increment: 1 } },
  });
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "workspace";
}
