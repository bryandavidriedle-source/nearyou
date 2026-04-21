# Sécurité - NearYou

## Contrôles en place
- Validation serveur par Zod sur API routes
- Sanitation basique des textes entrants
- Secrets côté serveur uniquement (`SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Middleware d'accès aux routes protégées
- Contrôle de rôle côté serveur pour admin/provider/customer
- Journalisation audit (actions admin)
- Rate limiting mémoire (AI/contact/auth)

## Points à renforcer avant scale
- Remplacer rate-limit mémoire par Redis/KV (Upstash)
- Ajouter Cloudflare Turnstile sur auth/contact/AI
- Ajouter monitoring sécurité (Sentry + alerting)
- Ajouter rotation de secrets et gestion vault

## Données personnelles
- Minimisation des données collectées
- RLS activé sur tables sensibles
- Pages légales FR incluses

## Responsabilités
NearYou est une plateforme intermédiaire. Les prestataires restent indépendants.
