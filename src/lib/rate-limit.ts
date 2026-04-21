type Bucket = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, entry.resetAt - now) };
  }

  entry.count += 1;
  return { allowed: true, remaining: Math.max(0, limit - entry.count), retryAfterMs: 0 };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
