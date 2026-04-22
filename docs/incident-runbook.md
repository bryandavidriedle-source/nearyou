# Incident Runbook (NearYou)

## Objectif
Restaurer rapidement le service sans compromettre les donnees ni la confiance client.

## Niveaux de severite
- SEV1: indisponibilite globale (homepage/API critiques KO)
- SEV2: fonctionnalite majeure degradee (reservation, admin, onboarding prestataire)
- SEV3: incident mineur ou partiel

## Procedure immediate (0-15 min)
1. Confirmer l'incident via `/api/health` et `/api/ready`.
2. Identifier l'impact (clients, prestataires, admin, paiement, support).
3. Nommer un incident owner.
4. Si regression recente: rollback Vercel vers le dernier deployment stable.

## Diagnostics techniques
- Vercel logs: erreurs runtime, timeouts, status 5xx.
- Supabase: erreurs RLS, disponibilite DB, erreurs storage/documents.
- Variables env: verifier secrets critiques et valeurs site URL.
- OpenAI/Mapbox/SMTP: verifier quotas et erreurs externes.

## Mitigation
- Activer fallback produit (hotline, formulaire contact) si flux booking degrade.
- Desactiver temporairement fonctionnalite non critique si elle bloque le coeur produit.
- Prioriser la restauration des flux:
  1) Demandes clients
  2) Validation prestataires
  3) Backoffice admin

## Communication
- Interne: message incident toutes les 30 minutes tant que SEV1/SEV2.
- Externe: message sobre et factuel si impact utilisateur visible.
- Ne jamais promettre une ETA non confirmee.

## Cloture incident
1. Verifier retour a la normale (`/api/health` et `/api/ready`).
2. Verifier un parcours complet front/admin.
3. Publier un post-mortem court:
   - cause racine
   - impact
   - correctif
   - prevention

## Prevention post-incident
- Ajouter test ou garde-fou manquant.
- Mettre a jour checklist de release si necessaire.
