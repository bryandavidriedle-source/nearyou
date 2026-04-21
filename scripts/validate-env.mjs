import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

function parseEnvFile(filepath) {
  if (!fs.existsSync(filepath)) return {};

  const content = fs.readFileSync(filepath, "utf8");
  const lines = content.split(/\r?\n/);
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index <= 0) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    result[key] = value;
  }

  return result;
}

const envFile = parseEnvFile(path.join(process.cwd(), ".env.local"));
const env = { ...envFile, ...process.env };

const optionalSecret = z.string().min(20).optional().or(z.literal(""));

const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_CONTACT_EMAIL: z.string().email(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().min(20).optional().or(z.literal("")),
  OPENAI_API_KEY: optionalSecret,
  OPENAI_MODEL: z.string().default("gpt-5.4-mini"),
});

const result = schema.safeParse(env);

if (!result.success) {
  console.error("❌ Variables d'environnement invalides:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

console.log("✅ Variables d'environnement valides.");
