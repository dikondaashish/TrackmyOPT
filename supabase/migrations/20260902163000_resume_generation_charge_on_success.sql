-- Charge purchased resume credits only after a successful generation.
-- Failed runs release the reservation without spending purchased credits.

create or replace function public.reserve_resume_generation(
  p_user_id uuid,
  p_generation_type text,
  p_plan_limit numeric,
  p_reservation_token uuid
)
returns table (
  allowed boolean,
  reservation_id uuid,
  funding_source text,
  plan_usage numeric,
  plan_limit numeric,
  credit_balance numeric,
  denial_reason text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cost numeric(10, 2);
  v_plan_usage numeric(12, 2);
  v_credit_balance numeric(12, 2);
  v_pending_purchased numeric(12, 2);
  v_available_credits numeric(12, 2);
  v_reservation_id uuid;
  v_existing_source text;
  v_can_buy boolean;
begin
  if p_generation_type not in ('generate', 'regenerate') then
    raise exception 'invalid generation type';
  end if;
  if p_plan_limit < 0 then
    raise exception 'invalid plan limit';
  end if;

  v_cost := case when p_generation_type = 'regenerate' then 0.5 else 1 end;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select rg.id, rg.funding_source
  into v_reservation_id, v_existing_source
  from public.resume_generations rg
  where rg.user_id = p_user_id
    and rg.reservation_token = p_reservation_token;

  select coalesce(sum(rg.credit_cost), 0)
  into v_plan_usage
  from public.resume_generations rg
  where rg.user_id = p_user_id
    and rg.funding_source = 'plan'
    and rg.generation_type in ('generate', 'regenerate')
    and rg.created_at >= pg_catalog.date_trunc('month', pg_catalog.now());

  select coalesce(sum(l.credits_delta), 0)
  into v_credit_balance
  from public.resume_credit_ledger l
  where l.user_id = p_user_id;

  select coalesce(sum(rg.credit_cost), 0)
  into v_pending_purchased
  from public.resume_generations rg
  where rg.user_id = p_user_id
    and rg.funding_source = 'purchased'
    and not exists (
      select 1
      from public.resume_credit_ledger l
      where l.resume_generation_id = rg.id
        and l.entry_type = 'generation'
    );

  v_available_credits := greatest(v_credit_balance - v_pending_purchased, 0);

  if v_reservation_id is not null then
    return query select
      true,
      v_reservation_id,
      v_existing_source,
      v_plan_usage,
      p_plan_limit,
      v_available_credits,
      null::text;
    return;
  end if;

  select exists (
    select 1
    from public.profiles p
    where p.user_id = p_user_id
      and p.premium_status is true
      and lower(coalesce(p.plan_tier, '')) in ('pro', 'dedicated')
      and (p.subscription_expires_at is null or p.subscription_expires_at > pg_catalog.now())
  ) into v_can_buy;

  if v_plan_usage + v_cost <= p_plan_limit then
    insert into public.resume_generations (
      user_id,
      generation_type,
      credit_cost,
      reservation_token,
      funding_source
    ) values (
      p_user_id,
      p_generation_type,
      v_cost,
      p_reservation_token,
      'plan'
    ) returning id into v_reservation_id;

    return query select
      true,
      v_reservation_id,
      'plan'::text,
      v_plan_usage + v_cost,
      p_plan_limit,
      v_available_credits,
      null::text;
    return;
  end if;

  if v_available_credits >= v_cost then
    insert into public.resume_generations (
      user_id,
      generation_type,
      credit_cost,
      reservation_token,
      funding_source
    ) values (
      p_user_id,
      p_generation_type,
      v_cost,
      p_reservation_token,
      'purchased'
    ) returning id into v_reservation_id;

    return query select
      true,
      v_reservation_id,
      'purchased'::text,
      v_plan_usage,
      p_plan_limit,
      greatest(v_available_credits - v_cost, 0),
      null::text;
    return;
  end if;

  return query select
    false,
    null::uuid,
    null::text,
    v_plan_usage,
    p_plan_limit,
    v_available_credits,
    case when v_can_buy then 'credits_required' else 'upgrade_required' end;
end;
$$;

create or replace function public.commit_resume_generation(
  p_user_id uuid,
  p_reservation_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_generation record;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select
    rg.id,
    rg.funding_source,
    rg.credit_cost,
    rg.reservation_token,
    rg.generation_type
  into v_generation
  from public.resume_generations rg
  where rg.id = p_reservation_id
    and rg.user_id = p_user_id
  for update;

  if not found then
    return false;
  end if;

  if v_generation.funding_source = 'purchased' then
    insert into public.resume_credit_ledger (
      user_id,
      resume_generation_id,
      entry_type,
      credits_delta,
      external_reference,
      metadata
    ) values (
      p_user_id,
      v_generation.id,
      'generation',
      -v_generation.credit_cost,
      'generation:' || v_generation.reservation_token::text,
      pg_catalog.jsonb_build_object(
        'generation_type', v_generation.generation_type,
        'committed', true
      )
    )
    on conflict (external_reference) do nothing;
  end if;

  return true;
end;
$$;

create or replace function public.release_resume_generation_reservation(
  p_user_id uuid,
  p_reservation_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_deleted uuid;
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  -- Legacy rows may already have a generation ledger debit from reserve-time
  -- charging. Remove it explicitly so purchased credits are always restored.
  delete from public.resume_credit_ledger
  where resume_generation_id = p_reservation_id
    and entry_type = 'generation';

  delete from public.resume_generations
  where id = p_reservation_id
    and user_id = p_user_id
  returning id into v_deleted;

  return v_deleted is not null;
end;
$$;

revoke execute on function public.commit_resume_generation(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.commit_resume_generation(uuid, uuid)
  to service_role;
