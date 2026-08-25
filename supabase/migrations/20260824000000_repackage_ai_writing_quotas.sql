-- Repackage AI writing allowances for the August 2026 plans.
-- Free keeps separate monthly screening/cover-letter allowances. Pro and
-- Dedicated share one 100-action monthly pool, while the existing 25/day and
-- three-regenerations-per-item guards continue to limit abuse.

ALTER TABLE public.ai_generation_monthly_usage
  DROP CONSTRAINT IF EXISTS ai_generation_monthly_usage_feature_key_check;

ALTER TABLE public.ai_generation_monthly_usage
  ADD CONSTRAINT ai_generation_monthly_usage_feature_key_check
  CHECK (feature_key IN ('screening_answer', 'cover_letter', 'paid_combined'));

CREATE OR REPLACE FUNCTION public.consume_plan_ai_generation_quota_v2(
  p_user_id uuid,
  p_item_key_hash text,
  p_requested_regeneration boolean,
  p_feature_key text,
  p_plan_tier text,
  p_daily_limit integer DEFAULT 25,
  p_paid_monthly_limit integer DEFAULT 100,
  p_free_monthly_limit integer DEFAULT 2,
  p_item_regeneration_limit integer DEFAULT 3
)
RETURNS TABLE (
  allowed boolean,
  quota_period text,
  quota_limit integer,
  quota_remaining integer,
  daily_limit integer,
  daily_remaining integer,
  item_regeneration_limit integer,
  item_regenerations_remaining integer,
  resets_at timestamptz,
  error_code text
)
LANGUAGE plpgsql
SECURITY DEFINER
-- Required because this RPC is exposed through PostgREST but callable only by
-- the server-side service role. Every relation below is schema-qualified.
SET search_path = ''
AS $$
DECLARE
  v_is_paid boolean;
  v_usage_date date;
  v_month_start date;
  v_daily_reset timestamptz;
  v_monthly_reset timestamptz;
  v_monthly_key text;
  v_monthly_limit integer;
  v_daily_used integer;
  v_monthly_used integer;
  v_item_total_used integer;
  v_item_regenerations_used integer;
  v_effective_regeneration boolean;
