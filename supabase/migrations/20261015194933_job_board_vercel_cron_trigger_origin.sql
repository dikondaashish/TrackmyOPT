-- Allow the Vercel cron scheduler (/api/cron/job-board-ingestion-dispatch) to
-- record its own trigger origin. Additive: every existing value stays valid.
-- Apply this BEFORE the API change that accepts 'vercel_cron' is deployed;
-- an API that accepts it while these constraints still reject it would fail
-- every vercel_cron dispatch.

ALTER TABLE public.scheduler_runs
  DROP CONSTRAINT IF EXISTS scheduler_runs_trigger_origin_check,
  ADD CONSTRAINT scheduler_runs_trigger_origin_check CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown', 'vercel_cron')
  ) NOT VALID;
ALTER TABLE public.scheduler_runs VALIDATE CONSTRAINT scheduler_runs_trigger_origin_check;

ALTER TABLE public.scheduler_run_attempts
  DROP CONSTRAINT IF EXISTS scheduler_run_attempts_trigger_origin_check,
  ADD CONSTRAINT scheduler_run_attempts_trigger_origin_check CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown', 'vercel_cron')
  ) NOT VALID;
ALTER TABLE public.scheduler_run_attempts VALIDATE CONSTRAINT scheduler_run_attempts_trigger_origin_check;

ALTER TABLE public.ingestion_audit_log
  DROP CONSTRAINT IF EXISTS ingestion_audit_log_trigger_origin_check,
  ADD CONSTRAINT ingestion_audit_log_trigger_origin_check CHECK (
    trigger_origin IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown', 'vercel_cron')
  ) NOT VALID;
ALTER TABLE public.ingestion_audit_log VALIDATE CONSTRAINT ingestion_audit_log_trigger_origin_check;

-- Same body as 20260901201800_job_board_audit_dedup_and_watchdog.sql (the
-- production definition is equivalent), with 'vercel_cron' allowed.
CREATE OR REPLACE FUNCTION public.reserve_ats_ingestion(
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
  existing_audit public.ingestion_audit_log;
  request_count integer;
  audit_id uuid;
BEGIN
  IF scheduler_id IS NOT NULL AND NOT (
    scheduler_id ~ '^job-board-hour-[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}$'
    OR scheduler_id ~ '^job-board-manual-[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$'
  ) THEN
    RAISE EXCEPTION 'Invalid scheduler run ID';
  END IF;

  IF origin NOT IN ('cron_jobs_org', 'github_actions', 'manual', 'unknown', 'vercel_cron') THEN
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

  -- Replays reuse the original audit. A failed audit is reclaimed so a
  -- bounded Bull retry can continue without duplicating history.
  IF scheduler_id IS NOT NULL THEN
    SELECT * INTO existing_audit
    FROM public.ingestion_audit_log
    WHERE source_id = source
      AND scheduler_run_id = scheduler_id
    ORDER BY run_at DESC, id DESC
    LIMIT 1
    FOR UPDATE;

    IF FOUND THEN
      IF existing_audit.status = 'failed' THEN
        UPDATE public.ingestion_audit_log
        SET status = 'started',
            error_message = NULL,
            completed_at = NULL,
            trigger_origin = origin,
            run_at = now()
        WHERE id = existing_audit.id;
        RETURN QUERY SELECT existing_audit.id, true, 'retry_existing_audit';
        RETURN;
      END IF;
      RETURN QUERY SELECT existing_audit.id, false, 'duplicate_scheduler_run';
      RETURN;
    END IF;
  END IF;

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
