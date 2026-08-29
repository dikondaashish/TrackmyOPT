-- Deployment repair only: restores the Step 0 ingestion controls when the
-- tables have been applied but their RPC functions are absent from Postgres.
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

NOTIFY pgrst, 'reload schema';
