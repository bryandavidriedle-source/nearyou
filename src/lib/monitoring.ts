type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  event: string;
  message: string;
  context?: Record<string, unknown>;
};

function sanitizeContext(context: Record<string, unknown> | undefined) {
  if (!context) return undefined;
  const redactedKeys = ["token", "password", "secret", "authorization", "cookie", "apiKey"];
  const entries = Object.entries(context).map(([key, value]) => {
    const shouldRedact = redactedKeys.some((sensitiveKey) => key.toLowerCase().includes(sensitiveKey));
    if (shouldRedact) {
      return [key, "[redacted]"];
    }
    return [key, value];
  });
  return Object.fromEntries(entries);
}

export function logEvent(level: LogLevel, payload: LogPayload) {
  const log = {
    level,
    timestamp: new Date().toISOString(),
    event: payload.event,
    message: payload.message,
    context: sanitizeContext(payload.context),
  };

  if (level === "error") {
    console.error(JSON.stringify(log));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(log));
    return;
  }

  console.info(JSON.stringify(log));
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "unknown_error";
}
