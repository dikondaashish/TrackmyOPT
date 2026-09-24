-- Company outreach bundles. Provider writes happen through authenticated API
-- routes using the service role; users can only read their own saved results.
create table public.networking_bundles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key uuid not null,
  request_company_name text not null,
  request_company_domain text,
  company_name text not null check (length(company_name) between 2 and 120),
  company_domain text,
  target_role text not null check (length(target_role) between 2 and 120),
  user_intent text not null default '',
  status text not null default 'queued' check (status in ('queued','discovering_contacts','validating_contacts','checking_emails','generating_outreach','completed','partial','failed')),
  discovery_status text not null default 'pending' check (discovery_status in ('pending','completed','failed','zero_contacts')),
  email_lookup_status text not null default 'pending' check (email_lookup_status in ('pending','completed','partial','failed')),
  draft_status text not null default 'pending' check (draft_status in ('pending','completed','failed')),
  usage_state text not null default 'reserved' check (usage_state in ('reserved','committed','released')),
  usage_date date not null default (now() at time zone 'utc')::date,
  lease_expires_at timestamptz not null default now() + interval '10 minutes',
  processing_token uuid,
  error_code text,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, idempotency_key)
);

create index networking_bundles_usage_idx on public.networking_bundles (user_id, usage_date, usage_state);
create index networking_bundles_recent_idx on public.networking_bundles (user_id, created_at desc);

create table public.networking_contacts (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.networking_bundles(id) on delete cascade,
  position smallint not null check (position between 1 and 3),
  name text not null,
  title text not null,
  company text not null,
  linkedin_url text not null,
  relevance_reason text not null,
  evidence_json jsonb not null default '[]'::jsonb,
  email text,
  email_status text not null default 'pending' check (email_status in ('pending','verified','unverified','not_found','provider_error')),
  email_subject text,
  email_body text,
  linkedin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bundle_id, position),
  unique (bundle_id, linkedin_url)
);
create index networking_contacts_bundle_idx on public.networking_contacts (bundle_id);

-- Public research only. No resume, user intent, email result, or draft belongs here.
create table public.networking_discovery_cache (
  company_key text not null,
  role_key text not null,
  company_domain text not null,
  discovery_json jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (company_key, role_key)
);
create index networking_discovery_cache_expiry_idx on public.networking_discovery_cache (expires_at);

alter table public.networking_bundles enable row level security;
alter table public.networking_contacts enable row level security;
alter table public.networking_discovery_cache enable row level security;

create policy "Owners read networking bundles" on public.networking_bundles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners read networking contacts" on public.networking_contacts
  for select to authenticated using (exists (
    select 1 from public.networking_bundles b
    where b.id = bundle_id and b.user_id = (select auth.uid())
  ));

revoke all on public.networking_bundles, public.networking_contacts, public.networking_discovery_cache from anon, authenticated;
grant select on public.networking_bundles, public.networking_contacts to authenticated;
grant all on public.networking_bundles, public.networking_contacts, public.networking_discovery_cache to service_role;

create trigger trg_networking_bundles_updated_at before update on public.networking_bundles
  for each row execute function public.update_updated_at_column();
create trigger trg_networking_contacts_updated_at before update on public.networking_contacts
  for each row execute function public.update_updated_at_column();

-- The bundle rows are the usage ledger. One advisory lock serializes reservations
-- for a user, including requests arriving at different server instances.
create function public.reserve_networking_bundle(
  p_user_id uuid, p_key uuid, p_company text, p_domain text,
  p_role text, p_intent text, p_token uuid
)
returns table (allowed boolean, bundle_id uuid, used integer, reserved integer, denial text)
language plpgsql security invoker set search_path = '' as $$
declare
  v_existing public.networking_bundles%rowtype;
  v_used integer;
  v_reserved integer;
  v_id uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  update public.networking_bundles b
    set usage_state = 'released', status = 'failed', error_code = 'processing_expired'
    where b.user_id = p_user_id and b.usage_state = 'reserved'
      and b.lease_expires_at < now();

  select * into v_existing from public.networking_bundles b
    where b.user_id = p_user_id and b.idempotency_key = p_key;
  select count(*) filter (where b.usage_state = 'committed')::integer,
         count(*) filter (where b.usage_state = 'reserved')::integer
    into v_used, v_reserved from public.networking_bundles b
    where b.user_id = p_user_id and b.usage_date = (now() at time zone 'utc')::date;

  if v_existing.id is not null then
    if v_existing.request_company_name <> p_company or v_existing.target_role <> p_role
       or coalesce(v_existing.request_company_domain, '') <> coalesce(p_domain, '')
       or v_existing.user_intent <> p_intent then
      raise exception 'idempotency key reused with different input';
    end if;
    return query select (v_existing.usage_state <> 'released'), v_existing.id,
      v_used, v_reserved, case when v_existing.usage_state = 'released' then 'previous_failed'::text else null::text end;
    return;
  end if;
  if v_used + v_reserved >= 15 then
    return query select false, null::uuid, v_used, v_reserved, 'daily_limit'::text;
    return;
  end if;
  insert into public.networking_bundles
    (user_id,idempotency_key,request_company_name,request_company_domain,company_name,company_domain,target_role,user_intent,processing_token)
    values (p_user_id,p_key,p_company,p_domain,p_company,p_domain,p_role,p_intent,p_token)
    returning id into v_id;
  return query select true, v_id, v_used, v_reserved + 1, null::text;
