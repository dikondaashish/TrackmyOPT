-- Step 3: sponsorship language is evidence-backed. The former flat job-level
-- tag is removed so no display can claim a result without a dated signal.
ALTER TABLE public.jobs DROP COLUMN sponsorship_tag;

CREATE TABLE public.job_visa_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.jobs (id) ON DELETE CASCADE,
  signal_type text NOT NULL CHECK (signal_type IN (
    'no_sponsorship_stated',
    'future_sponsorship_stated',
    'opt_accepted_stated',
    'historical_h1b_sponsor',
    'everify_verified',
    'manual_review'
  )),
  evidence_snippet text NOT NULL CHECK (length(trim(evidence_snippet)) > 0),
  source_url text NOT NULL CHECK (source_url ~* '^https://'),
  observed_date date NOT NULL,
  confidence numeric(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  source text NOT NULL CHECK (source IN (
    'employer_posting', 'sponsor_history_db', 'everify_result', 'manual_review'
  )),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_visa_signals_job_type_source_url_key
    UNIQUE (job_id, signal_type, source, source_url)
);

CREATE INDEX job_visa_signals_job_id_idx ON public.job_visa_signals (job_id);
CREATE INDEX job_visa_signals_type_idx ON public.job_visa_signals (signal_type, observed_date DESC);

ALTER TABLE public.job_visa_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read verified job visa signals"
  ON public.job_visa_signals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = job_visa_signals.job_id
        AND jobs.source_trust_tier = 'verified_ats'
    )
  );

GRANT SELECT ON public.job_visa_signals TO authenticated;

CREATE TRIGGER job_visa_signals_set_updated_at
  BEFORE UPDATE ON public.job_visa_signals
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

-- UI consumers must read this derived view instead of a mutable job column.
-- The values describe evidence type, never a guarantee that a role will sponsor.
CREATE VIEW public.job_sponsorship_summary
WITH (security_invoker = on)
AS
SELECT
  job.id AS job_id,
  CASE
    WHEN bool_or(signal.signal_type = 'no_sponsorship_stated') THEN 'no_sponsorship_stated'
    WHEN bool_or(signal.signal_type = 'future_sponsorship_stated') THEN 'future_sponsorship_stated'
    WHEN bool_or(signal.signal_type = 'historical_h1b_sponsor') THEN 'historical_h1b_sponsor'
    ELSE 'unknown'
  END AS sponsorship_tag,
  count(signal.id)::integer AS evidence_count,
  max(signal.observed_date) AS latest_evidence_date
FROM public.jobs AS job
LEFT JOIN public.job_visa_signals AS signal ON signal.job_id = job.id
GROUP BY job.id;

GRANT SELECT ON public.job_sponsorship_summary TO authenticated;
