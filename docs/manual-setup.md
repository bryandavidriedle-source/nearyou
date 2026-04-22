# Setup manuel restant (ordre recommande)

## 1) Creer les comptes/services
- Vercel
- Supabase
- Cloudflare
- Mapbox
- OpenAI
- Stripe
- Resend (ou provider SMTP)

## 2) Preparar la base Supabase
Executer dans l'ordre:
1. `supabase/migrations/20260421093000_nearyou_init.sql`
2. `supabase/migrations/20260421102000_auth_profiles_triggers.sql`
3. `supabase/migrations/20260421143000_service_requests_tracking.sql`
4. `supabase/migrations/20260421170000_admin_rbac_provider_workflow.sql`
5. `supabase/migrations/20260421192000_provider_ops_workflow.sql`
6. `supabase/seed.sql`

## 3) Configurer les variables d'environnement Vercel
- Copier toutes les variables de `.env.example`
- Renseigner les valeurs production
- Definir `SUPER_ADMIN_EMAIL` (super admin unique)
- Definir `TURNSTILE_SECRET_KEY` si Turnstile est active

## 3bis) Verifications Supabase specifiques V1 ops
- Bucket `provider-documents` present et prive (`public = false`)
- Policies storage actives pour:
  - lecture admin review/ops/super_admin
  - lecture/upload prestataire sur son prefixe `{auth.uid()}/...`
- Tables operationnelles presentes:
  - `provider_documents`
  - `provider_availability_rules`
  - `provider_unavailability_periods`
  - `payment_records`
  - `provider_notifications`
  - `service_request_provider_history`

## 4) Deployer sur Vercel
- Connecter le repo GitHub
- Build command: `npm run build`
- Framework: Next.js

## 5) Connecter domaine + Cloudflare
- Ajouter le domaine dans Vercel
- Configurer DNS Cloudflare (CNAME/A selon Vercel)
- SSL/TLS: Full (strict)

## 6) Connecter services externes
- Stripe: cles + webhook
- OpenAI: cle API
- Mapbox: token public
- Email: Resend API key ou SMTP

## 7) Auth Supabase (callback)
Dans Supabase > Authentication > URL Configuration:
- `https://<votre-domaine>/auth/callback`
- `https://www.<votre-domaine>/auth/callback`
- `http://localhost:3000/auth/callback`

## 8) Validation de lancement
1. `npm run release:check`
2. `GET /api/health` => 200
3. `GET /api/ready` => 200
4. Verification parcours critiques:
   - demande client
   - reservation
   - candidature prestataire
   - admin moderation/validation
