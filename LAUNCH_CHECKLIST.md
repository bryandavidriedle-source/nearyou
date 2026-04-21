# LAUNCH_CHECKLIST

## Préparation technique

- [ ] Domaine configuré
- [ ] Projet connecté à Vercel
- [ ] Variables d'environnement Vercel ajoutées
- [ ] Base Supabase initialisée avec `supabase/schema.sql`
- [ ] Policies RLS insert vérifiées

## Vérifications produit

- [ ] Formulaire `Trouver un prestataire` testé (cas valide)
- [ ] Formulaire `Devenir prestataire` testé (cas valide)
- [ ] Formulaire `Contact` testé (cas valide)
- [ ] Cas erreur testés (email invalide, consentement absent, champs vides)
- [ ] Données visibles dans les 3 tables Supabase

## Légal et confiance

- [ ] Mentions légales relues et adaptées
- [ ] Politique de confidentialité relue
- [ ] Conditions d'utilisation relues
- [ ] Email de contact réel configuré (`NEXT_PUBLIC_CONTACT_EMAIL`)

## Performance & qualité

- [ ] Test mobile iOS/Android
- [ ] Test desktop Chrome/Safari/Firefox
- [ ] Vérification Lighthouse (mobile + desktop)
- [ ] Vérification des métadonnées SEO

## Exploitation bêta

- [ ] Groupe test utilisateurs défini
- [ ] Message d'introduction bêta prêt
- [ ] Process de collecte feedback prêt (Notion/Formulaire)
- [ ] Personne responsable du suivi quotidien des leads assignée

