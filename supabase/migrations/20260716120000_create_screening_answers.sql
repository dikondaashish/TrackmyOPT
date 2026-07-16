-- User-owned library of reviewed job-application screening answers.
-- Question and answer text is deliberately isolated from analytics tables.

CREATE TABLE IF NOT EXISTS public.screening_answers (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_hash            text NOT NULL,
  normalized_question_text text NOT NULL,
  edited_answer            text NOT NULL,
  source                   text NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT screening_answers_question_hash_format
    CHECK (question_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT screening_answers_question_length
    CHECK (char_length(normalized_question_text) BETWEEN 1 AND 2000),
  CONSTRAINT screening_answers_answer_length
    CHECK (char_length(edited_answer) BETWEEN 1 AND 8000),
  CONSTRAINT screening_answers_source_values
    CHECK (source IN ('user_edited_ai_draft', 'user_written')),
  CONSTRAINT screening_answers_user_question_unique
    UNIQUE (user_id, question_hash)
);

COMMENT ON TABLE public.screening_answers IS
  'User-reviewed screening answers. Exact normalized-question matching only; never analytics data.';

ALTER TABLE public.screening_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screening_answers FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users read their own screening answers"
    ON public.screening_answers FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users insert their own screening answers"
    ON public.screening_answers FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users update their own screening answers"
    ON public.screening_answers FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Users delete their own screening answers"
    ON public.screening_answers FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DROP TRIGGER IF EXISTS trg_screening_answers_updated_at ON public.screening_answers;
CREATE TRIGGER trg_screening_answers_updated_at
  BEFORE UPDATE ON public.screening_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.screening_answers TO authenticated;
GRANT ALL ON public.screening_answers TO service_role;

