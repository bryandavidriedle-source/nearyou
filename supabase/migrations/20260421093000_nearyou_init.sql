-- NearYou production schema (Supabase/Postgres)
create extension if not exists "pgcrypto";

create type public.app_role as enum ('customer', 'provider', 'admin');
create type public.booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'released', 'failed', 'refunded');
create type public.partner_type as enum ('cafe', 'pharmacy');
create type public.support_status as enum ('new', 'reviewing', 'contacted', 'closed');
create type public.ai_role as enum ('system', 'assistant', 'user');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  first_name text,
  last_name text,
  phone text,
  city text default 'Lausanne',
  avatar_url text,
  bio text,
  language text default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  display_name text not null,
  rating numeric(3,2) not null default 5,
  completed_missions int not null default 0,
  verified boolean not null default false,
  top_provider boolean not null default false,
  hourly_from_chf int not null check (hourly_from_chf >= 0),
  is_active boolean not null default true,
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_fr text not null,
  name_en text,
  name_it text,
  name_de text,
  icon text,
  from_price_chf int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.service_categories(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  tags text[] not null default '{}',
  mode text not null default 'planned',
  from_price_chf int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.provider_service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  city text not null,
  postal_code text,
  radius_km int not null check (radius_km between 1 and 100),
  latitude numeric(9,6),
  longitude numeric(9,6),
  created_at timestamptz not null default now()
);

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.partner_type not null,
  city text not null default 'Lausanne',
  address text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  commission_rate numeric(5,2) not null default 5,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  service_id uuid references public.services(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  reservation_source text not null default 'app',
  status public.booking_status not null default 'pending',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  address text,
  city text default 'Lausanne',
  notes text,
  price_from_chf int not null default 0,
  currency text not null default 'CHF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.booking_status_history (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  from_status public.booking_status,
  to_status public.booking_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  amount_chf int not null default 0,
  platform_fee_chf int not null default 0,
  provider_payout_chf int not null default 0,
  stripe_payment_intent_id text,
  twint_reference text,
  status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.providers(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  comment text,
  is_public boolean not null default true,
  is_moderated boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status public.support_status not null default 'new',
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  status public.support_status not null default 'new',
  topic text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role public.ai_role not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  actor_role public.app_role,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Legacy lead forms kept for MVP operations
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.support_status not null default 'new',
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  category text not null,
  description text not null,
  urgency text not null,
  budget text not null,
  consent boolean not null default false
);

create table if not exists public.provider_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.support_status not null default 'new',
  business_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  category text not null,
  services_description text not null,
  years_experience text not null,
  availability text not null,
  website_or_instagram text,
  consent boolean not null default false
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.support_status not null default 'new',
  full_name text not null,
  email text not null,
  subject text not null,
  message text not null,
  consent boolean not null default false
);

create table if not exists public.hotline_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.support_status not null default 'new',
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  service_type text not null,
  preferred_time text,
  notes text,
  source text not null default 'web'
);

create table if not exists public.call_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status public.support_status not null default 'new',
  first_name text not null,
  last_name text not null,
  phone text not null,
  city text not null,
  category text not null,
  preferred_slot text not null,
  contact_mode text not null,
  note text,
  consent boolean not null default false,
  source text not null default 'web'
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_providers_active on public.providers(is_active);
create index if not exists idx_services_category on public.services(category_id);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_bookings_provider on public.bookings(provider_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_reviews_provider on public.reviews(provider_id);
create index if not exists idx_support_messages_status on public.support_messages(status);
create index if not exists idx_ai_messages_conversation on public.ai_messages(conversation_id);
create index if not exists idx_audit_logs_entity on public.audit_logs(entity, entity_id);
create index if not exists idx_service_requests_created on public.service_requests(created_at desc);
create index if not exists idx_provider_applications_created on public.provider_applications(created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.providers enable row level security;
alter table public.service_categories enable row level security;
alter table public.services enable row level security;
alter table public.provider_service_areas enable row level security;
alter table public.availability_slots enable row level security;
alter table public.partners enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.support_messages enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.audit_logs enable row level security;
alter table public.service_requests enable row level security;
alter table public.provider_applications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.hotline_requests enable row level security;
alter table public.call_requests enable row level security;

create policy "public_read_categories" on public.service_categories for select using (active = true);
create policy "public_read_services" on public.services for select using (active = true);
create policy "public_read_providers" on public.providers for select using (is_active = true);
create policy "public_read_partners" on public.partners for select using (active = true);
create policy "public_read_areas" on public.provider_service_areas for select using (true);
create policy "public_read_availability" on public.availability_slots for select using (true);

create policy "profile_owner_read" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "profile_owner_upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "profile_owner_update" on public.profiles for update using (auth.uid() = id or public.is_admin());

create policy "provider_owner_manage" on public.providers for all using (
  profile_id = auth.uid() or public.is_admin()
) with check (
  profile_id = auth.uid() or public.is_admin()
);

create policy "booking_owner_read" on public.bookings for select using (
  customer_id = auth.uid() or
  provider_id in (select id from public.providers where profile_id = auth.uid()) or
  public.is_admin()
);
create policy "booking_customer_insert" on public.bookings for insert with check (customer_id = auth.uid() or customer_id is null);
create policy "booking_provider_update" on public.bookings for update using (
  provider_id in (select id from public.providers where profile_id = auth.uid()) or public.is_admin()
);

create policy "booking_status_history_read" on public.booking_status_history for select using (public.is_admin());
create policy "booking_status_history_insert_admin" on public.booking_status_history for insert with check (public.is_admin());

create policy "payments_read_involved" on public.payments for select using (
  provider_id in (select id from public.providers where profile_id = auth.uid()) or public.is_admin()
);

create policy "reviews_public_read" on public.reviews for select using (is_public = true or public.is_admin());
create policy "reviews_customer_insert" on public.reviews for insert with check (customer_id = auth.uid());

create policy "support_insert_public" on public.support_messages for insert with check (true);
create policy "support_read_owner" on public.support_messages for select using (profile_id = auth.uid() or public.is_admin());
create policy "support_update_admin" on public.support_messages for update using (public.is_admin());

create policy "ai_conversation_owner" on public.ai_conversations for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());
create policy "ai_messages_owner" on public.ai_messages for select using (
  conversation_id in (select id from public.ai_conversations where profile_id = auth.uid()) or public.is_admin()
);

create policy "audit_admin_only" on public.audit_logs for all using (public.is_admin()) with check (public.is_admin());

create policy "lead_forms_insert_public" on public.service_requests for insert with check (true);
create policy "lead_forms_insert_provider" on public.provider_applications for insert with check (true);
create policy "lead_forms_insert_contact" on public.contact_messages for insert with check (true);
create policy "lead_forms_insert_hotline" on public.hotline_requests for insert with check (true);
create policy "lead_forms_insert_call" on public.call_requests for insert with check (true);
create policy "lead_forms_admin_read_service" on public.service_requests for select using (public.is_admin());
create policy "lead_forms_admin_read_provider" on public.provider_applications for select using (public.is_admin());
create policy "lead_forms_admin_read_contact" on public.contact_messages for select using (public.is_admin());
create policy "lead_forms_admin_read_hotline" on public.hotline_requests for select using (public.is_admin());
create policy "lead_forms_admin_manage_call" on public.call_requests for all using (public.is_admin()) with check (public.is_admin());

