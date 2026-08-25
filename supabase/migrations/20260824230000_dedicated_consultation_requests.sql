-- Structured, auditable requests for the one-time Dedicated attorney benefit.

CREATE TABLE IF NOT EXISTS public.dedicated_consultation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_status_id uuid REFERENCES public.case_status(id) ON DELETE SET NULL,
  topic text NOT NULL CHECK (topic IN (
    'rfe',
    'denial',
    'premium_processing_delay',
    'opt_stem',
    'employer_change',
    'other'
  )),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 20 AND 2000),
  availability text CHECK (availability IS NULL OR char_length(availability) <= 500),
  status text NOT NULL DEFAULT 'open' CHECK (status IN (
    'open',
    'conflict_check',
    'accepted',
    'scheduled',
    'completed',
    'declined',
    'cancelled'
  )),
  dedicated_started_at timestamptz NOT NULL,
  eligible_at timestamptz NOT NULL,
  scheduled_at timestamptz,
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS dedicated_consultation_requests_status_created_idx
  ON public.dedicated_consultation_requests (status, created_at DESC);

ALTER TABLE public.dedicated_consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dedicated_consultation_requests FORCE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_dedicated_consultation_requests_updated_at
  ON public.dedicated_consultation_requests;
CREATE TRIGGER trg_dedicated_consultation_requests_updated_at
  BEFORE UPDATE ON public.dedicated_consultation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Members can read their own consultation request"
  ON public.dedicated_consultation_requests
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON public.dedicated_consultation_requests FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.dedicated_consultation_requests FROM authenticated;
GRANT SELECT ON public.dedicated_consultation_requests TO authenticated;
GRANT ALL ON public.dedicated_consultation_requests TO service_role;

COMMENT ON TABLE public.dedicated_consultation_requests IS
  'One structured attorney-consultation benefit request per Dedicated account.';
