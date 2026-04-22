insert into public.service_categories (slug, name_fr, name_en, icon, from_price_chf, description, display_order)
values
  ('exterieur-jardin', 'Exterieur / Jardin', 'Outdoor / Garden', 'trees', 20, 'Services jardin, terrasse et exterieur', 1),
  ('entretien-saisonnier', 'Entretien saisonnier', 'Seasonal maintenance', 'snowflake', 15, 'Interventions saisonnieres', 2),
  ('menage-nettoyage', 'Menage / Nettoyage', 'Cleaning', 'sparkles', 15, 'Nettoyage et hygiene du domicile', 3),
  ('organisation-rangement', 'Organisation / Rangement', 'Organization', 'boxes', 30, 'Rangement, tri et organisation', 4),
  ('petits-services-maison', 'Petits services maison', 'Home small tasks', 'wrench', 15, 'Petites interventions domestiques', 5),
  ('auto-transport', 'Auto / Transport', 'Car / Transport', 'car', 15, 'Services voiture et transport local', 6),
  ('animaux', 'Animaux', 'Pets', 'paw-print', 15, 'Promenade, garde et soin d animaux', 7),
  ('aide-quotidienne-seniors', 'Aide quotidienne / Seniors', 'Daily help / Seniors', 'heart-handshake', 20, 'Accompagnement seniors et quotidien', 8),
  ('courses-livraison', 'Courses / Livraison', 'Errands / Delivery', 'shopping-cart', 20, 'Courses et livraisons locales', 9)
on conflict (slug) do update set
  name_fr = excluded.name_fr,
  from_price_chf = excluded.from_price_chf,
  description = excluded.description,
  display_order = excluded.display_order;

