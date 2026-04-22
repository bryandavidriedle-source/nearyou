import { serverEnv } from "@/lib/env";

type TurnstileResult = {
  ok: boolean;
  reason: "verified" | "invalid-token" | "not-configured" | "verify-failed";
};

export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileResult> {
  const secret = serverEnv.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true, reason: "not-configured" };
  }

  if (!token) {
    return { ok: false, reason: "invalid-token" };
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, reason: "verify-failed" };
    }

    const data = (await response.json()) as { success?: boolean };
    if (!data.success) {
      return { ok: false, reason: "invalid-token" };
    }

    return { ok: true, reason: "verified" };
  } catch {
    return { ok: false, reason: "verify-failed" };
  }
}
