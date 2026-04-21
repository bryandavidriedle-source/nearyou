# NearYou - MVP prêt pour lancement rapide

NearYou est une marketplace locale suisse (France-first UX) construite avec Next.js 15, TypeScript, Tailwind et Supabase.

## Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres/Auth/Storage)
- OpenAI API (Assistant NearYou)
- Mapbox (carte interactive)
- Vercel-ready + Cloudflare-compatible

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`

## Démarrage local
1. Installer les dépendances:
```bash
npm install
```
2. Créer `.env.local` depuis `.env.example` puis renseigner les clés.
3. Lancer en dev:
```bash
npm run dev
```
4. Ouvrir [http://localhost:3000](http://localhost:3000)

## Supabase
1. Créer le projet Supabase.
2. Exécuter SQL migration:
- `supabase/migrations/20260421093000_nearyou_init.sql`
3. Exécuter seed:
- `supabase/seed.sql`

## Fonctionnalités prêtes
- Formulaires leads + support stockés en DB
- Carte Mapbox interactive (avec fallback si token absent)
- Auth Supabase email/password
- Protection routes sensibles (middleware + guards)
- Assistant IA NearYou + logs conversation
- Pages légales FR complètes (CGU, confidentialité, cookies, mentions)
- PWA installable (manifest + service worker)
- Sécurité de base: headers, validation zod, rate-limit mémoire

## Limites MVP
- Rate-limit en mémoire (à remplacer par Redis/KV en prod)
- Intégrations Stripe/TWINT et email en mode architecture prête + mock
- Géocodage avancé / autosuggest adresse à finaliser

## Déploiement
Voir [DEPLOY.md](DEPLOY.md)

## Setup manuel obligatoire
Voir [docs/manual-setup.md](docs/manual-setup.md)
