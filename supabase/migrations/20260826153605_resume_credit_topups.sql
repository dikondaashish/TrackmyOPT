-- Paid resume-credit top-ups.
--
-- Commercial rule: one $1 pack grants 10 credits. New generations cost 1
-- credit and regenerations cost 0.5 credit. Included monthly plan usage is
-- always consumed before purchased credits.

alter table public.resume_generations
  add column if not exists credit_cost numeric(10, 2);

update public.resume_generations
set credit_cost = case when generation_type = 'regenerate' then 0.5 else 1 end
where credit_cost is null;

alter table public.resume_generations
  alter column credit_cost set default 1,
  alter column credit_cost set not null;

alter table public.resume_generations
  add column if not exists reservation_token uuid,
  add column if not exists funding_source text not null default 'plan';

alter table public.resume_generations
  drop constraint if exists resume_generations_generation_type_check;
alter table public.resume_generations
  add constraint resume_generations_generation_type_check
  check (generation_type in ('generate', 'regenerate', 'ats_scan'));

create unique index if not exists resume_generations_reservation_token_idx
  on public.resume_generations (reservation_token)
  where reservation_token is not null;

create index if not exists resume_generations_monthly_plan_usage_idx
  on public.resume_generations (user_id, created_at)
  where funding_source = 'plan'
    and generation_type in ('generate', 'regenerate');

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'resume_generations_credit_cost_check'
      and conrelid = 'public.resume_generations'::regclass
  ) then
    alter table public.resume_generations
      add constraint resume_generations_credit_cost_check
      check (credit_cost in (0.5, 1));
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'resume_generations_funding_source_check'
      and conrelid = 'public.resume_generations'::regclass
  ) then
    alter table public.resume_generations
      add constraint resume_generations_funding_source_check
      check (funding_source in ('plan', 'purchased'));
  end if;
end
$$;

create table if not exists public.resume_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text not null unique,
  stripe_customer_id text,
  stripe_charge_id text,
  pack_quantity integer not null check (pack_quantity between 1 and 100),
  amount_paid_cents integer not null check (amount_paid_cents > 0),
  amount_refunded_cents integer not null default 0 check (amount_refunded_cents >= 0),
  credits_granted numeric(12, 2) not null check (credits_granted > 0),
  status text not null default 'succeeded'
    check (status in ('succeeded', 'partially_refunded', 'refunded')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (amount_refunded_cents <= amount_paid_cents)
);

create table if not exists public.resume_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purchase_id uuid references public.resume_credit_purchases(id) on delete restrict,
  resume_generation_id uuid references public.resume_generations(id) on delete cascade,
  entry_type text not null
    check (entry_type in ('purchase', 'generation', 'refund', 'adjustment')),
  credits_delta numeric(12, 2) not null check (credits_delta <> 0),
  external_reference text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resume_credit_purchases_user_created_idx
  on public.resume_credit_purchases (user_id, created_at desc);

create index if not exists resume_credit_ledger_user_created_idx
  on public.resume_credit_ledger (user_id, created_at desc);

alter table public.resume_credit_purchases enable row level security;
alter table public.resume_credit_ledger enable row level security;

revoke all on table public.resume_credit_purchases from anon, authenticated;
revoke all on table public.resume_credit_ledger from anon, authenticated;
grant all on table public.resume_credit_purchases to service_role;
grant all on table public.resume_credit_ledger to service_role;

-- Generation accounting is now server-managed. Users may read their history,
-- but cannot manufacture or erase usage rows through the Data API.
drop policy if exists "Users can insert their own resume generations"
  on public.resume_generations;
drop policy if exists "Users can view their own resume generations"
  on public.resume_generations;
