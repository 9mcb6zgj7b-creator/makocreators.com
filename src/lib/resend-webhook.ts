import { createHmac, timingSafeEqual } from "node:crypto";
import { UserFacingError } from "@/lib/api";

// [Claude 2026-06-11] Signature failures now return 401 with a specific message so
// they're distinguishable from downstream processing errors (e.g. unknown thread)
// when reading webhook delivery logs in the Resend dashboard.
export function verifyResendWebhookSignature(rawBody: string, headers: Headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    throw new UserFacingError("RESEND_WEBHOOK_SECRET is not configured on the server.", 401);
  }

  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new UserFacingError("Missing Resend webhook signature headers.", 401);
  }

  const timestampMs = Number(svixTimestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    throw new UserFacingError("Resend webhook timestamp is outside the allowed window.", 401);
  }

  const signedPayload = `${svixId}.${svixTimestamp}.${rawBody}`;
  const key = decodeSvixSecret(secret);
  const expected = createHmac("sha256", key).update(signedPayload).digest("base64");
  const signatures = svixSignature.split(" ").flatMap(part => part.split(",")).map(part => part.trim()).filter(Boolean);
  const valid = signatures.some(signature => {
    const value = signature.startsWith("v1,") ? signature.slice(3) : signature.startsWith("v1=") ? signature.slice(3) : signature;
    return safeEqual(value, expected);
  });

  if (!valid) {
    throw new UserFacingError("Invalid Resend webhook signature — check that RESEND_WEBHOOK_SECRET matches the webhook's signing secret.", 401);
  }
}

export function extractInboundEmailPayload(payload: unknown) {
  const data = getRecord(getRecord(payload).data) || getRecord(payload);
  const headers = normalizeHeaders(data.headers);
  const to = extractEmail(data.to) || extractEmail(data.recipient) || extractEmail(data.rcpt_to) || extractEmail(data.email?.to);
  const from = extractEmail(data.from) || extractEmail(data.sender) || extractEmail(data.email?.from);
  const subject = stringValue(data.subject) || stringValue(data.email?.subject);
  const textBody = stringValue(data.text) || stringValue(data.textBody) || stringValue(data.email?.text) || stringValue(data.email?.textBody);
  const htmlBody = stringValue(data.html) || stringValue(data.htmlBody) || stringValue(data.email?.html) || stringValue(data.email?.htmlBody);
  const providerMessageId = stringValue(data.message_id) || stringValue(data.messageId) || stringValue(data.id) || stringValue(data.email?.messageId);
  const resendEmailId = stringValue(data.email_id);
  const headerThreadId = headers["x-mako-thread-id"];
  const threadId = headerThreadId || extractThreadIdFromEmail(to || "");

  return {
    threadId,
    providerMessageId,
    resendEmailId,
    fromEmail: from,
    toEmail: to,
    subject,
    textBody,
    htmlBody,
    metadata: data,
  };
}

export type InboundEmailPayload = ReturnType<typeof extractInboundEmailPayload>;

// [Claude 2026-06-10] Resend's `email.received` webhook only carries metadata — the
// body and headers must be fetched separately from the Received Emails API. If the
// webhook payload has no body but does have an email_id, hydrate it here.
// Docs: https://resend.com/docs/api-reference/emails/retrieve-received-email
export async function hydrateInboundEmailPayload(inbound: InboundEmailPayload): Promise<InboundEmailPayload> {
  if (inbound.textBody || inbound.htmlBody) return inbound;
  if (!inbound.resendEmailId) return inbound;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("Inbound email has no body and RESEND_API_KEY is not set; skipping content fetch.");
    return inbound;
  }

  const res = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(inbound.resendEmailId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.error("Failed to fetch received email content from Resend:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    return inbound;
  }

  const data = await res.json() as Record<string, any>;
  const headers = normalizeHeaders(data.headers);
  return {
    ...inbound,
    threadId: inbound.threadId || headers["x-mako-thread-id"] || null,
    fromEmail: inbound.fromEmail || extractEmail(data.from),
    toEmail: inbound.toEmail || extractEmail(data.to),
    subject: inbound.subject || stringValue(data.subject),
    textBody: stringValue(data.text),
    htmlBody: stringValue(data.html),
  };
}

function decodeSvixSecret(secret: string) {
  const value = secret.startsWith("whsec_") ? secret.slice("whsec_".length) : secret;
  return Buffer.from(value, "base64");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getRecord(value: unknown): Record<string, any> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) ? value as Record<string, any> : {};
}

function normalizeHeaders(value: unknown) {
  const output: Record<string, string> = {};
  if (Array.isArray(value)) {
    for (const item of value) {
      const record = getRecord(item);
      const name = stringValue(record.name || record.key);
      const headerValue = stringValue(record.value);
      if (name && headerValue) output[name.toLowerCase()] = headerValue;
    }
    return output;
  }

  const record = getRecord(value);
  for (const [key, headerValue] of Object.entries(record)) {
    const stringHeaderValue = stringValue(headerValue);
    if (stringHeaderValue) output[key.toLowerCase()] = stringHeaderValue;
  }
  return output;
}

function extractEmail(value: unknown): string | null {
  if (Array.isArray(value)) {
    return value.map(extractEmail).find(Boolean) || null;
  }
  const record = getRecord(value);
  const candidate = stringValue(record.email) || stringValue(record.address) || stringValue(value);
  if (!candidate) return null;
  const match = candidate.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase() || null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function extractThreadIdFromEmail(email: string) {
  return email.match(/thread\+([^@\s]+)@/i)?.[1] || null;
}

// [Claude 2026-06-13] Forward inbound emails that don't match any creator thread to
// the workspace owner's personal inbox (OWNER_FORWARD_EMAIL env var). This makes
// mike@makocreators.com work as a real email address — direct messages, verification
// emails, etc. — without a paid email hosting plan.
export async function forwardEmailToOwner(inbound: InboundEmailPayload): Promise<void> {
  const forwardTo = process.env.OWNER_FORWARD_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!forwardTo || !apiKey || !from) {
    console.warn("forwardEmailToOwner: OWNER_FORWARD_EMAIL, RESEND_API_KEY, or RESEND_FROM_EMAIL not set — skipping forward.");
    return;
  }

  const subject = inbound.subject ? `Fwd: ${inbound.subject}` : "Forwarded email (no subject)";
  const originalFrom = inbound.fromEmail || "unknown sender";
  const originalTo = inbound.toEmail || "unknown recipient";
  const body = [
    `---------- Forwarded message ----------`,
    `From: ${originalFrom}`,
    `To: ${originalTo}`,
    inbound.subject ? `Subject: ${inbound.subject}` : "",
    "",
    inbound.textBody || "(no text body)",
  ].filter(line => line !== null).join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: forwardTo, subject, text: body }),
  });

  if (!res.ok) {
    console.error("forwardEmailToOwner: Resend API error", res.status, (await res.text().catch(() => "")).slice(0, 200));
  }
}
