CREATE TABLE IF NOT EXISTS public.screening_answer_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_hash char(64) NOT NULL CHECK (question_hash ~ '^[a-f0-9]{64}$'),
  normalized_question_text text NOT NULL CHECK (
    char_length(normalized_question_text) BETWEEN 1 AND 2000
  ),
  edited_answer text NOT NULL CHECK (char_length(edited_answer) BETWEEN 1 AND 10000),
  source text NOT NULL CHECK (source IN ('user_edited_ai_draft', 'user_written')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, question_hash)
);

ALTER TABLE public.screening_answer_library ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.screening_answer_library FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_answer_library TO authenticated;
GRANT ALL ON public.screening_answer_library TO service_role;

DROP POLICY IF EXISTS screening_answer_library_select_own ON public.screening_answer_library;
CREATE POLICY screening_answer_library_select_own
  ON public.screening_answer_library FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS screening_answer_library_insert_own ON public.screening_answer_library;
CREATE POLICY screening_answer_library_insert_own
  ON public.screening_answer_library FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS screening_answer_library_update_own ON public.screening_answer_library;
CREATE POLICY screening_answer_library_update_own
  ON public.screening_answer_library FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS screening_answer_library_delete_own ON public.screening_answer_library;
CREATE POLICY screening_answer_library_delete_own
  ON public.screening_answer_library FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE OR REPLACE FUNCTION public.set_screening_answer_library_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS screening_answer_library_updated_at
  ON public.screening_answer_library;
CREATE TRIGGER screening_answer_library_updated_at
  BEFORE UPDATE ON public.screening_answer_library
  FOR EACH ROW EXECUTE FUNCTION public.set_screening_answer_library_updated_at();

CREATE OR REPLACE FUNCTION public.get_ai_generation_limit_state(
  p_user_id uuid,
  p_generation_kind text,
  p_item_hash text,
  p_daily_limit integer DEFAULT 25,
  p_item_regeneration_limit integer DEFAULT 3,
  p_short_window_limit integer DEFAULT 6
)
RETURNS TABLE (
  allowed boolean,
  daily_limit integer,
  daily_remaining integer,
  item_regeneration_limit integer,
  item_regenerations_remaining integer,
  resets_at timestamptz,
  error text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_day date := (now() AT TIME ZONE 'UTC')::date;
  v_reset timestamptz := ((date_trunc('day', now() AT TIME ZONE 'UTC') + interval '1 day') AT TIME ZONE 'UTC');
  v_daily_count integer;
  v_item_count integer;
  v_short_count integer;
  v_regenerations_used integer;
  v_error text := NULL;
BEGIN
  IF p_user_id IS NULL
    OR p_generation_kind NOT IN ('screening_answer', 'cover_letter')
    OR p_item_hash !~ '^[a-f0-9]{64}$'
    OR p_daily_limit < 1
    OR p_item_regeneration_limit < 0
    OR p_short_window_limit < 1 THEN
    RAISE EXCEPTION 'invalid ai generation limit query';
  END IF;

  SELECT count(*)::integer INTO v_daily_count
  FROM public.ai_generation_events
  WHERE user_id = p_user_id AND generation_day = v_day;

  SELECT count(*)::integer INTO v_item_count
  FROM public.ai_generation_events
  WHERE user_id = p_user_id
    AND generation_kind = p_generation_kind
    AND item_hash = p_item_hash
    AND generation_day = v_day;
  v_regenerations_used := greatest(v_item_count - 1, 0);

  SELECT count(*)::integer INTO v_short_count
  FROM public.ai_generation_events
  WHERE user_id = p_user_id AND created_at > now() - interval '1 minute';

  IF v_daily_count >= p_daily_limit THEN
    v_error := 'ai_daily_limit_reached';
  ELSIF v_item_count > 0 AND v_regenerations_used >= p_item_regeneration_limit THEN
    v_error := 'ai_item_regeneration_limit_reached';
  ELSIF v_short_count >= p_short_window_limit THEN
    v_error := 'ai_rate_limited';
  END IF;

  RETURN QUERY SELECT
    v_error IS NULL,
    p_daily_limit,
    greatest(0, p_daily_limit - v_daily_count),
    p_item_regeneration_limit,
    greatest(0, p_item_regeneration_limit - v_regenerations_used),
    v_reset,
    v_error;
END;
$$;

REVOKE ALL ON FUNCTION public.get_ai_generation_limit_state(uuid, text, text, integer, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_ai_generation_limit_state(uuid, text, text, integer, integer, integer)
  TO service_role;
