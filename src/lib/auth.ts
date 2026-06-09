import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { deliverLoginCode } from "@/lib/delivery";

export const SESSION_COOKIE = "maco_session";
export const PREVIEW_SESSION_COOKIE = "maco_preview_session";
const SESSION_DAYS = 30;
const LOGIN_CODE_MINUTES = 10;

type NormalizedIdentifier =
  | { kind: "email"; identifier: string; email: string; phone: null }
  | { kind: "phone"; identifier: string; email: null; phone: string };

export class AuthError extends Error {
  status = 401;
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

export async function createLoginChallenge(input: string) {
  const normalized = normalizeIdentifier(input);
  if (!normalized) {
    throw new Error("Please enter a valid email address or phone number.");
  }

  const code = randomInt(100000, 1_000_000).toString();
  await prisma.loginChallenge.create({
    data: {
      identifier: normalized.identifier,
      email: normalized.email,
      phone: normalized.phone,
      codeHash: hashToken(code),
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

export async function verifyLoginChallenge(input: string, code: string, profile?: { name?: string }) {
  const normalized = normalizeIdentifier(input);
  if (!normalized) {
    throw new Error("Please enter a valid email address or phone number.");
  }

  const challenge = await prisma.loginChallenge.findFirst({
    where: {
      identifier: normalized.identifier,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge || challenge.codeHash !== hashToken(code.trim())) {
    throw new Error("The verification code is incorrect or expired.");
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

export async function createGooglePreviewSession(role: "brand" | "creator") {
  const email = `google-${role}@preview.makocreators.local`;
  const name = role === "creator" ? "Google Creator User" : "Google Brand User";

  if (!process.env.DATABASE_URL) {
    return {
      preview: true,
      role,
      user: {
        id: `preview-google-${role}`,
        email,
        phone: null,
        name,
        imageUrl: null,
      },
      workspace: {
        id: `preview-workspace-${role}`,
        name: role === "creator" ? "Google Creator Workspace" : "Google Brand Workspace",
        slug: `google-${role}-workspace`,
      },
      token: role,
    };
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: {
      email,
      name,
    },
  });

  const workspace = await ensureDefaultWorkspace(user.id, email);
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  return { preview: false, role, user, workspace, token };
}

export async function getRequestContext() {
  if (!process.env.DATABASE_URL) {
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
  return createHash("sha256").update(value).digest("hex");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "workspace";
}
