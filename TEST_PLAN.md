# TEST_PLAN

## Objectif

Valider que le MVP PrèsDeToi est fiable, compréhensible et prêt pour une bêta privée à Lausanne.

## Cas heureux

### 1. Soumission demande client
- Ouvrir `/trouver-un-prestataire`
- Remplir tous les champs valides
- Cocher consentement
- Envoyer
- Résultat attendu: message succès + ligne créée dans `service_requests`

### 2. Soumission candidature prestataire
- Ouvrir `/devenir-prestataire`
- Remplir tous les champs valides
- Envoyer
- Résultat attendu: message succès + ligne créée dans `provider_applications`

### 3. Soumission contact
- Ouvrir `/contact`
- Remplir nom, email, sujet, message
- Envoyer
- Résultat attendu: message succès + ligne créée dans `contact_messages`

## Cas d'erreur

### 4. Validation email
- Entrer un email invalide sur chaque formulaire
- Résultat attendu: blocage côté client avec message explicite

### 5. Consentement non coché
- Tenter un envoi sans consentement
- Résultat attendu: erreur de validation claire

### 6. Champs obligatoires vides
- Laisser au moins 2 champs requis vides
- Résultat attendu: erreurs champ par champ, aucun envoi API

### 7. Supabase non configuré
- Supprimer temporairement les variables Supabase
- Soumettre un formulaire
- Résultat attendu: message erreur serveur propre, aucune panne UI

## Responsive

### 8. Mobile
- Tester iPhone SE / iPhone 14 / Pixel
- Vérifier lisibilité hero, CTA immédiats, formulaires utilisables sans zoom

### 9. Desktop
- Vérifier largeur max, alignements sections, cohérence spacing

## Navigation & SEO

### 10. Pages
- Vérifier toutes les routes principales et pages légales
- Vérifier page 404

### 11. Metadata
- Contrôler title + description + Open Graph par page

## Critères de sortie bêta

- 0 bug bloquant formulaire
- Validation cohérente client/serveur
- Expérience mobile fluide
- Lead correctement enregistré en base
- Parcours compris en moins de 5 secondes par utilisateurs tests

