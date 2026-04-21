-- NearYou: advanced admin RBAC + provider onboarding workflow + sensitive docs

create type public.admin_scope as enum ('super_admin', 'admin_ops', 'admin_support', 'admin_review');
create type public.provider_application_workflow_status as enum (
  'draft',
  'submitted',
  'pending_review',
  'approved',
  'rejected',
  'needs_info'
);

create table if not exists public.admin_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  scope public.admin_scope not null default 'admin_support',
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table if exists public.provider_applications
  add column if not exists profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists address_line text,
  add column if not exists postal_code text,
  add column if not exists canton text,
  add column if not exists intervention_radius_km int,
  add column if not exists legal_status text,
  add column if not exists company_name text,
  add column if not exists ide_number text,
  add column if not exists id_document_type text,
  add column if not exists id_document_path text,
  add column if not exists residence_permit_type text,
  add column if not exists residence_permit_path text,
  add column if not exists legal_responsibility_ack boolean not null default false,
  add column if not exists terms_ack boolean not null default false,
  add column if not exists workflow_status public.provider_application_workflow_status not null default 'submitted',
  add column if not exists admin_note text,
  add column if not exists reviewed_by uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_admin_accounts_scope on public.admin_accounts(scope) where is_active = true;
create index if not exists idx_provider_applications_profile on public.provider_applications(profile_id);
create index if not exists idx_provider_applications_workflow on public.provider_applications(workflow_status);
create index if not exists idx_provider_applications_created on public.provider_applications(created_at desc);

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.admin_accounts a on a.profile_id = p.id and a.is_active = true
    where p.id = auth.uid()
      and p.role = 'admin'
      and a.scope = 'super_admin'
  );
$$;

create or replace function public.has_admin_scope(required_scopes public.admin_scope[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    join public.admin_accounts a on a.profile_id = p.id and a.is_active = true
    where p.id = auth.uid()
      and p.role = 'admin'
      and a.scope = any(required_scopes)
  );
$$;

alter table public.admin_accounts enable row level security;
alter table public.admin_audit_events enable row level security;

create policy "admin_accounts_super_admin_read"
on public.admin_accounts
for select
using (public.is_super_admin() or profile_id = auth.uid());

create policy "admin_accounts_super_admin_manage"
on public.admin_accounts
for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admin_audit_events_admin_read"
on public.admin_audit_events
for select
using (public.has_admin_scope(array['super_admin','admin_ops','admin_support','admin_review']::public.admin_scope[]));

create policy "admin_audit_events_admin_insert"
on public.admin_audit_events
for insert
with check (public.has_admin_scope(array['super_admin','admin_ops','admin_support','admin_review']::public.admin_scope[]));

create policy "provider_applications_owner_read"
on public.provider_applications
for select
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review','admin_ops']::public.admin_scope[])
);

create policy "provider_applications_owner_update"
on public.provider_applications
for update
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
);

drop trigger if exists trg_provider_applications_updated_at on public.provider_applications;
create trigger trg_provider_applications_updated_at
before update on public.provider_applications
for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('provider-documents', 'provider-documents', false)
on conflict (id) do nothing;

create policy "provider_documents_admin_read"
on storage.objects
for select
using (
  bucket_id = 'provider-documents'
  and public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
);

create policy "provider_documents_super_admin_delete"
on storage.objects
for delete
using (
  bucket_id = 'provider-documents'
  and public.has_admin_scope(array['super_admin']::public.admin_scope[])
);

