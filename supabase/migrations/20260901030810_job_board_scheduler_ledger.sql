-- One canonical row owns a scheduler ID. A separate append-only attempts table
-- preserves every accepted, suppressed, or failed request without weakening the
-- unique database claim on scheduler_runs.scheduler_run_id.
CREATE TABLE public.scheduler_runs (
  scheduler_run_id text PRIMARY KEY CHECK (
    scheduler_run_id ~ '^job-board-hour-[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}$'
    OR scheduler_run_id ~ '^job-board-manual-[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'
  ),
  trigger_origin text NOT NULL DEFAULT 'unknown' CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown')
  ),
  bull_job_id text,
  queued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.scheduler_run_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduler_run_id text NOT NULL,
  trigger_origin text NOT NULL DEFAULT 'unknown' CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown')
  ),
  bull_job_id text,
  outcome text NOT NULL CHECK (outcome IN ('queued', 'suppressed', 'failed')),
  queued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scheduler_run_attempts_run_created_idx
  ON public.scheduler_run_attempts (scheduler_run_id, created_at);

ALTER TABLE public.scheduler_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduler_run_attempts ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.scheduler_runs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.scheduler_run_attempts FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scheduler_runs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scheduler_run_attempts TO service_role;

ALTER TABLE public.ingestion_audit_log
  ADD COLUMN scheduler_run_id text,
  ADD COLUMN trigger_origin text NOT NULL DEFAULT 'unknown' CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown')
  );

CREATE INDEX ingestion_audit_log_scheduler_run_idx
  ON public.ingestion_audit_log (scheduler_run_id, run_at);

DROP FUNCTION IF EXISTS public.reserve_ats_ingestion(uuid);

CREATE FUNCTION public.reserve_ats_ingestion(
  source uuid,
  scheduler_id text DEFAULT NULL,
  origin text DEFAULT 'unknown'
)
RETURNS TABLE (audit_log_id uuid, accepted boolean, reason text)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  configured_source public.ats_sources;
  request_count integer;
  audit_id uuid;
BEGIN
  IF scheduler_id IS NOT NULL AND NOT (
    scheduler_id ~ '^job-board-hour-[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}$'
    OR scheduler_id ~ '^job-board-manual-[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'
  ) THEN
    RAISE EXCEPTION 'Invalid scheduler run ID';
  END IF;

  IF origin NOT IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown') THEN
    RAISE EXCEPTION 'Invalid scheduler trigger origin';
  END IF;

  SELECT * INTO configured_source
  FROM public.ats_sources
  WHERE id = source
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown ATS source %', source;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(source::text, 0));

  IF NOT configured_source.enabled THEN
    INSERT INTO public.ingestion_audit_log (
      source_id, status, scheduler_run_id, trigger_origin
    )
    VALUES (source, 'skipped_disabled', scheduler_id, origin)
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
    INSERT INTO public.ingestion_audit_log (
      source_id, status, error_message, scheduler_run_id, trigger_origin
    )
    VALUES (
      source, 'rate_limited', 'per-minute source limit reached', scheduler_id, origin
    )
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
    INSERT INTO public.ingestion_audit_log (
      source_id, status, error_message, scheduler_run_id, trigger_origin
    )
    VALUES (
      source, 'rate_limited', 'per-day source limit reached', scheduler_id, origin
    )
    RETURNING id INTO audit_id;
    RETURN QUERY SELECT audit_id, false, 'per_day_rate_limited';
    RETURN;
  END IF;

  INSERT INTO public.ingestion_audit_log (
    source_id, status, scheduler_run_id, trigger_origin
  )
  VALUES (source, 'started', scheduler_id, origin)
  RETURNING id INTO audit_id;
  RETURN QUERY SELECT audit_id, true, 'accepted';
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_ats_ingestion(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reserve_ats_ingestion(uuid, text, text) TO service_role;

NOTIFY pgrst, 'reload schema';
