# Securite - NearYou

## Controles en place
- Validation serveur stricte via Zod sur toutes les routes critiques.
- Sanitation des textes entrants.
- Security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy).
- Controle de roles serveur (customer/provider/admin + scopes admin).
- Journalisation d'actions admin (`admin_audit_events`).
- Rate limiting par bucket (`ai`, `contact`, `auth`, `booking`).
- Anti-spam formulaires publics:
  - honeypot `website`
  - fenetre de soumission minimale/maximale
  - verification Turnstile serveur (si token fourni)
- Protection origine write APIs (`enforceWriteOrigin`).
- Documents sensibles prestataires en bucket prive + URL signee.

## Observabilite et resilience
- Logging structure (info/warn/error) pour rate-limit, origine, anti-spam et readiness.
- `GET /api/health` pour liveness.
- `GET /api/ready` avec check role service + ping DB.
- Emails transactionnels non bloquants sur les flux metier critiques.

## Donnees personnelles
- Minimisation des donnees collectees.
- RLS activee sur tables sensibles.
- Acces admin scope-aware.
- Pages legales FR incluses.

## Points a renforcer avant scale
- Remplacer rate-limit memoire par Redis/KV distribue.
- Brancher widget Turnstile front en production.
- Brancher un fournisseur d'alerte incident (Sentry/Datadog/etc.).
- Mettre en place rotation periodique de secrets.

## Cadre produit
NearYou est une plateforme d'intermediation. Les prestataires restent juridiquement independants.
