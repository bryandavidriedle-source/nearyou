export async function verifyTurnstileToken(token: string | null | undefined) {
  // TODO production: vérifier token côté serveur avec Cloudflare Turnstile.
  // MVP: placeholder non bloquant pour accélérer le lancement.
  if (!token) return { ok: true, reason: "not-configured" as const };
  return { ok: true, reason: "mock" as const };
}
