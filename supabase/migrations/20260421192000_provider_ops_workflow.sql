-- NearYou: provider operations model (documents, availability, request workflow, payments prep)

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    where t.typname = 'provider_application_workflow_status'
      and e.enumlabel = 'suspended'
  ) then
    alter type public.provider_application_workflow_status add value 'suspended';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'suspended');
  end if;
end $$;

alter table if exists public.profiles
  add column if not exists account_status public.account_status not null default 'active';

create index if not exists idx_profiles_account_status on public.profiles(account_status);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'service_request_provider_status') then
    create type public.service_request_provider_status as enum (
      'new',
      'pending_assignment',
      'assigned',
      'accepted',
      'declined',
      'in_progress',
      'completed',
      'cancelled',
      'disputed'
    );
  end if;
end $$;

alter table if exists public.service_requests
  add column if not exists provider_status public.service_request_provider_status not null default 'new',
  add column if not exists assigned_provider_profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists assigned_at timestamptz,
  add column if not exists scheduled_for timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists client_address text,
  add column if not exists internal_note text,
  add column if not exists budget_amount_chf numeric(10,2),
  add column if not exists platform_commission_chf numeric(10,2) not null default 0,
  add column if not exists provider_payout_chf numeric(10,2);

create index if not exists idx_service_requests_provider_status on public.service_requests(provider_status);
create index if not exists idx_service_requests_assigned_provider on public.service_requests(assigned_provider_profile_id);
create index if not exists idx_service_requests_scheduled_for on public.service_requests(scheduled_for);

create table if not exists public.service_request_provider_history (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  from_status public.service_request_provider_status,
  to_status public.service_request_provider_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_request_provider_history_request
  on public.service_request_provider_history(service_request_id, created_at desc);

create or replace function public.log_service_request_provider_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.service_request_provider_history(service_request_id, from_status, to_status, changed_by, note)
    values (new.id, null, new.provider_status, new.profile_id, 'Demande creee');
    return new;
  end if;

  if tg_op = 'UPDATE' and old.provider_status is distinct from new.provider_status then
    insert into public.service_request_provider_history(service_request_id, from_status, to_status, changed_by, note)
    values (new.id, old.provider_status, new.provider_status, null, new.internal_note);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_service_request_provider_history on public.service_requests;
create trigger trg_service_request_provider_history
after insert or update on public.service_requests
for each row execute function public.log_service_request_provider_status_change();

alter table public.service_request_provider_history enable row level security;

create policy "service_request_provider_history_owner_read"
on public.service_request_provider_history
for select
using (
  exists (
    select 1
    from public.service_requests sr
    where sr.id = service_request_provider_history.service_request_id
      and (
        sr.profile_id = auth.uid()
        or sr.assigned_provider_profile_id = auth.uid()
        or public.is_admin()
      )
  )
);

create policy "service_requests_provider_read"
on public.service_requests
for select
using (
  assigned_provider_profile_id = auth.uid()
  or (
    provider_status in ('new', 'pending_assignment')
    and exists (
      select 1
      from public.provider_applications pa
      where pa.profile_id = auth.uid()
        and pa.workflow_status = 'approved'
        and lower(pa.category) = lower(service_requests.category)
    )
  )
  or public.is_admin()
  or profile_id = auth.uid()
);

create policy "service_requests_provider_update"
on public.service_requests
for update
using (
  assigned_provider_profile_id = auth.uid()
  or public.is_admin()
  or profile_id = auth.uid()
)
with check (
  assigned_provider_profile_id = auth.uid()
  or public.is_admin()
  or profile_id = auth.uid()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_document_kind') then
    create type public.provider_document_kind as enum (
      'identity',
      'residence_permit',
      'insurance_rc',
      'activity_proof',
      'other'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_document_status') then
    create type public.provider_document_status as enum (
      'uploaded',
      'pending_review',
      'approved',
      'rejected',
      'needs_resubmission'
    );
  end if;
end $$;

create table if not exists public.provider_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  application_id uuid references public.provider_applications(id) on delete set null,
  kind public.provider_document_kind not null,
  status public.provider_document_status not null default 'pending_review',
  storage_path text not null,
  original_filename text,
  mime_type text,
  file_size_bytes bigint,
  admin_note text,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_provider_documents_profile on public.provider_documents(profile_id, created_at desc);
create index if not exists idx_provider_documents_status on public.provider_documents(status);

drop trigger if exists trg_provider_documents_updated_at on public.provider_documents;
create trigger trg_provider_documents_updated_at
before update on public.provider_documents
for each row execute function public.set_updated_at();

alter table public.provider_documents enable row level security;

create policy "provider_documents_owner_read"
on public.provider_documents
for select
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review','admin_ops']::public.admin_scope[])
);

create policy "provider_documents_owner_insert"
on public.provider_documents
for insert
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review','admin_ops']::public.admin_scope[])
);

create policy "provider_documents_owner_update"
on public.provider_documents
for update
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
);

