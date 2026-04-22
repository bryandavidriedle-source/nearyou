import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();

const requiredFiles = [
  ".env.example",
  "vercel.json",
  "next.config.mjs",
  "DEPLOY.md",
  "SECURITY.md",
  "docs/manual-setup.md",
  "docs/launch-checklist.md",
  "docs/incident-runbook.md",
  "supabase/migrations/20260421093000_nearyou_init.sql",
  "supabase/migrations/20260421102000_auth_profiles_triggers.sql",
  "supabase/migrations/20260421143000_service_requests_tracking.sql",
  "supabase/migrations/20260421170000_admin_rbac_provider_workflow.sql",
  "supabase/seed.sql",
  "src/app/api/health/route.ts",
  "src/app/api/ready/route.ts",
  "src/app/api/ai/chat/route.ts",
  "src/components/nearyou/provider-map.tsx",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(cwd, file)));

if (missing.length > 0) {
  console.error("Fichiers requis manquants:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("Preflight OK: fichiers critiques presents.");