end;
$$;

create function public.finish_networking_bundle(
  p_user_id uuid, p_bundle_id uuid, p_token uuid, p_success boolean, p_partial boolean, p_error text
)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v_bundle public.networking_bundles%rowtype;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  select * into v_bundle from public.networking_bundles b
    where b.id = p_bundle_id and b.user_id = p_user_id for update;
  if v_bundle.id is null or v_bundle.processing_token is distinct from p_token
     or v_bundle.usage_state <> 'reserved' then return false; end if;
  if p_success then
    if v_bundle.lease_expires_at < now() or not exists (
      select 1 from public.networking_contacts c
      where c.bundle_id = p_bundle_id and length(coalesce(c.linkedin_note,'')) > 0
    ) then return false; end if;
    update public.networking_bundles set usage_state='committed',
      status=case when p_partial then 'partial' else 'completed' end,
      error_code=p_error, completed_at=now(), processing_token=null
      where id=p_bundle_id;
  else
    update public.networking_bundles set usage_state='released', status='failed',
      error_code=p_error, processing_token=null where id=p_bundle_id;
  end if;
  return true;
end;
$$;

-- Retry the existing persisted stages. A released attempt must reserve quota
-- again; an already completed bundle remains free to reopen.
create function public.retry_networking_bundle(p_user_id uuid, p_bundle_id uuid, p_token uuid)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  v_bundle public.networking_bundles%rowtype;
  v_count integer;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 0));
  update public.networking_bundles b
    set usage_state='released', status='failed', error_code='processing_expired', processing_token=null
    where b.user_id=p_user_id and b.usage_state='reserved' and b.lease_expires_at <= now();
  select * into v_bundle from public.networking_bundles b
    where b.id=p_bundle_id and b.user_id=p_user_id for update;
  if v_bundle.id is null then return 'not_found'; end if;
  if v_bundle.status in ('completed','partial') and v_bundle.draft_status='completed' then return 'already_complete'; end if;
  if v_bundle.processing_token is not null and v_bundle.lease_expires_at > now() then return 'already_running'; end if;
  if v_bundle.usage_state = 'released' then
    select count(*)::integer into v_count from public.networking_bundles b
      where b.user_id=p_user_id and b.usage_date=(now() at time zone 'utc')::date
        and b.usage_state in ('reserved','committed');
    if v_count >= 15 then return 'daily_limit'; end if;
    update public.networking_bundles set usage_state='reserved',
      usage_date=(now() at time zone 'utc')::date where id=p_bundle_id;
  end if;
  update public.networking_bundles set status='queued', error_code=null,
    processing_token=p_token, lease_expires_at=now()+interval '10 minutes'
    where id=p_bundle_id;
  return 'started';
end;
$$;

revoke all on function public.reserve_networking_bundle(uuid,uuid,text,text,text,text,uuid) from public, anon, authenticated;
revoke all on function public.finish_networking_bundle(uuid,uuid,uuid,boolean,boolean,text) from public, anon, authenticated;
revoke all on function public.retry_networking_bundle(uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.reserve_networking_bundle(uuid,uuid,text,text,text,text,uuid) to service_role;
grant execute on function public.finish_networking_bundle(uuid,uuid,uuid,boolean,boolean,text) to service_role;
grant execute on function public.retry_networking_bundle(uuid,uuid,uuid) to service_role;
