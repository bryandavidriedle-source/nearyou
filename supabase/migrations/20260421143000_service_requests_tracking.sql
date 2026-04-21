-- NearYou: customer request tracking for "Mes demandes"

alter table if exists public.service_requests
  add column if not exists profile_id uuid references public.profiles(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_service_requests_profile on public.service_requests(profile_id);
create index if not exists idx_service_requests_status on public.service_requests(status);

create table if not exists public.service_request_status_history (
  id uuid primary key default gen_random_uuid(),
  service_request_id uuid not null references public.service_requests(id) on delete cascade,
  from_status public.support_status,
  to_status public.support_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_service_request_status_history_request
  on public.service_request_status_history(service_request_id, created_at desc);

create or replace function public.log_service_request_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.service_request_status_history(service_request_id, from_status, to_status, changed_by, note)
    values (new.id, null, new.status, new.profile_id, 'Demande créée');
    return new;
  end if;

  if tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.service_request_status_history(service_request_id, from_status, to_status, changed_by, note)
    values (new.id, old.status, new.status, null, null);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_service_requests_updated_at on public.service_requests;
create trigger trg_service_requests_updated_at
before update on public.service_requests
for each row execute function public.set_updated_at();

drop trigger if exists trg_service_request_status_history on public.service_requests;
create trigger trg_service_request_status_history
after insert or update on public.service_requests
for each row execute function public.log_service_request_status_change();

create policy "service_requests_owner_read"
on public.service_requests
for select
using (profile_id = auth.uid() or public.is_admin());

create policy "service_requests_owner_update"
on public.service_requests
for update
using (profile_id = auth.uid() or public.is_admin())
with check (profile_id = auth.uid() or public.is_admin());

create policy "service_request_history_owner_read"
on public.service_request_status_history
for select
using (
  service_request_id in (
    select sr.id from public.service_requests sr
    where sr.profile_id = auth.uid()
  ) or public.is_admin()
);

