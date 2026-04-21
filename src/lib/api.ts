import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/env";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";

export function applyRateLimit(request: Request, bucket: "ai" | "contact" | "auth") {
  const key = `${bucket}:${getClientIp(request)}`;

  const limit =
    bucket === "ai"
      ? Number(serverEnv.RATE_LIMIT_AI_PER_MINUTE)
      : bucket === "contact"
        ? Number(serverEnv.RATE_LIMIT_CONTACT_PER_MINUTE)
        : Number(serverEnv.RATE_LIMIT_AUTH_PER_MINUTE);

  const result = checkRateLimit(key, Number.isNaN(limit) ? 10 : limit, 60_000);
  if (!result.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: "Trop de requêtes. Merci de réessayer dans une minute.",
      },
      { status: 429 },
    );
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
