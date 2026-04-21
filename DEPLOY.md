# Déploiement NearYou (Vercel + Supabase + Cloudflare)

## 1) Pré-requis
- Compte GitHub
- Compte Vercel
- Compte Supabase
- Domaine configuré chez Cloudflare

## 2) Variables d'environnement (Vercel)
Copier les valeurs de `.env.example` dans Vercel > Project Settings > Environment Variables.

Minimum requis:
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_CONTACT_EMAIL

Pour fonctionnalités complètes:
- NEXT_PUBLIC_MAPBOX_TOKEN
- OPENAI_API_KEY
- OPENAI_MODEL
- RESEND_API_KEY ou SMTP_*
- STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET

## 3) Base de données (ordre exact)
Dans Supabase SQL Editor:
1. `supabase/migrations/20260421093000_nearyou_init.sql`
2. `supabase/migrations/20260421102000_auth_profiles_triggers.sql`
3. `supabase/seed.sql`

## 4) Vérification locale avant push
```bash
npm run preflight
npm run validate:env
npm run typecheck
npm run lint
npm run build
```

## 5) Déployer
1. Push sur GitHub
2. Import du repo dans Vercel
3. Build command: `npm run build`
4. Output: Next.js par défaut

## 6) Endpoints opérationnels
- Health: `/api/health`
- Ready: `/api/ready`
- AI chat: `/api/ai/chat`

## 7) GitHub -> Vercel flow
- `main` = production
- PR = preview deployments automatiques

## 8) Checklist de release
Voir `docs/launch-checklist.md`
