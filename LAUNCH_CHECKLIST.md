# LAUNCH_CHECKLIST (NearYou)

## Go/No-go technique
- [ ] `npm run release:check` OK
- [ ] `/api/health` = 200
- [ ] `/api/ready` = 200
- [ ] Migrations Supabase executees dans le bon ordre
- [ ] Variables Vercel configurees (dont `SUPER_ADMIN_EMAIL`)

## Go/No-go produit
- [ ] Hero + CTA homepage verifies mobile
- [ ] Flux "Trouver un prestataire" teste (cas valide + erreurs)
- [ ] Flux "Devenir prestataire" teste (upload doc + erreurs)
- [ ] Flux reservation teste (date/slot + confirmation)
- [ ] Hotline/contact testes

## Go/No-go admin ops
- [ ] Backoffice accessible au super admin
- [ ] Gestion demandes (statuts) validee
- [ ] Validation prestataires (approved/rejected/needs_info) validee
- [ ] Moderation avis validee
- [ ] Journal d'actions admin verifie

## Securite/conformite
- [ ] Headers securite actifs
- [ ] RLS Supabase verifie
- [ ] Protection anti-spam active (honeypot + timing, turnstile si active)
- [ ] Role d'intermediation correctement affiche (pas d'ambiguite employeur)
- [ ] Pages legales revues

## Support/incident
- [ ] Canal de support defini (email + hotline)
- [ ] Responsable de permanence defini
- [ ] Runbook incident lu: `docs/incident-runbook.md`
