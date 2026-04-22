# Deploiement NearYou (Vercel + Supabase + Cloudflare)

## 1) Prerequis
- Compte GitHub
- Compte Vercel
- Compte Supabase
- Domaine configure chez Cloudflare

## 2) Variables d'environnement (Vercel)
Copier les valeurs de `.env.example` dans Vercel > Project Settings > Environment Variables.

Minimum requis:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CONTACT_EMAIL`

Recommande production:
- `SUPER_ADMIN_EMAIL`
- `NEXT_PUBLIC_MAPBOX_TOKEN`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `RESEND_API_KEY` ou `SMTP_*`
- `TURNSTILE_SECRET_KEY` (et `NEXT_PUBLIC_TURNSTILE_SITE_KEY` si widget front active)

## 3) Base de donnees Supabase (ordre exact)
Executer dans Supabase SQL Editor:
1. `supabase/migrations/20260421093000_nearyou_init.sql`
2. `supabase/migrations/20260421102000_auth_profiles_triggers.sql`
3. `supabase/migrations/20260421143000_service_requests_tracking.sql`
4. `supabase/migrations/20260421170000_admin_rbac_provider_workflow.sql`
5. `supabase/seed.sql`

## 4) Verification locale avant push
```bash
npm run release:check
```

## 5) Deploy Vercel
1. Push sur GitHub
2. Import du repo dans Vercel
3. Build command: `npm run build`
4. Output: Next.js par defaut

## 6) Endpoints operables apres deploiement
- Health: `/api/health` doit repondre `200`
- Ready: `/api/ready` doit repondre `200` (sinon `503` avec checks explicites)

## 7) Auth Supabase (callback)
Dans Supabase > Authentication > URL Configuration, ajouter:
- `https://<votre-domaine>/auth/callback`
- `https://www.<votre-domaine>/auth/callback`
- `http://localhost:3000/auth/callback`

## 8) Rollback rapide
1. Dans Vercel, redeployer le deployment stable precedent.
2. Verifier `/api/health` et `/api/ready`.
3. Ouvrir un incident et suivre `docs/incident-runbook.md`.

## 9) Checklist release
Voir `docs/launch-checklist.md`.