BEGIN
  v_is_paid := lower(coalesce(p_plan_tier, 'free')) IN ('pro', 'dedicated');

  IF p_user_id IS NULL
    OR p_item_key_hash !~ '^[0-9a-f]{64}$'
    OR p_feature_key NOT IN ('screening_answer', 'cover_letter')
    OR lower(coalesce(p_plan_tier, 'free')) NOT IN ('free', 'pro', 'dedicated')
    OR p_daily_limit < 1
    OR p_paid_monthly_limit < 1
    OR p_free_monthly_limit < 1
    OR p_item_regeneration_limit < 0
  THEN
    RAISE EXCEPTION 'Invalid plan AI quota input';
  END IF;

  v_usage_date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
  v_month_start := date_trunc('month', clock_timestamp() AT TIME ZONE 'UTC')::date;
  v_daily_reset := ((v_usage_date + 1)::timestamp AT TIME ZONE 'UTC');
  v_monthly_reset := ((v_month_start + INTERVAL '1 month')::timestamp AT TIME ZONE 'UTC');
  v_monthly_key := CASE WHEN v_is_paid THEN 'paid_combined' ELSE p_feature_key END;
  v_monthly_limit := CASE WHEN v_is_paid THEN p_paid_monthly_limit ELSE p_free_monthly_limit END;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  INSERT INTO public.ai_generation_daily_usage (user_id, usage_date, used)
  VALUES (p_user_id, v_usage_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT usage.used INTO v_daily_used
  FROM public.ai_generation_daily_usage AS usage
  WHERE usage.user_id = p_user_id AND usage.usage_date = v_usage_date
  FOR UPDATE;

  INSERT INTO public.ai_generation_monthly_usage (user_id, month_start, feature_key, used)
  VALUES (p_user_id, v_month_start, v_monthly_key, 0)
  ON CONFLICT (user_id, month_start, feature_key) DO NOTHING;

  SELECT monthly.used INTO v_monthly_used
  FROM public.ai_generation_monthly_usage AS monthly
  WHERE monthly.user_id = p_user_id
    AND monthly.month_start = v_month_start
    AND monthly.feature_key = v_monthly_key
  FOR UPDATE;

  INSERT INTO public.ai_generation_item_usage (
    user_id, usage_date, item_key_hash, total_used, regenerations_used
  )
  VALUES (p_user_id, v_usage_date, p_item_key_hash, 0, 0)
  ON CONFLICT (user_id, usage_date, item_key_hash) DO NOTHING;

  SELECT item.total_used, item.regenerations_used
  INTO v_item_total_used, v_item_regenerations_used
  FROM public.ai_generation_item_usage AS item
  WHERE item.user_id = p_user_id
    AND item.usage_date = v_usage_date
    AND item.item_key_hash = p_item_key_hash
  FOR UPDATE;

  v_effective_regeneration := v_item_total_used > 0;

  IF v_daily_used >= p_daily_limit THEN
    RETURN QUERY SELECT
      false, 'day'::text, p_daily_limit, 0,
      p_daily_limit, 0,
      p_item_regeneration_limit,
      GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
      v_daily_reset, 'ai_daily_limit_reached'::text;
    RETURN;
  END IF;

  IF v_monthly_used >= v_monthly_limit THEN
    RETURN QUERY SELECT
      false, 'month'::text, v_monthly_limit, 0,
      p_daily_limit, GREATEST(0, p_daily_limit - v_daily_used),
      p_item_regeneration_limit,
      GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
      v_monthly_reset, 'ai_monthly_limit_reached'::text;
    RETURN;
  END IF;

  IF v_effective_regeneration
    AND v_item_regenerations_used >= p_item_regeneration_limit
  THEN
    RETURN QUERY SELECT
      false, 'month'::text, v_monthly_limit,
      GREATEST(0, v_monthly_limit - v_monthly_used),
      p_daily_limit, GREATEST(0, p_daily_limit - v_daily_used),
      p_item_regeneration_limit, 0,
      v_monthly_reset, 'ai_item_regeneration_limit_reached'::text;
    RETURN;
  END IF;

  UPDATE public.ai_generation_daily_usage AS usage
  SET used = usage.used + 1, updated_at = now()
  WHERE usage.user_id = p_user_id AND usage.usage_date = v_usage_date
  RETURNING usage.used INTO v_daily_used;

  UPDATE public.ai_generation_monthly_usage AS monthly
  SET used = monthly.used + 1, updated_at = now()
  WHERE monthly.user_id = p_user_id
    AND monthly.month_start = v_month_start
    AND monthly.feature_key = v_monthly_key
  RETURNING monthly.used INTO v_monthly_used;

  UPDATE public.ai_generation_item_usage AS item
  SET total_used = item.total_used + 1,
      regenerations_used = item.regenerations_used
        + CASE WHEN v_effective_regeneration THEN 1 ELSE 0 END,
      updated_at = now()
  WHERE item.user_id = p_user_id
    AND item.usage_date = v_usage_date
    AND item.item_key_hash = p_item_key_hash
  RETURNING item.total_used, item.regenerations_used
  INTO v_item_total_used, v_item_regenerations_used;

  RETURN QUERY SELECT
    true, 'month'::text, v_monthly_limit,
    GREATEST(0, v_monthly_limit - v_monthly_used),
    p_daily_limit, GREATEST(0, p_daily_limit - v_daily_used),
    p_item_regeneration_limit,
    GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
    v_monthly_reset, NULL::text;
END;
$$;

COMMENT ON FUNCTION public.consume_plan_ai_generation_quota_v2(
  uuid, text, boolean, text, text, integer, integer, integer, integer
) IS
  'Atomically consumes Free feature-specific or paid shared monthly AI writing quota, plus daily and per-item safety caps.';

REVOKE ALL ON FUNCTION public.consume_plan_ai_generation_quota_v2(
  uuid, text, boolean, text, text, integer, integer, integer, integer
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_plan_ai_generation_quota_v2(
  uuid, text, boolean, text, text, integer, integer, integer, integer
) TO service_role;
