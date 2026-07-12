-- Extension autofill/plugin feedback (the in-popup "Feedback" form).
-- Written via the service-role key from /api/extension/feedback; RLS enabled
-- with no policies so only service_role can read/write.

CREATE TABLE IF NOT EXISTS public.extension_feedback (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating       smallint CHECK (rating >= 0 AND rating <= 10),
  aspects      jsonb NOT NULL DEFAULT '[]'::jsonb,
  comment      text NOT NULL DEFAULT '',
  version      text,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.extension_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS extension_feedback_created_at_idx
  ON public.extension_feedback (created_at DESC);

GRANT ALL ON public.extension_feedback TO service_role;
