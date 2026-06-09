import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyResendWebhookSignature(rawBody: string, headers: Headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("RESEND_WEBHOOK_SECRET is not configured.");
  }

  const svixId = headers.get("svix-id");
  const svixTimestamp = headers.get("svix-timestamp");
  const svixSignature = headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Missing Resend webhook signature headers.");
  }

  const timestampMs = Number(svixTimestamp) * 1000;
  if (!Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) {
    throw new Error("Resend webhook timestamp is outside the allowed window.");
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
    throw new Error("Invalid Resend webhook signature.");
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
  const headerThreadId = headers["x-mako-thread-id"];
  const threadId = headerThreadId || extractThreadIdFromEmail(to || "");

  return {
    threadId,
    providerMessageId,
    fromEmail: from,
    toEmail: to,
    subject,
    textBody,
    htmlBody,
    metadata: data,
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
