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

export async function sendEmail(payload: EmailPayload) {
  const provider = getProvider();

  if (provider === "console") {
    console.info("[EMAIL MOCK]", payload);
    return { ok: true, provider };
  }

  // Branchements réels à compléter lors du setup manuel (Resend/SMTP).
  return { ok: true, provider };
}
