import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "maco_session";
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
    throw new Error("请输入有效的邮箱或手机号");
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

  return {
    code,
    identifier: normalized.identifier,
    delivery: process.env.AUTH_SHOW_DEV_CODE === "true" ? "local-preview" : "sent",
  };
}

export async function verifyLoginChallenge(input: string, code: string) {
  const normalized = normalizeIdentifier(input);
  if (!normalized) {
    throw new Error("请输入有效的邮箱或手机号");
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
    throw new Error("验证码不正确或已过期");
  }

  const user = await prisma.user.upsert({
    where: normalized.email ? { email: normalized.email } : { phone: normalized.phone! },
    update: {},
    create: {
      email: normalized.email,
      phone: normalized.phone,
      name: normalized.identifier,
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
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) throw new AuthError("请先登录");

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
    throw new AuthError("登录已过期");
  }

  const membership = session.user.memberships[0];
  if (!membership) {
    throw new AuthError("没有可用工作区");
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
