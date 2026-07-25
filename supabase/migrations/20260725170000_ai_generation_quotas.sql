-- Durable, atomic quota accounting shared by screening-answer and cover-letter
-- generation. Raw question/job text is never stored; callers send a SHA-256
-- item key.

CREATE TABLE IF NOT EXISTS public.ai_generation_daily_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  used integer NOT NULL DEFAULT 0 CHECK (used >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date)
);

CREATE TABLE IF NOT EXISTS public.ai_generation_item_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date date NOT NULL,
  item_key_hash text NOT NULL,
  total_used integer NOT NULL DEFAULT 0 CHECK (total_used >= 0),
  regenerations_used integer NOT NULL DEFAULT 0
    CHECK (regenerations_used >= 0 AND regenerations_used <= total_used),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, usage_date, item_key_hash),
  CONSTRAINT ai_generation_item_usage_hash_format
    CHECK (item_key_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS ai_generation_daily_usage_date_idx
  ON public.ai_generation_daily_usage (usage_date);
CREATE INDEX IF NOT EXISTS ai_generation_item_usage_date_idx
  ON public.ai_generation_item_usage (usage_date);

ALTER TABLE public.ai_generation_daily_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_daily_usage FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_item_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_item_usage FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.ai_generation_daily_usage FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.ai_generation_item_usage FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.ai_generation_daily_usage TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.ai_generation_item_usage TO service_role;

CREATE OR REPLACE FUNCTION public.consume_ai_generation_quota(
  p_user_id uuid,
  p_item_key_hash text,
  p_requested_regeneration boolean DEFAULT false,
  p_daily_limit integer DEFAULT 25,
  p_item_regeneration_limit integer DEFAULT 3
)
RETURNS TABLE (
  allowed boolean,
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
  v_resets_at timestamptz;
  v_daily_used integer;
  v_item_total_used integer;
  v_item_regenerations_used integer;
  v_effective_regeneration boolean;
BEGIN
  IF p_user_id IS NULL
    OR p_item_key_hash !~ '^[0-9a-f]{64}$'
    OR p_daily_limit < 1
    OR p_item_regeneration_limit < 0
  THEN
    RAISE EXCEPTION 'Invalid AI quota input';
  END IF;

  v_usage_date := (clock_timestamp() AT TIME ZONE 'UTC')::date;
  v_resets_at := ((v_usage_date + 1)::timestamp AT TIME ZONE 'UTC');

  -- Serialize both counters for one user/day. The two table updates then commit
  -- atomically even when separate Vercel instances call this function at once.
  PERFORM pg_advisory_xact_lock(
    hashtextextended(p_user_id::text || ':' || v_usage_date::text, 0)
  );

  INSERT INTO public.ai_generation_daily_usage (
    user_id,
    usage_date,
    used
  )
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

  -- Item history is authoritative. The caller hint is accepted for backwards
  -- compatibility but cannot turn a repeat request into another "first" call.
  v_effective_regeneration := v_item_total_used > 0;

  IF v_daily_used >= p_daily_limit THEN
    RETURN QUERY SELECT
      false,
      p_daily_limit,
      0,
      p_item_regeneration_limit,
      GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
      v_resets_at,
      'ai_daily_limit_reached'::text;
    RETURN;
  END IF;

  IF v_effective_regeneration
    AND v_item_regenerations_used >= p_item_regeneration_limit
  THEN
    RETURN QUERY SELECT
      false,
      p_daily_limit,
      GREATEST(0, p_daily_limit - v_daily_used),
      p_item_regeneration_limit,
      0,
      v_resets_at,
      'ai_item_regeneration_limit_reached'::text;
    RETURN;
  END IF;

  UPDATE public.ai_generation_daily_usage AS usage
  SET used = usage.used + 1,
      updated_at = now()
  WHERE usage.user_id = p_user_id
    AND usage.usage_date = v_usage_date
  RETURNING usage.used INTO v_daily_used;

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
    p_daily_limit,
    GREATEST(0, p_daily_limit - v_daily_used),
    p_item_regeneration_limit,
    GREATEST(0, p_item_regeneration_limit - v_item_regenerations_used),
    v_resets_at,
    NULL::text;
END;
$$;

COMMENT ON FUNCTION public.consume_ai_generation_quota(
  uuid,
  text,
  boolean,
  integer,
  integer
) IS
  'Atomically consumes shared AI daily/item quota. The server derives regeneration state from durable item history.';

REVOKE ALL ON FUNCTION public.consume_ai_generation_quota(
  uuid,
  text,
  boolean,
  integer,
  integer
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_generation_quota(
  uuid,
  text,
  boolean,
  integer,
  integer
) TO service_role;
