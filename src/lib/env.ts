import { z } from "zod";

const optionalSecret = z.string().min(20).optional().or(z.literal(""));

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),
  NEXT_PUBLIC_MAPBOX_TOKEN: optionalSecret,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(10).optional().or(z.literal("")),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
  SUPER_ADMIN_EMAIL: z.string().email().optional().or(z.literal("")),
  OPENAI_API_KEY: optionalSecret,
  OPENAI_MODEL: z.string().default("gpt-5.4-mini"),
  STRIPE_SECRET_KEY: z.string().optional().or(z.literal("")),
  STRIPE_WEBHOOK_SECRET: z.string().optional().or(z.literal("")),
  RESEND_API_KEY: z.string().optional().or(z.literal("")),
  SMTP_HOST: z.string().optional().or(z.literal("")),
  SMTP_PORT: z.string().optional().or(z.literal("")),
  SMTP_USER: z.string().optional().or(z.literal("")),
  SMTP_PASSWORD: z.string().optional().or(z.literal("")),
  SMTP_FROM: z.string().optional().or(z.literal("")),
  TURNSTILE_SECRET_KEY: optionalSecret,
  RATE_LIMIT_AI_PER_MINUTE: z.string().default("20"),
  RATE_LIMIT_CONTACT_PER_MINUTE: z.string().default("15"),
  RATE_LIMIT_AUTH_PER_MINUTE: z.string().default("10"),
});

const parsedPublic = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
});

if (!parsedPublic.success) {
  console.error("Variables publiques invalides:", parsedPublic.error.flatten().fieldErrors);
  throw new Error("Configuration d'environnement publique invalide.");
}

const parsedServer = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  RATE_LIMIT_AI_PER_MINUTE: process.env.RATE_LIMIT_AI_PER_MINUTE,
  RATE_LIMIT_CONTACT_PER_MINUTE: process.env.RATE_LIMIT_CONTACT_PER_MINUTE,
  RATE_LIMIT_AUTH_PER_MINUTE: process.env.RATE_LIMIT_AUTH_PER_MINUTE,
});

if (!parsedServer.success) {
  console.error("Variables serveur invalides:", parsedServer.error.flatten().fieldErrors);
  throw new Error("Configuration d'environnement serveur invalide.");
}

export const publicEnv = parsedPublic.data;
export const serverEnv = parsedServer.data;

export function requireServerSecret(value: string | undefined, key: string) {
  if (!value) {
    throw new Error(`Variable serveur manquante: ${key}`);
  }
  return value;
}
