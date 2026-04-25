-- PrèsDeToi: smart search schema + demo provider metadata

alter table if exists public.service_categories
  add column if not exists ai_search_hint text;

alter table if exists public.providers
  add column if not exists is_demo boolean not null default false,
  add column if not exists demo_label text,
  add column if not exists provider_type text,
  add column if not exists intervention_radius_km int not null default 15,
  add column if not exists available_now boolean not null default false,
  add column if not exists search_tags text[] not null default '{}';

create index if not exists idx_providers_is_demo on public.providers(is_demo);
create index if not exists idx_providers_provider_type on public.providers(provider_type);
create index if not exists idx_providers_available_now on public.providers(available_now);

create table if not exists public.search_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  synonyms text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.service_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  search_tag_id uuid references public.search_tags(id) on delete set null,
  category_id uuid references public.service_categories(id) on delete cascade,
  service_id uuid references public.services(id) on delete cascade,
  weight smallint not null default 1 check (weight between 1 and 10),
  created_at timestamptz not null default now()
);

create index if not exists idx_service_keywords_keyword on public.service_keywords(keyword);
create index if not exists idx_service_keywords_category on public.service_keywords(category_id);
create index if not exists idx_service_keywords_service on public.service_keywords(service_id);
create index if not exists idx_service_keywords_tag on public.service_keywords(search_tag_id);
create unique index if not exists idx_service_keywords_unique_mapping
  on public.service_keywords (
    lower(keyword),
    coalesce(search_tag_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid),
    coalesce(service_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create table if not exists public.search_logs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  query_text text not null,
  normalized_query text not null,
  detected_city text,
  detected_postal_code text,
  detected_tags text[] not null default '{}',
  detected_category_slugs text[] not null default '{}',
  detected_service_slugs text[] not null default '{}',
  result_count int not null default 0,
  has_exact_match boolean not null default false,
  source_page text not null default 'web',
  filters jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_logs_created on public.search_logs(created_at desc);
create index if not exists idx_search_logs_query on public.search_logs(normalized_query);
create index if not exists idx_search_logs_profile on public.search_logs(profile_id, created_at desc);

alter table public.search_tags enable row level security;
alter table public.service_keywords enable row level security;
alter table public.search_logs enable row level security;

drop policy if exists "search_tags_public_read" on public.search_tags;
create policy "search_tags_public_read"
on public.search_tags
for select
using (active = true);

drop policy if exists "search_tags_admin_manage" on public.search_tags;
create policy "search_tags_admin_manage"
on public.search_tags
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "service_keywords_public_read" on public.service_keywords;
create policy "service_keywords_public_read"
on public.service_keywords
for select
using (true);

drop policy if exists "service_keywords_admin_manage" on public.service_keywords;
create policy "service_keywords_admin_manage"
on public.service_keywords
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "search_logs_public_insert" on public.search_logs;
create policy "search_logs_public_insert"
on public.search_logs
for insert
with check (true);

drop policy if exists "search_logs_owner_or_admin_read" on public.search_logs;
create policy "search_logs_owner_or_admin_read"
on public.search_logs
for select
using (profile_id = auth.uid() or public.is_admin());

insert into public.search_tags (slug, label, synonyms)
values
  ('menage', 'Ménage', array['nettoyage', 'proprete', 'fin de bail']),
  ('jardin', 'Jardin', array['jardinage', 'tonte', 'haie', 'pelouse']),
  ('animaux', 'Animaux', array['chien', 'promenade chien', 'garde animaux', 'chat']),
  ('senior', 'Aide seniors', array['accompagnement', 'courses senior', 'maman', 'papa']),
  ('informatique', 'Informatique', array['ordinateur', 'telephone', 'iphone', 'tablette', 'wifi']),
  ('montage-meuble', 'Montage meubles', array['ikea', 'armoire', 'meuble']),
  ('bricolage', 'Bricolage', array['petits travaux', 'reparation']),
  ('transport', 'Transport', array['demenagement', 'livraison', 'accompagnement transport']),
  ('administratif', 'Aide administrative', array['formulaire', 'papier', 'demarches']),
  ('urgence', 'Urgence', array['disponible maintenant', 'express', 'urgent'])
on conflict (slug) do update set
  label = excluded.label,
  synonyms = excluded.synonyms,
  active = true;

with tags as (
  select id, slug from public.search_tags
),
categories as (
  select id, slug from public.service_categories
)
insert into public.service_keywords (keyword, search_tag_id, category_id, weight)
select keyword, t.id, c.id, weight
from (
  values
    ('menage', 'menage', 'menage', 8),
    ('nettoyage', 'menage', 'menage', 8),
    ('fin de bail', 'menage', 'menage', 9),
    ('jardin', 'jardin', 'jardinage', 8),
    ('tonte', 'jardin', 'jardinage', 7),
    ('haie', 'jardin', 'jardinage', 7),
    ('chien', 'animaux', 'promenade-chien', 9),
    ('promener mon chien', 'animaux', 'promenade-chien', 10),
    ('garde animaux', 'animaux', 'garde-animaux', 9),
    ('senior', 'senior', 'aide-seniors', 8),
    ('accompagner', 'senior', 'accompagnement', 8),
    ('informatique', 'informatique', 'informatique', 9),
    ('ordinateur', 'informatique', 'informatique', 8),
    ('iphone', 'informatique', 'informatique', 7),
    ('montage meuble', 'montage-meuble', 'montage-meubles', 10),
    ('armoire ikea', 'montage-meuble', 'montage-meubles', 10),
    ('bricolage', 'bricolage', 'bricolage', 8),
    ('demenagement', 'transport', 'demenagement', 8),
    ('livraison', 'transport', 'livraison-locale', 8),
    ('administratif', 'administratif', 'aide-administrative', 9),
    ('urgence', 'urgence', 'missions-diverses', 6)
) as mapping(keyword, tag_slug, category_slug, weight)
join tags t on t.slug = mapping.tag_slug
join categories c on c.slug = mapping.category_slug
on conflict (
  (lower(keyword)),
  (coalesce(search_tag_id, '00000000-0000-0000-0000-000000000000'::uuid)),
  (coalesce(category_id, '00000000-0000-0000-0000-000000000000'::uuid)),
  (coalesce(service_id, '00000000-0000-0000-0000-000000000000'::uuid))
) do update set
  weight = excluded.weight;
