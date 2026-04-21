insert into public.service_categories (slug, name_fr, name_en, icon, from_price_chf)
values
  ('aide-domicile', 'Aide à domicile', 'Home help', 'home', 35),
  ('visite-senior', 'Visite personne âgée', 'Senior visit', 'heart-handshake', 29),
  ('promenade-chien', 'Promenade chien', 'Dog walking', 'dog', 22),
  ('petits-services', 'Petits services', 'Small services', 'wrench', 25),
  ('parking', 'Parking', 'Parking', 'car', 12)
on conflict (slug) do nothing;

insert into public.services (category_id, slug, title, description, tags, mode, from_price_chf)
select c.id, v.slug, v.title, v.description, v.tags, v.mode, v.from_price
from (
  values
  ('aide-domicile-menage', 'Ménage léger à domicile', 'Entretien simple du quotidien à Lausanne', array['ménage','quotidien']::text[], 'planned', 35),
  ('aide-domicile-courses', 'Courses accompagnées', 'Accompagnement pour courses et pharmacie', array['courses','senior']::text[], 'planned', 32),
  ('visite-senior-presence', 'Présence conviviale', 'Visite de présence et discussion', array['senior','présence']::text[], 'planned', 29),
  ('promenade-chien-30', 'Promenade chien 30 min', 'Sortie locale rapide', array['chien','instantané']::text[], 'instant', 22),
  ('petits-services-meubles', 'Montage de meubles', 'Montage et ajustements simples', array['meubles','bricolage']::text[], 'planned', 38),
  ('parking-jour', 'Parking journée', 'Place sécurisée en journée', array['parking','jour']::text[], 'instant', 12),
  ('parking-camping-prise', 'Parking camping avec prise', 'Place camping/van avec accès électrique', array['parking','camping','prise']::text[], 'planned', 24)
) as v(slug, title, description, tags, mode, from_price)
join public.service_categories c on (
  (v.slug like 'aide-domicile%' and c.slug = 'aide-domicile') or
  (v.slug like 'visite-senior%' and c.slug = 'visite-senior') or
  (v.slug like 'promenade-chien%' and c.slug = 'promenade-chien') or
  (v.slug like 'petits-services%' and c.slug = 'petits-services') or
  (v.slug like 'parking%' and c.slug = 'parking')
)
on conflict (slug) do nothing;

insert into public.partners (name, type, city, address, latitude, longitude, commission_rate)
values
  ('Café du Centre', 'cafe', 'Lausanne', 'Place Centrale 4', 46.5198, 6.6323, 5),
  ('Pharmacie de la Gare', 'pharmacy', 'Lausanne', 'Avenue de la Gare 12', 46.5169, 6.6291, 5),
  ('Café Ouchy', 'cafe', 'Lausanne', 'Quai d''Ouchy 21', 46.5076, 6.6259, 5)
on conflict do nothing;
