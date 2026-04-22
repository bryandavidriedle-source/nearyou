import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { logEvent } from "@/lib/monitoring";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const FORM_MIN_SUBMIT_DELAY_MS = 1_500;
const FORM_MAX_SUBMIT_AGE_MS = 12 * 60 * 60 * 1_000;

type AntiSpamPayload = {
  website?: string;
  submittedAt?: string;
  turnstileToken?: string;
};

export function applyRateLimit(request: Request, bucket: "ai" | "contact" | "auth" | "booking") {
  const key = `${bucket}:${getClientIp(request)}`;

  const limit =
    bucket === "ai"
      ? Number(serverEnv.RATE_LIMIT_AI_PER_MINUTE)
      : bucket === "auth"
        ? Number(serverEnv.RATE_LIMIT_AUTH_PER_MINUTE)
        : bucket === "booking"
          ? Math.max(3, Number(serverEnv.RATE_LIMIT_CONTACT_PER_MINUTE) - 5)
          : Number(serverEnv.RATE_LIMIT_CONTACT_PER_MINUTE);

  const result = checkRateLimit(key, Number.isNaN(limit) ? 10 : limit, 60_000);
  if (!result.allowed) {
    logEvent("warn", {
      event: "rate_limit.blocked",
      message: "Request blocked by rate limit.",
      context: { bucket, key, retryAfterMs: result.retryAfterMs },
    });
    return NextResponse.json(
      {
        success: false,
        message: "Trop de requetes. Merci de reessayer dans une minute.",
      },
      { status: 429 },
    );
  }

  return null;
}

export function enforceWriteOrigin(request: Request) {
  const method = request.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return null;

  const origin = request.headers.get("origin");
  if (!origin) return null;

  const requestOrigin = new URL(request.url).origin;
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : requestOrigin;

  if (origin !== expectedOrigin && origin !== requestOrigin) {
    logEvent("warn", {
      event: "security.origin_blocked",
      message: "Write request rejected due to invalid origin.",
      context: { origin, expectedOrigin, requestOrigin, method },
    });
    return jsonError("Origine de requete non autorisee.", 403);
  }

  return null;
}

export async function enforcePublicFormSecurity(payload: AntiSpamPayload) {
  if (payload.website && payload.website.trim().length > 0) {
    logEvent("warn", {
      event: "security.honeypot_blocked",
      message: "Public form blocked by honeypot field.",
    });
    return jsonError("Soumission bloquee.", 400);
  }

  if (payload.submittedAt) {
    const submittedAtMs = Date.parse(payload.submittedAt);
    const now = Date.now();
    const elapsed = now - submittedAtMs;
    if (Number.isNaN(submittedAtMs) || elapsed < FORM_MIN_SUBMIT_DELAY_MS || elapsed > FORM_MAX_SUBMIT_AGE_MS) {
      logEvent("warn", {
        event: "security.submit_time_blocked",
        message: "Public form blocked due to invalid submit timing.",
        context: { elapsed },
      });
      return jsonError("Soumission invalide. Merci de reessayer.", 400);
    }
  }

  if (payload.turnstileToken) {
    const turnstile = await verifyTurnstileToken(payload.turnstileToken);
    if (!turnstile.ok) {
      logEvent("warn", {
        event: "security.turnstile_failed",
        message: "Public form blocked by turnstile verification.",
        context: { reason: turnstile.reason },
      });
      return jsonError("Verification anti-spam echouee.", 400);
    }
  }

  return null;
}

export function jsonError(message: string, status = 400, fieldErrors?: Record<string, string[] | undefined>) {
  return NextResponse.json(
    {
      success: false,
      message,
      fieldErrors,
    },
    { status },
  );
}

export function jsonSuccess(message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({
    success: true,
    message,
    ...extra,
  });
}
