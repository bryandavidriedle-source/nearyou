const PRODUCTION_HOSTS = new Set([
  "xn--prsdetoi-20a.com",
  "www.xn--prsdetoi-20a.com",
  "presdetoi.com",
  "www.presdetoi.com",
]);

function hostnameFromUrl(value: string | undefined) {
  if (!value) return null;
  try {
    return new URL(value.startsWith("http") ? value : `https://${value}`).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function isProductionRuntime() {
  const appEnv = (process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV ?? "").toLowerCase();
  const vercelEnv = (process.env.VERCEL_ENV ?? "").toLowerCase();
  const siteHost = hostnameFromUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const vercelHost = hostnameFromUrl(process.env.VERCEL_URL);

  if (appEnv === "production" || vercelEnv === "production") return true;
  if (siteHost && PRODUCTION_HOSTS.has(siteHost)) return true;
  if (vercelHost && PRODUCTION_HOSTS.has(vercelHost)) return true;

  return !vercelEnv && !appEnv && process.env.NODE_ENV === "production";
}

export function isDemoDataVisible() {
  return !isProductionRuntime();
}