create policy "provider_documents_owner_storage_read"
on storage.objects
for select
using (
  bucket_id = 'provider-documents'
  and (
    public.has_admin_scope(array['super_admin','admin_review','admin_ops']::public.admin_scope[])
    or (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  )
);

create policy "provider_documents_owner_storage_insert"
on storage.objects
for insert
with check (
  bucket_id = 'provider-documents'
  and (
    public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
    or (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  )
);

create policy "provider_documents_owner_storage_delete"
on storage.objects
for delete
using (
  bucket_id = 'provider-documents'
  and (
    public.has_admin_scope(array['super_admin','admin_review']::public.admin_scope[])
    or (auth.uid() is not null and (storage.foldername(name))[1] = auth.uid()::text)
  )
);

create table if not exists public.provider_availability_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists idx_provider_availability_profile
  on public.provider_availability_rules(profile_id, day_of_week);

drop trigger if exists trg_provider_availability_rules_updated_at on public.provider_availability_rules;
create trigger trg_provider_availability_rules_updated_at
before update on public.provider_availability_rules
for each row execute function public.set_updated_at();

create table if not exists public.provider_unavailability_periods (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists idx_provider_unavailability_profile
  on public.provider_unavailability_periods(profile_id, starts_at);

alter table public.provider_availability_rules enable row level security;
alter table public.provider_unavailability_periods enable row level security;

create policy "provider_availability_owner_manage"
on public.provider_availability_rules
for all
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
);

create policy "provider_unavailability_owner_manage"
on public.provider_unavailability_periods
for all
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
)
with check (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review']::public.admin_scope[])
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'provider_payment_status') then
    create type public.provider_payment_status as enum ('pending', 'scheduled', 'paid', 'failed', 'disputed');
  end if;
end $$;

create table if not exists public.payment_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  service_request_id uuid references public.service_requests(id) on delete set null,
  gross_amount_chf numeric(10,2) not null default 0,
  commission_amount_chf numeric(10,2) not null default 0,
  net_amount_chf numeric(10,2) not null default 0,
  status public.provider_payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payment_records_profile on public.payment_records(profile_id, created_at desc);
create index if not exists idx_payment_records_status on public.payment_records(status);

drop trigger if exists trg_payment_records_updated_at on public.payment_records;
create trigger trg_payment_records_updated_at
before update on public.payment_records
for each row execute function public.set_updated_at();

alter table public.payment_records enable row level security;

create policy "payment_records_owner_read"
on public.payment_records
for select
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[])
);

create policy "payment_records_admin_manage"
on public.payment_records
for all
using (public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[]))
with check (public.has_admin_scope(array['super_admin','admin_ops']::public.admin_scope[]));

create table if not exists public.provider_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  notification_type text not null,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_provider_notifications_profile
  on public.provider_notifications(profile_id, created_at desc);

alter table public.provider_notifications enable row level security;

create policy "provider_notifications_owner_read"
on public.provider_notifications
for select
using (
  profile_id = auth.uid()
  or public.has_admin_scope(array['super_admin','admin_ops','admin_review','admin_support']::public.admin_scope[])
);

create policy "provider_notifications_owner_update"
on public.provider_notifications
for update
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

create policy "provider_notifications_admin_insert"
on public.provider_notifications
for insert
with check (
  public.has_admin_scope(array['super_admin','admin_ops','admin_review','admin_support']::public.admin_scope[])
);

alter table if exists public.service_categories
  add column if not exists description text,
  add column if not exists display_order int not null default 0;

create index if not exists idx_service_categories_display_order on public.service_categories(display_order, created_at);

alter table if exists public.provider_applications
  add column if not exists country text,
  add column if not exists iban text,
  add column if not exists vat_number text,
  add column if not exists languages text[] not null default '{}',
  add column if not exists accepts_urgency boolean not null default false;