with catalog as (
  select * from (values
    ('exterieur-jardin', 'tondre-pelouse', 'Tondre la pelouse', 40),
    ('exterieur-jardin', 'ramasser-feuilles', 'Ramasser les feuilles', 30),
    ('exterieur-jardin', 'arroser-plantes', 'Arroser les plantes', 20),
    ('exterieur-jardin', 'desherber-main', 'Desherber a la main', 35),
    ('exterieur-jardin', 'balayer-terrasse', 'Balayer une terrasse', 25),
    ('exterieur-jardin', 'nettoyer-table-jardin', 'Nettoyer table de jardin', 20),
    ('exterieur-jardin', 'ranger-outils-jardin', 'Ranger outils jardin', 20),
    ('exterieur-jardin', 'ramasser-branches', 'Ramasser branches', 30),
    ('exterieur-jardin', 'nettoyer-balcon', 'Nettoyer balcon', 30),
    ('exterieur-jardin', 'nettoyer-allee', 'Nettoyer allee', 30),
    ('exterieur-jardin', 'ramasser-fruits-tombes', 'Ramasser fruits tombes', 25),
    ('exterieur-jardin', 'nettoyer-pots', 'Nettoyer pots', 20),
    ('exterieur-jardin', 'aerer-terre', 'Aerer terre', 25),
    ('exterieur-jardin', 'installer-tuyau', 'Installer tuyau', 25),
    ('exterieur-jardin', 'deplacer-mobilier-exterieur', 'Deplacer mobilier exterieur', 30),

    ('entretien-saisonnier', 'deneiger-entree', 'Deneiger entree', 40),
    ('entretien-saisonnier', 'deneiger-trottoir', 'Deneiger trottoir', 40),
    ('entretien-saisonnier', 'saler-allee', 'Saler allee', 25),
    ('entretien-saisonnier', 'gratter-pare-brise', 'Gratter pare-brise', 15),
    ('entretien-saisonnier', 'nettoyer-voiture-neige', 'Nettoyer voiture neige', 25),
    ('entretien-saisonnier', 'installer-deco-noel', 'Installer deco Noel', 30),
    ('entretien-saisonnier', 'enlever-deco', 'Enlever deco', 25),
    ('entretien-saisonnier', 'ranger-mobilier-exterieur', 'Ranger mobilier exterieur', 30),
    ('entretien-saisonnier', 'nettoyer-gouttieres-accessibles', 'Nettoyer gouttieres accessibles', 35),
    ('entretien-saisonnier', 'deblayer-feuilles', 'Deblayer feuilles', 30),

    ('menage-nettoyage', 'aspirateur', 'Aspirateur', 25),
    ('menage-nettoyage', 'laver-sol', 'Laver sol', 30),
    ('menage-nettoyage', 'nettoyer-cuisine', 'Nettoyer cuisine', 35),
    ('menage-nettoyage', 'nettoyer-salle-bain', 'Nettoyer salle de bain', 35),
    ('menage-nettoyage', 'faire-poussiere', 'Faire poussiere', 25),
    ('menage-nettoyage', 'nettoyer-vitres', 'Nettoyer vitres', 30),
    ('menage-nettoyage', 'sortir-poubelles', 'Sortir poubelles', 15),
    ('menage-nettoyage', 'trier-dechets', 'Trier dechets', 20),
    ('menage-nettoyage', 'nettoyer-frigo', 'Nettoyer frigo', 30),
    ('menage-nettoyage', 'nettoyer-micro-ondes', 'Nettoyer micro-ondes', 15),
    ('menage-nettoyage', 'nettoyer-plaques', 'Nettoyer plaques', 20),
    ('menage-nettoyage', 'ranger-appartement', 'Ranger appartement', 30),
    ('menage-nettoyage', 'faire-lit', 'Faire lit', 15),
    ('menage-nettoyage', 'plier-linge', 'Plier linge', 20),
    ('menage-nettoyage', 'lancer-machine', 'Lancer machine', 15),

    ('organisation-rangement', 'ranger-garage', 'Ranger garage', 40),
    ('organisation-rangement', 'trier-vetements', 'Trier vetements', 30),
    ('organisation-rangement', 'organiser-placard', 'Organiser placard', 30),
    ('organisation-rangement', 'vider-cave', 'Vider cave', 40),
    ('organisation-rangement', 'aide-demenagement', 'Aide demenagement', 40),
    ('organisation-rangement', 'deballer-cartons', 'Deballer cartons', 30),
    ('organisation-rangement', 'classer-papiers', 'Classer papiers', 30),
    ('organisation-rangement', 'ranger-cuisine', 'Ranger cuisine', 30),
    ('organisation-rangement', 'organiser-bureau', 'Organiser bureau', 30),
    ('organisation-rangement', 'preparer-cartons', 'Preparer cartons', 30),

    ('petits-services-maison', 'changer-ampoule', 'Changer ampoule', 20),
    ('petits-services-maison', 'installer-rideaux', 'Installer rideaux', 30),
    ('petits-services-maison', 'deplacer-meubles', 'Deplacer meubles', 30),
    ('petits-services-maison', 'monter-meuble-simple', 'Monter meuble simple', 40),
    ('petits-services-maison', 'poser-tapis', 'Poser tapis', 20),
    ('petits-services-maison', 'installer-deco', 'Installer deco', 25),
    ('petits-services-maison', 'brancher-electromenager', 'Brancher electromenager', 25),
    ('petits-services-maison', 'verifier-piles', 'Verifier piles', 15),
    ('petits-services-maison', 'nettoyer-ventilateur', 'Nettoyer ventilateur', 20),
    ('petits-services-maison', 'installer-multiprise', 'Installer multiprise', 20),

    ('auto-transport', 'nettoyer-interieur-voiture', 'Nettoyer interieur voiture', 40),
    ('auto-transport', 'laver-voiture-exterieur', 'Laver voiture exterieur', 30),
    ('auto-transport', 'aspirer-voiture', 'Aspirer voiture', 30),
    ('auto-transport', 'faire-plein', 'Faire le plein', 15),
    ('auto-transport', 'aller-garage', 'Aller au garage', 30),
    ('auto-transport', 'deposer-voiture', 'Deposer voiture', 25),
    ('auto-transport', 'recuperer-voiture', 'Recuperer voiture', 25),
    ('auto-transport', 'verifier-pneus', 'Verifier pneus', 20),
    ('auto-transport', 'nettoyer-pare-brise', 'Nettoyer pare-brise', 15),
    ('auto-transport', 'ranger-coffre', 'Ranger coffre', 20),

    ('animaux', 'promenade-chien', 'Promenade chien', 25),
    ('animaux', 'nourrir-animaux', 'Nourrir animaux', 20),
    ('animaux', 'donner-eau', 'Donner eau', 15),
    ('animaux', 'nettoyer-gamelles', 'Nettoyer gamelles', 15),
    ('animaux', 'nettoyer-litiere', 'Nettoyer litiere', 20),
    ('animaux', 'jouer-animal', 'Jouer avec animal', 20),
    ('animaux', 'garde-domicile', 'Garde domicile', 40),
    ('animaux', 'surveillance-animaux', 'Surveillance', 30),
    ('animaux', 'nettoyer-cage', 'Nettoyer cage', 20),
    ('animaux', 'accompagner-veterinaire', 'Accompagner veterinaire', 40),

    ('aide-quotidienne-seniors', 'accompagner-medecin', 'Accompagner medecin', 40),
    ('aide-quotidienne-seniors', 'aller-pharmacie', 'Aller pharmacie', 25),
    ('aide-quotidienne-seniors', 'faire-courses-seniors', 'Faire courses', 30),
    ('aide-quotidienne-seniors', 'porter-sacs', 'Porter sacs', 20),
    ('aide-quotidienne-seniors', 'tenir-compagnie', 'Tenir compagnie', 30),
    ('aide-quotidienne-seniors', 'lire-courrier', 'Lire courrier', 20),
    ('aide-quotidienne-seniors', 'aide-telephone', 'Aide telephone', 25),
    ('aide-quotidienne-seniors', 'aide-tablette-tv', 'Aide tablette / TV', 25),
    ('aide-quotidienne-seniors', 'promenade-accompagnee', 'Promenade accompagnee', 30),
    ('aide-quotidienne-seniors', 'aller-medicaments', 'Aller medicaments', 25),

    ('courses-livraison', 'faire-courses', 'Faire courses', 30),
    ('courses-livraison', 'aller-poste', 'Aller poste', 25),
    ('courses-livraison', 'deposer-colis', 'Deposer colis', 20),
    ('courses-livraison', 'recuperer-colis', 'Recuperer colis', 20),
    ('courses-livraison', 'livrer-objet', 'Livrer objet', 25),
    ('courses-livraison', 'acheter-produit', 'Acheter produit', 25),
    ('courses-livraison', 'aller-chercher-repas', 'Aller chercher repas', 20),
    ('courses-livraison', 'livraison-rapide', 'Livraison rapide', 30),
    ('courses-livraison', 'deposer-documents', 'Deposer documents', 25),
    ('courses-livraison', 'aller-pressing', 'Aller pressing', 25)
  ) as t(category_slug, slug, title, base_price)
)
insert into public.services (category_id, slug, title, description, tags, mode, from_price_chf, active)
select
  c.id,
  catalog.slug,
  catalog.title,
  catalog.title || ' - intervention locale en Suisse',
  array[c.name_fr, 'local', 'nearyou']::text[],
  'planned',
  catalog.base_price,
  true
from catalog
join public.service_categories c on c.slug = catalog.category_slug
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  from_price_chf = excluded.from_price_chf,
  active = true;

insert into public.partners (name, type, city, address, latitude, longitude, commission_rate)
values
  ('Cafe du Centre', 'cafe', 'Lausanne', 'Place Centrale 4', 46.5198, 6.6323, 5),
  ('Pharmacie de la Gare', 'pharmacy', 'Lausanne', 'Avenue de la Gare 12', 46.5169, 6.6291, 5),
  ('Cafe Ouchy', 'cafe', 'Lausanne', 'Quai d Ouchy 21', 46.5076, 6.6259, 5)
on conflict do nothing;
