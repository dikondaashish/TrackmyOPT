-- A completed bundle must have persisted writing, and cannot be retried as a
-- new paid attempt even if an older row has an inconsistent draft status.
create or replace function public.finish_networking_bundle(
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
    if v_bundle.lease_expires_at < now() or v_bundle.draft_status <> 'completed' or not exists (
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

create or replace function public.retry_networking_bundle(p_user_id uuid, p_bundle_id uuid, p_token uuid)
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
  if v_bundle.status in ('completed','partial') then return 'already_complete'; end if;
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
