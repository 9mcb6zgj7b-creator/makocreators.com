type LoginCodeDeliveryInput =
  | {
      kind: "email";
      identifier: string;
      email: string;
      phone: null;
      code: string;
    }
  | {
      kind: "phone";
      identifier: string;
      email: null;
      phone: string;
      code: string;
    };

export async function deliverLoginCode(input: LoginCodeDeliveryInput) {
  if (process.env.AUTH_SHOW_DEV_CODE === "true") {
    return { delivery: "local-preview" as const };
  }

  if (input.kind === "email") {
    await sendLoginEmail(input.email, input.code);
    return { delivery: "email" as const };
  }

  await sendLoginSms(input.phone, input.code);
  return { delivery: "sms" as const };
}

async function sendLoginEmail(email: string, code: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    throw new Error("Email sign-in is not configured yet. Please use local preview mode or configure Resend before launch.");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Your Mako Creator sign-in code",
      text: `Your Mako Creator sign-in code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your Mako Creator sign-in code is <strong>${escapeHtml(code)}</strong>.</p><p>It expires in 10 minutes.</p>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Email sign-in delivery failed: ${await readProviderError(res)}`);
  }
}

async function sendLoginSms(phone: string, code: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (!accountSid || !authToken || !from) {
    throw new Error("Phone sign-in is not configured yet. Please use email sign-in or configure Twilio before launch.");
  }

  const body = new URLSearchParams({
    From: from,
    To: phone,
    Body: `Your Mako Creator sign-in code is ${code}. It expires in 10 minutes.`,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`SMS sign-in delivery failed: ${await readProviderError(res)}`);
  }
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

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, char => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "'":
        return "&#39;";
      case '"':
        return "&quot;";
      default:
        return char;
    }
  });
}
