-- Record an ATS scan only after the model response has passed server-side
-- validation. The advisory lock prevents concurrent scans from exceeding a
-- user's monthly entitlement between counting rows and inserting the usage row.
create index if not exists resume_generations_monthly_ats_usage_idx
  on public.resume_generations (user_id, created_at)
  where generation_type = 'ats_scan';

create or replace function public.reserve_ats_scan(
  p_user_id uuid,
  p_plan_limit integer
)
returns table (
  allowed boolean,
  usage integer,
  plan_limit integer
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_usage integer;
begin
  if p_plan_limit < 0 or p_plan_limit > 10000 then
    raise exception 'invalid ATS scan limit';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select count(*)::integer
  into v_usage
  from public.resume_generations as rg
  where rg.user_id = p_user_id
    and rg.generation_type = 'ats_scan'
    and rg.created_at >= pg_catalog.date_trunc('month', pg_catalog.now());

  if v_usage >= p_plan_limit then
    return query select false, v_usage, p_plan_limit;
    return;
  end if;

  insert into public.resume_generations (
    user_id,
    generation_type,
    credit_cost,
    funding_source
  ) values (
    p_user_id,
    'ats_scan',
    1,
    'plan'
  );

  return query select true, v_usage + 1, p_plan_limit;
end;
$$;

revoke all on function public.reserve_ats_scan(uuid, integer)
  from public, anon, authenticated;
grant execute on function public.reserve_ats_scan(uuid, integer) to service_role;
