-- Spend already-purchased resume credits after cancel, and serialize
-- refunds on the same per-user advisory lock as generate/reserve.

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

  if v_reservation_id is not null then
    return query select
      true,
      v_reservation_id,
      v_existing_source,
      v_plan_usage,
      p_plan_limit,
      greatest(v_credit_balance, 0),
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
      greatest(v_credit_balance, 0),
      null::text;
    return;
  end if;

  -- Paid packs remain spendable after cancel; buying more still requires Pro.
  if v_credit_balance >= v_cost then
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

    insert into public.resume_credit_ledger (
      user_id,
      resume_generation_id,
      entry_type,
      credits_delta,
      external_reference,
      metadata
    ) values (
      p_user_id,
      v_reservation_id,
      'generation',
      -v_cost,
      'generation:' || p_reservation_token::text,
      pg_catalog.jsonb_build_object('generation_type', p_generation_type)
    );

    return query select
      true,
      v_reservation_id,
      'purchased'::text,
      v_plan_usage,
      p_plan_limit,
      greatest(v_credit_balance - v_cost, 0),
      null::text;
    return;
  end if;

  return query select
    false,
    null::uuid,
    null::text,
    v_plan_usage,
    p_plan_limit,
    greatest(v_credit_balance, 0),
    case when v_can_buy then 'credits_required' else 'upgrade_required' end;
end;
$$;

create or replace function public.apply_resume_credit_refund(
  p_payment_intent_id text,
  p_charge_id text,
  p_amount_refunded_cents integer,
  p_stripe_event_id text
)
returns table (
  handled boolean,
  user_id uuid,
  credits_revoked numeric,
  credit_balance numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_purchase public.resume_credit_purchases%rowtype;
  v_refund_delta integer;
  v_credits_revoked numeric(12, 2);
  v_balance numeric(12, 2);
  v_user_id uuid;
begin
  select p.user_id into v_user_id
  from public.resume_credit_purchases p
  where p.stripe_payment_intent_id = p_payment_intent_id;

  if not found then
    return query select false, null::uuid, 0::numeric, 0::numeric;
    return;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  select * into v_purchase
  from public.resume_credit_purchases p
  where p.stripe_payment_intent_id = p_payment_intent_id
  for update;

  if not found then
    return query select false, null::uuid, 0::numeric, 0::numeric;
    return;
  end if;

  if p_amount_refunded_cents < v_purchase.amount_refunded_cents
     or p_amount_refunded_cents > v_purchase.amount_paid_cents then
    raise exception 'invalid cumulative refund amount';
  end if;

  v_refund_delta := p_amount_refunded_cents - v_purchase.amount_refunded_cents;
  v_credits_revoked := v_refund_delta::numeric / 10;

  if v_refund_delta > 0 then
    insert into public.resume_credit_ledger (
      user_id,
      purchase_id,
      entry_type,
      credits_delta,
      external_reference,
      metadata
    ) values (
      v_purchase.user_id,
      v_purchase.id,
      'refund',
      -v_credits_revoked,
      'refund:' || p_stripe_event_id,
      pg_catalog.jsonb_build_object(
        'charge_id', p_charge_id,
        'refund_delta_cents', v_refund_delta,
        'cumulative_refund_cents', p_amount_refunded_cents
      )
    );

    update public.resume_credit_purchases
    set amount_refunded_cents = p_amount_refunded_cents,
        stripe_charge_id = p_charge_id,
        status = case
          when p_amount_refunded_cents = amount_paid_cents then 'refunded'
          else 'partially_refunded'
        end,
        updated_at = pg_catalog.now()
    where id = v_purchase.id;
  end if;

  select coalesce(sum(l.credits_delta), 0)
  into v_balance
  from public.resume_credit_ledger l
  where l.user_id = v_purchase.user_id;

  return query select
    true,
    v_purchase.user_id,
    v_credits_revoked,
    greatest(v_balance, 0);
end;
$$;
