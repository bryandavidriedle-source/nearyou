-- NearYou V1 extensions: provider skills/pricing, payout data, request enrichment, supplements, tips, invoices

do $$
begin
  if not exists (select 1 from pg_type where typname = 'supplement_status') then
    create type public.supplement_status as enum ('pending', 'approved', 'rejected', 'cancelled');
  end if;
end $$;

alter table if exists public.profiles
  add column if not exists birth_date date;

alter table if exists public.provider_applications
  add column if not exists birth_date date;

create table if not exists public.provider_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  account_holder_name text not null,
  iban text not null,
  bank_name text,
  currency text not null default 'CHF',
  is_verified boolean not null default false,
  verification_note text,
  updated_by_admin uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_provider_payout_accounts_updated_at on public.provider_payout_accounts;
create trigger trg_provider_payout_accounts_updated_at
before update on public.provider_payout_accounts
for each row execute function public.set_updated_at();

create table if not exists public.provider_services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  min_price_chf numeric(10,2) not null check (min_price_chf >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, service_id)
);

drop trigger if exists trg_provider_services_updated_at on public.provider_services;
create trigger trg_provider_services_updated_at
before update on public.provider_services
for each row execute function public.set_updated_at();

alter table if exists public.service_requests
  add column if not exists requested_service_id uuid references public.services(id) on delete set null,
  add column if not exists intervention_address text,
  add column if not exists access_instructions text,
  add column if not exists door_code text,
  add column if not exists floor text,
  add column if not exists parking_instructions text,
  add column if not exists garden_access_instructions text,
  add column if not exists materials_available boolean not null default false,
  add column if not exists requested_for timestamptz;

create index if not exists idx_service_requests_requested_service_id on public.service_requests(requested_service_id);

create table if not exists public.service_request_supplements (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  provider_profile_id uuid not null references public.profiles(id) on delete cascade,
  amount_chf numeric(10,2) not null check (amount_chf > 0),
  reason text not null,
  status public.supplement_status not null default 'pending',
  client_decision_note text,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_request_supplements_request
  on public.service_request_supplements(service_request_id, requested_at desc);

create table if not exists public.service_request_tips (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  client_profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_profile_id uuid not null references public.profiles(id) on delete cascade,
  amount_chf numeric(10,2) not null check (amount_chf > 0),
  message text,
  created_at timestamptz not null default now(),
  unique (service_request_id, client_profile_id)
);

create table if not exists public.booking_invoices (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_profile_id uuid not null references public.profiles(id) on delete cascade,
  provider_profile_id uuid references public.profiles(id) on delete set null,
  invoice_number text not null unique,
  total_amount_chf numeric(10,2) not null default 0,
  currency text not null default 'CHF',
  status text not null default 'issued',
  issued_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.provider_payout_accounts enable row level security;
alter table public.provider_services enable row level security;
alter table public.service_request_supplements enable row level security;
alter table public.service_request_tips enable row level security;
alter table public.booking_invoices enable row level security;

create policy "provider_payout_accounts_owner_read"
on public.provider_payout_accounts
for select
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[])
);

create policy "provider_payout_accounts_owner_upsert"
on public.provider_payout_accounts
for insert
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[])
);

create policy "provider_payout_accounts_owner_update"
on public.provider_payout_accounts
for update
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[])
);

create policy "provider_services_owner_manage"
on public.provider_services
for all
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
);

create policy "service_request_supplements_actor_read"
on public.service_request_supplements
for select
using (
  exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_supplements.service_request_id
      and (
        sr.profile_id = auth.uid()
        or sr.assigned_provider_profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "service_request_supplements_provider_insert"
on public.service_request_supplements
for insert
with check (
  provider_profile_id = auth.uid()
  and exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_supplements.service_request_id
      and sr.assigned_provider_profile_id = auth.uid()
  )
);

create policy "service_request_supplements_client_decide"
on public.service_request_supplements
for update
using (
  exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_supplements.service_request_id
      and sr.profile_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_supplements.service_request_id
      and sr.profile_id = auth.uid()
  )
  or public.is_admin()
);

create policy "service_request_tips_actor_read"
on public.service_request_tips
for select
using (
  client_profile_id = auth.uid()
  or provider_profile_id = auth.uid()
  or public.is_admin()
);

create policy "service_request_tips_client_insert"
on public.service_request_tips
for insert
with check (
  client_profile_id = auth.uid()
  and exists (
    select 1 from public.service_requests sr
    where sr.id = service_request_tips.service_request_id
      and sr.profile_id = auth.uid()
      and sr.provider_status = 'completed'
  )
);

create policy "booking_invoices_related_read"
on public.booking_invoices
for select
using (
  customer_profile_id = auth.uid()
  or provider_profile_id = auth.uid()
  or public.is_admin()
);

create policy "booking_invoices_admin_manage"
on public.booking_invoices
for all
using (public.is_admin())
with check (public.is_admin());