revoke insert, update, delete on table public.resume_generations from authenticated;
grant select on table public.resume_generations to authenticated;
create policy "Users can view their own resume generations"
  on public.resume_generations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

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
  v_can_use_purchased boolean;
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
  ) into v_can_use_purchased;

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

  if v_can_use_purchased and v_credit_balance >= v_cost then
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
    case when v_can_use_purchased then 'credits_required' else 'upgrade_required' end;
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

  delete from public.resume_generations
  where id = p_reservation_id
    and user_id = p_user_id
  returning id into v_deleted;

  return v_deleted is not null;
end;
$$;

create or replace function public.grant_resume_credit_purchase(
  p_user_id uuid,
  p_checkout_session_id text,
  p_payment_intent_id text,
  p_customer_id text,
  p_pack_quantity integer,
  p_amount_paid_cents integer,
  p_credits_granted numeric,
  p_metadata jsonb
)
returns table (
  already_granted boolean,
  purchase_id uuid,
  credit_balance numeric
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_purchase_id uuid;
  v_purchase_user_id uuid;
  v_balance numeric(12, 2);
begin
  if p_pack_quantity < 1 or p_pack_quantity > 100 then
    raise exception 'invalid pack quantity';
  end if;
  if p_amount_paid_cents <> p_pack_quantity * 100 then
    raise exception 'credit purchase amount does not match pack quantity';
  end if;
  if p_credits_granted <> p_pack_quantity * 10 then
    raise exception 'credit grant does not match pack quantity';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 0)
  );

  select p.id, p.user_id into v_purchase_id, v_purchase_user_id
  from public.resume_credit_purchases p
  where p.stripe_checkout_session_id = p_checkout_session_id;

  if v_purchase_id is not null then
    if v_purchase_user_id <> p_user_id then
      raise exception 'checkout session belongs to another user';
    end if;

    select coalesce(sum(l.credits_delta), 0)
    into v_balance
    from public.resume_credit_ledger l
    where l.user_id = p_user_id;

    return query select true, v_purchase_id, greatest(v_balance, 0);
    return;
  end if;

  insert into public.resume_credit_purchases (
    user_id,
    stripe_checkout_session_id,
    stripe_payment_intent_id,
    stripe_customer_id,
    pack_quantity,
    amount_paid_cents,
    credits_granted,
    metadata
  ) values (
    p_user_id,
    p_checkout_session_id,
    p_payment_intent_id,
    p_customer_id,
    p_pack_quantity,
    p_amount_paid_cents,
    p_credits_granted,
    coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_purchase_id;

  insert into public.resume_credit_ledger (
    user_id,
    purchase_id,
    entry_type,
    credits_delta,
    external_reference,
    metadata
  ) values (
    p_user_id,
    v_purchase_id,
    'purchase',
    p_credits_granted,
    'purchase:' || p_checkout_session_id,
    pg_catalog.jsonb_build_object(
      'amount_paid_cents', p_amount_paid_cents,
      'pack_quantity', p_pack_quantity
    )
  );

  select coalesce(sum(l.credits_delta), 0)
  into v_balance
  from public.resume_credit_ledger l
  where l.user_id = p_user_id;

  return query select false, v_purchase_id, greatest(v_balance, 0);
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
begin
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

revoke execute on function public.reserve_resume_generation(uuid, text, numeric, uuid)
  from public, anon, authenticated;
revoke execute on function public.release_resume_generation_reservation(uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.grant_resume_credit_purchase(uuid, text, text, text, integer, integer, numeric, jsonb)
  from public, anon, authenticated;
revoke execute on function public.apply_resume_credit_refund(text, text, integer, text)
  from public, anon, authenticated;

grant execute on function public.reserve_resume_generation(uuid, text, numeric, uuid)
  to service_role;
grant execute on function public.release_resume_generation_reservation(uuid, uuid)
  to service_role;
grant execute on function public.grant_resume_credit_purchase(uuid, text, text, text, integer, integer, numeric, jsonb)
  to service_role;
grant execute on function public.apply_resume_credit_refund(text, text, integer, text)
  to service_role;
