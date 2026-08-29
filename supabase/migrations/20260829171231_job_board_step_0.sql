-- Step 0: job-board catalog, normalized discovery records, and ingestion controls.
-- These tables are intentionally separate from public.job_applications, which is
-- each user's manual application tracker and remains unchanged.

CREATE TABLE public.ats_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id text REFERENCES public.h1b_sponsors (id) ON DELETE SET NULL,
  ats_type text NOT NULL CHECK (
    ats_type IN (
      'greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters',
      'successfactors', 'rippling'
    )
  ),
  board_token text NOT NULL,
  base_url text NOT NULL CHECK (base_url ~* '^https://'),
  enabled boolean NOT NULL DEFAULT false,
  max_requests_per_minute integer NOT NULL DEFAULT 10 CHECK (max_requests_per_minute > 0),
  max_requests_per_day integer NOT NULL DEFAULT 500 CHECK (max_requests_per_day > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ats_sources_ats_type_board_token_key UNIQUE (ats_type, board_token)
);

CREATE TABLE public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.ats_sources (id) ON DELETE RESTRICT,
  source_ats text NOT NULL CHECK (
    source_ats IN (
      'greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters',
      'successfactors', 'rippling', 'consumer_board'
    )
  ),
  board_token text NOT NULL,
  external_job_id text NOT NULL,
  title text NOT NULL,
  company_name text NOT NULL,
  location text,
  department text,
  description text,
  job_url text,
  posted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  sponsorship_tag text NOT NULL DEFAULT 'unknown' CHECK (
    sponsorship_tag IN ('confirmed_sponsor', 'likely_sponsor', 'unknown')
  ),
  opt_eligible boolean,
  stem_opt_eligible boolean,
  cpt_eligible boolean,
  h1b_sponsor_status text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT jobs_source_board_external_job_key
    UNIQUE (source_ats, board_token, external_job_id)
);

CREATE TABLE public.ingestion_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.ats_sources (id) ON DELETE RESTRICT,
  run_at timestamptz NOT NULL DEFAULT now(),
  jobs_found integer NOT NULL DEFAULT 0 CHECK (jobs_found >= 0),
  jobs_new integer NOT NULL DEFAULT 0 CHECK (jobs_new >= 0),
  jobs_duplicate integer NOT NULL DEFAULT 0 CHECK (jobs_duplicate >= 0),
  status text NOT NULL CHECK (
    status IN ('started', 'succeeded', 'failed', 'skipped_disabled', 'rate_limited')
  ),
  error_message text
);

CREATE INDEX ats_sources_enabled_idx ON public.ats_sources (enabled) WHERE enabled;
CREATE INDEX jobs_source_id_idx ON public.jobs (source_id);
CREATE INDEX jobs_posted_at_idx ON public.jobs (posted_at DESC NULLS LAST);
CREATE INDEX ingestion_audit_log_source_run_at_idx
  ON public.ingestion_audit_log (source_id, run_at DESC);

ALTER TABLE public.ats_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_audit_log ENABLE ROW LEVEL SECURITY;

-- No browser client has write access to source configuration or audit data.
-- The Step 1 Nest worker uses the Supabase service-role client; feed-read
-- policy is deliberately deferred until the feed exists.

CREATE OR REPLACE FUNCTION public.job_board_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER ats_sources_set_updated_at
  BEFORE UPDATE ON public.ats_sources
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

CREATE TRIGGER jobs_set_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

-- Prevent a worker bug from claiming that an item belongs to another board.
CREATE OR REPLACE FUNCTION public.assert_job_source_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  configured_source public.ats_sources;
BEGIN
  SELECT * INTO configured_source
  FROM public.ats_sources
  WHERE id = NEW.source_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown ATS source %', NEW.source_id;
  END IF;

  IF NEW.source_ats <> configured_source.ats_type
     OR NEW.board_token <> configured_source.board_token THEN
    RAISE EXCEPTION 'Job source identity must match its configured ATS source';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_assert_source_identity
  BEFORE INSERT OR UPDATE OF source_id, source_ats, board_token ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.assert_job_source_identity();

-- Reserve an ingestion attempt before an adapter makes a network request.
-- The advisory lock serializes quota checks per employer board, rather than
-- applying an ATS-wide cap that would starve unrelated employers.
CREATE OR REPLACE FUNCTION public.reserve_ats_ingestion(source uuid)
RETURNS TABLE (audit_log_id uuid, accepted boolean, reason text)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  configured_source public.ats_sources;
  request_count integer;
  audit_id uuid;
BEGIN
  SELECT * INTO configured_source
  FROM public.ats_sources
  WHERE id = source
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown ATS source %', source;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(source::text, 0));

  IF NOT configured_source.enabled THEN
    INSERT INTO public.ingestion_audit_log (source_id, status)
    VALUES (source, 'skipped_disabled')
    RETURNING id INTO audit_id;
    RETURN QUERY SELECT audit_id, false, 'source_disabled';
    RETURN;
  END IF;

  SELECT count(*) INTO request_count
  FROM public.ingestion_audit_log
  WHERE source_id = source
    AND run_at >= now() - interval '1 minute'
    AND status IN ('started', 'succeeded', 'failed');

  IF request_count >= configured_source.max_requests_per_minute THEN
    INSERT INTO public.ingestion_audit_log (source_id, status, error_message)
    VALUES (source, 'rate_limited', 'per-minute source limit reached')
    RETURNING id INTO audit_id;
    RETURN QUERY SELECT audit_id, false, 'per_minute_rate_limited';
    RETURN;
  END IF;

  SELECT count(*) INTO request_count
  FROM public.ingestion_audit_log
  WHERE source_id = source
    AND run_at >= date_trunc('day', now())
    AND status IN ('started', 'succeeded', 'failed');

  IF request_count >= configured_source.max_requests_per_day THEN
    INSERT INTO public.ingestion_audit_log (source_id, status, error_message)
    VALUES (source, 'rate_limited', 'per-day source limit reached')
    RETURNING id INTO audit_id;
    RETURN QUERY SELECT audit_id, false, 'per_day_rate_limited';
    RETURN;
  END IF;

  INSERT INTO public.ingestion_audit_log (source_id, status)
  VALUES (source, 'started')
  RETURNING id INTO audit_id;
  RETURN QUERY SELECT audit_id, true, 'accepted';
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_ats_ingestion(
  audit_id uuid,
  found_count integer,
  new_count integer,
  duplicate_count integer,
  failure_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF found_count < 0 OR new_count < 0 OR duplicate_count < 0 THEN
    RAISE EXCEPTION 'Ingestion counts must be non-negative';
  END IF;

  UPDATE public.ingestion_audit_log
  SET jobs_found = found_count,
      jobs_new = new_count,
      jobs_duplicate = duplicate_count,
      status = CASE WHEN failure_message IS NULL THEN 'succeeded' ELSE 'failed' END,
      error_message = failure_message
  WHERE id = audit_id
    AND status = 'started';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only a started ingestion audit log can be completed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ats_ingestion(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_ats_ingestion(uuid, integer, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_ats_ingestion(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_ats_ingestion(uuid, integer, integer, integer, text) TO service_role;
