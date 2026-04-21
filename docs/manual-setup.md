# Setup manuel restant (ordre recommandé)

## 1) Créer les comptes/services
- Vercel
- Supabase
- Cloudflare
- Mapbox
- OpenAI
- Stripe
- Resend (ou provider SMTP)

## 2) Préparer la base Supabase
1. Ouvrir SQL Editor Supabase
2. Exécuter, dans l'ordre:
   - `supabase/migrations/20260421093000_nearyou_init.sql`
   - `supabase/migrations/20260421102000_auth_profiles_triggers.sql`
   - `supabase/seed.sql`

## 3) Configurer les variables d'environnement Vercel
- Copier toutes les variables de `.env.example`
- Renseigner les valeurs production

## 4) Déployer sur Vercel
- Connecter le repo GitHub
- Build command: `npm run build`
- Framework: Next.js

## 5) Connecter le domaine + Cloudflare
- Ajouter domaine dans Vercel
- Configurer DNS Cloudflare (CNAME/A selon Vercel)
- SSL/TLS: Full (strict)

## 6) Connecter services externes
- Stripe: clés + webhook
- OpenAI: clé API
- Mapbox: token public
- Email: Resend API key ou SMTP

## 7) Vérification finale
- `GET /api/health` => 200
- `GET /api/ready` => 200
- login/signup
- carte interactive
- formulaires + support
- assistant IA
- pages légales

## Actions payantes probables
- Vercel (plan selon trafic)
- Supabase (plan selon usage)
- OpenAI (consommation)
- Mapbox (consommation)
- Stripe (frais transaction)
- Email provider (selon volume)
