-- Add plan-aware AI allowances without weakening the existing durable daily
-- and per-item safety caps. Free users receive separate monthly allowances for
-- screening drafts and cover letters. Pro/Dedicated users retain the shared
-- daily cap. Only bounded feature keys and SHA-256 item hashes are stored.

CREATE TABLE IF NOT EXISTS public.ai_generation_monthly_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_start date NOT NULL,
  feature_key text NOT NULL
    CHECK (feature_key IN ('screening_answer', 'cover_letter')),
  used integer NOT NULL DEFAULT 0 CHECK (used >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month_start, feature_key)
);

CREATE INDEX IF NOT EXISTS ai_generation_monthly_usage_month_idx
  ON public.ai_generation_monthly_usage (month_start);

ALTER TABLE public.ai_generation_monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_monthly_usage FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.ai_generation_monthly_usage
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.ai_generation_monthly_usage TO service_role;

CREATE OR REPLACE FUNCTION public.consume_plan_ai_generation_quota(
  p_user_id uuid,
  p_item_key_hash text,
  p_requested_regeneration boolean,
  p_feature_key text,
  p_is_premium boolean,
  p_daily_limit integer DEFAULT 25,
  p_free_monthly_limit integer DEFAULT 5,
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
SET search_path = public, pg_temp
AS $$
DECLARE
  v_usage_date date;
  v_month_start date;
  v_daily_reset timestamptz;
  v_monthly_reset timestamptz;
  v_daily_used integer;
  v_monthly_used integer := 0;
  v_item_total_used integer;
  v_item_regenerations_used integer;
  v_effective_regeneration boolean;
BEGIN
  IF p_user_id IS NULL
    OR p_item_key_hash !~ '^[0-9a-f]{64}$'
    OR p_feature_key NOT IN ('screening_answer', 'cover_letter')
    OR p_is_premium IS NULL
    OR p_daily_limit < 1
    OR p_free_monthly_limit < 1
    OR p_item_regeneration_limit < 0
  THEN
    RAISE EXCEPTION 'Invalid plan AI quota input';
  END IF;

  v_usage_date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
  v_month_start := date_trunc(
    'month',
    clock_timestamp() AT TIME ZONE 'UTC'
  )::date;
  v_daily_reset := ((v_usage_date + 1)::timestamp AT TIME ZONE 'UTC');
  v_monthly_reset := (
    (v_month_start + INTERVAL '1 month')::timestamp AT TIME ZONE 'UTC'
  );

  -- One lock serializes all AI counters for this user. Daily, monthly, and
  -- item updates then commit atomically across concurrent serverless workers.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  INSERT INTO public.ai_generation_daily_usage (user_id, usage_date, used)
  VALUES (p_user_id, v_usage_date, 0)
  ON CONFLICT (user_id, usage_date) DO NOTHING;

  SELECT usage.used
  INTO v_daily_used
  FROM public.ai_generation_daily_usage AS usage
  WHERE usage.user_id = p_user_id
    AND usage.usage_date = v_usage_date
  FOR UPDATE;

  INSERT INTO public.ai_generation_item_usage (
    user_id,
    usage_date,
    item_key_hash,
    total_used,
    regenerations_used
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

  IF NOT p_is_premium THEN
    INSERT INTO public.ai_generation_monthly_usage (
      user_id,
      month_start,
      feature_key,
      used
    )
    VALUES (p_user_id, v_month_start, p_feature_key, 0)
    ON CONFLICT (user_id, month_start, feature_key) DO NOTHING;

    SELECT monthly.used
    INTO v_monthly_used
    FROM public.ai_generation_monthly_usage AS monthly
    WHERE monthly.user_id = p_user_id
      AND monthly.month_start = v_month_start
      AND monthly.feature_key = p_feature_key
    FOR UPDATE;
  END IF;

  -- Durable item history, rather than a caller hint, decides regeneration.
  v_effective_regeneration := v_item_total_used > 0;

  IF p_is_premium AND v_daily_used >= p_daily_limit THEN
    RETURN QUERY SELECT
      false,
      'day'::text,
      p_daily_limit,
      0,
      p_daily_limit,
      0,
      p_item_regeneration_limit,
      GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
      v_daily_reset,
      'ai_daily_limit_reached'::text;
    RETURN;
  END IF;

  IF NOT p_is_premium AND v_monthly_used >= p_free_monthly_limit THEN
    RETURN QUERY SELECT
      false,
      'month'::text,
      p_free_monthly_limit,
      0,
      p_daily_limit,
      GREATEST(0, p_daily_limit - v_daily_used),
      p_item_regeneration_limit,
      GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
      v_monthly_reset,
      'ai_monthly_limit_reached'::text;
    RETURN;
  END IF;

  IF v_effective_regeneration
    AND v_item_regenerations_used >= p_item_regeneration_limit
  THEN
    RETURN QUERY SELECT
      false,
      CASE WHEN p_is_premium THEN 'day' ELSE 'month' END,
      CASE
        WHEN p_is_premium THEN p_daily_limit
        ELSE p_free_monthly_limit
      END,
      CASE
        WHEN p_is_premium
          THEN GREATEST(0, p_daily_limit - v_daily_used)
        ELSE GREATEST(0, p_free_monthly_limit - v_monthly_used)
      END,
      p_daily_limit,
      GREATEST(0, p_daily_limit - v_daily_used),
      p_item_regeneration_limit,
      0,
      CASE WHEN p_is_premium THEN v_daily_reset ELSE v_monthly_reset END,
      'ai_item_regeneration_limit_reached'::text;
    RETURN;
  END IF;

  UPDATE public.ai_generation_daily_usage AS usage
  SET used = usage.used + 1,
      updated_at = now()
  WHERE usage.user_id = p_user_id
    AND usage.usage_date = v_usage_date
  RETURNING usage.used INTO v_daily_used;

  IF NOT p_is_premium THEN
    UPDATE public.ai_generation_monthly_usage AS monthly
    SET used = monthly.used + 1,
        updated_at = now()
    WHERE monthly.user_id = p_user_id
      AND monthly.month_start = v_month_start
      AND monthly.feature_key = p_feature_key
    RETURNING monthly.used INTO v_monthly_used;
  END IF;

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
    true,
    CASE WHEN p_is_premium THEN 'day' ELSE 'month' END,
    CASE
      WHEN p_is_premium THEN p_daily_limit
      ELSE p_free_monthly_limit
    END,
    CASE
      WHEN p_is_premium
        THEN GREATEST(0, p_daily_limit - v_daily_used)
      ELSE GREATEST(0, p_free_monthly_limit - v_monthly_used)
    END,
    p_daily_limit,
    GREATEST(0, p_daily_limit - v_daily_used),
    p_item_regeneration_limit,
    GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
    CASE WHEN p_is_premium THEN v_daily_reset ELSE v_monthly_reset END,
    NULL::text;
END;
$$;

COMMENT ON FUNCTION public.consume_plan_ai_generation_quota(
  uuid,
  text,
  boolean,
  text,
  boolean,
  integer,
  integer,
  integer
) IS
  'Atomically consumes monthly Free or daily premium AI quota plus the per-item regeneration cap.';

REVOKE ALL ON FUNCTION public.consume_plan_ai_generation_quota(
  uuid,
  text,
  boolean,
  text,
  boolean,
  integer,
  integer,
  integer
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.consume_plan_ai_generation_quota(
  uuid,
  text,
  boolean,
  text,
  boolean,
  integer,
  integer,
  integer
) TO service_role;
