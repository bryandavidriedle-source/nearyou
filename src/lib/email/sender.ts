import { serverEnv } from "@/lib/env";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type EmailProvider = "resend" | "smtp" | "console";

function getProvider(): EmailProvider {
  if (serverEnv.RESEND_API_KEY) return "resend";
  if (serverEnv.SMTP_HOST && serverEnv.SMTP_USER) return "smtp";
  return "console";
}

async function sendWithResend(payload: EmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: serverEnv.SMTP_FROM || "no-reply@presdetoi.com",
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend error: ${response.status} ${body}`);
  }
}

export async function sendEmail(payload: EmailPayload) {
  const provider = getProvider();

  if (provider === "console") {
    console.info("[EMAIL MOCK]", payload);
    return { ok: true, provider };
  }

  if (provider === "resend") {
    try {
      await sendWithResend(payload);
      return { ok: true, provider };
    } catch (error) {
      console.error("[EMAIL RESEND ERROR]", error);
      return { ok: false, provider };
    }
  }

  // SMTP intentionally kept as fallback placeholder (provider swappable architecture).
  console.info("[EMAIL SMTP PLACEHOLDER]", payload);
  return { ok: true, provider };
}
