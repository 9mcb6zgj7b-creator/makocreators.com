import { ConversationThread } from "@prisma/client";

export type ConversationEmailInput = {
  thread: Pick<ConversationThread, "id" | "creatorEmail" | "replyToEmail" | "subject">;
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export type ConversationEmailResult = {
  provider: "resend";
  providerMessageId?: string | null;
};

export async function sendConversationEmail(input: ConversationEmailInput): Promise<ConversationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Resend is not configured for outbound creator outreach.");
  }

  const replyTo = input.thread.replyToEmail || buildThreadReplyTo(input.thread.id);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html || textToHtml(input.text),
      reply_to: replyTo,
      headers: {
        "X-Mako-Thread-ID": input.thread.id,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Creator outreach email failed: ${await readProviderError(res)}`);
  }

  const data = await res.json().catch(() => ({})) as { id?: string };
  return { provider: "resend", providerMessageId: data.id ?? null };
}

export function buildThreadReplyTo(threadId: string) {
  const domain = process.env.INBOUND_EMAIL_DOMAIN || "inbound.makocreators.com";
  return `thread+${threadId}@${domain}`;
}

export function buildUnsubscribeUrl(threadId: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://makocreators.com";
  return `${siteUrl.replace(/\/$/, "")}/unsubscribe?thread=${encodeURIComponent(threadId)}`;
}

export function buildInitialOutreachCopy(input: { creatorName: string; brandName: string; threadId: string }) {
  const unsubscribeUrl = buildUnsubscribeUrl(input.threadId);
  const subject = `${input.brandName} creator collaboration invite`;
  const text = [
    `Hi ${input.creatorName},`,
    "",
    `I'm reaching out from ${input.brandName}. We are looking for creators who may be open to a simple collaboration conversation.`,
    "",
    "If you are interested, reply and let us know whether you prefer receiving creative assets to post from, or whether an in-person visit/conversation would make more sense.",
    "",
    "No pressure if it is not a fit — just reply no and we will close the loop.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, text };
}

export function buildFollowUpCopy(input: { creatorName: string; brandName: string; threadId: string }) {
  const unsubscribeUrl = buildUnsubscribeUrl(input.threadId);
  const subject = `Following up from ${input.brandName}`;
  const text = [
    `Hi ${input.creatorName},`,
    "",
    `Quick follow-up on the ${input.brandName} creator collaboration note.`,
    "",
    "If it is interesting, just reply with whether you would prefer assets to post from or a visit/conversation. If not, no worries — reply no and we will not follow up again.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, text };
}

export function buildAssetApprovalEmailCopy(input: { creatorName: string; brandName: string; threadId: string }) {
  const unsubscribeUrl = buildUnsubscribeUrl(input.threadId);
  const subject = `${input.brandName} creative assets`;
  const text = [
    `Hi ${input.creatorName},`,
    "",
    `Thanks for being open to receiving ${input.brandName} creative assets. Sharing the approved materials and notes below.`,
    "",
    "Please only post if the material feels like a fit for your audience. Do not make first-person product-use claims unless they are true to your actual experience.",
    "",
    "[Approved assets / brief will be attached or linked here]",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, text };
}

export function buildVisitApprovedMessage(input: { creatorName: string; brandName: string; selectedTime?: string | null; threadId: string }) {
  const unsubscribeUrl = buildUnsubscribeUrl(input.threadId);
  const subject = `${input.brandName} visit confirmation`;
  const timeLine = input.selectedTime ? `Confirmed time: ${input.selectedTime}` : "A team member will follow up with the confirmed time.";
  const text = [
    `Hi ${input.creatorName},`,
    "",
    `Thanks — ${input.brandName} confirmed the visit next step.`,
    timeLine,
    "",
    "If anything changes, reply here and we will update the plan.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
  ].join("\n");

  return { subject, text };
}

function textToHtml(text: string) {
  return text
    .split("\n")
    .map(line => line.trim() ? `<p>${escapeHtml(line)}</p>` : "<br />")
    .join("");
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => {
    switch (char) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "'": return "&#39;";
      case '"': return "&quot;";
      default: return char;
    }
  });
}

async function readProviderError(res: Response) {
  const text = await res.text().catch(() => "");
  if (!text) return res.statusText || "provider request failed";
  try {
    const data = JSON.parse(text) as { message?: string; error?: string; name?: string };
    return data.message || data.error || data.name || res.statusText || "provider request failed";
  } catch {
    return text.slice(0, 240);
  }
}
