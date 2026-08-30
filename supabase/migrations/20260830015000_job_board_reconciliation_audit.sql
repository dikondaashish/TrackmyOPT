-- Preserve truthful listing freshness and record closure/reopen transitions.
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS missing_since_at timestamptz,
  ADD COLUMN IF NOT EXISTS removed_at timestamptz;

ALTER TABLE public.ingestion_audit_log
  ADD COLUMN IF NOT EXISTS jobs_stale integer NOT NULL DEFAULT 0 CHECK (jobs_stale >= 0),
  ADD COLUMN IF NOT EXISTS jobs_removed integer NOT NULL DEFAULT 0 CHECK (jobs_removed >= 0),
  ADD COLUMN IF NOT EXISTS jobs_reopened integer NOT NULL DEFAULT 0 CHECK (jobs_reopened >= 0);

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_listing_lifecycle_timestamps_check CHECK (
    (listing_status = 'open' AND missing_since_at IS NULL AND removed_at IS NULL)
    OR (listing_status = 'stale' AND missing_since_at IS NOT NULL AND removed_at IS NULL)
    OR (listing_status = 'removed' AND missing_since_at IS NOT NULL AND removed_at IS NOT NULL)
  ) NOT VALID;

ALTER TABLE public.jobs VALIDATE CONSTRAINT jobs_listing_lifecycle_timestamps_check;

CREATE OR REPLACE FUNCTION public.complete_ats_ingestion(
  audit_id uuid,
  found_count integer,
  new_count integer,
  duplicate_count integer,
  stale_count integer,
  removed_count integer,
  reopened_count integer,
  failure_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF found_count < 0 OR new_count < 0 OR duplicate_count < 0
     OR stale_count < 0 OR removed_count < 0 OR reopened_count < 0 THEN
    RAISE EXCEPTION 'Ingestion counts must be non-negative';
  END IF;

  UPDATE public.ingestion_audit_log
  SET jobs_found = found_count,
      jobs_new = new_count,
      jobs_duplicate = duplicate_count,
      jobs_stale = stale_count,
      jobs_removed = removed_count,
      jobs_reopened = reopened_count,
      status = CASE WHEN failure_message IS NULL THEN 'succeeded' ELSE 'failed' END,
      error_message = failure_message
  WHERE id = audit_id
    AND status = 'started';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only a started ingestion audit log can be completed';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_ats_ingestion(
  uuid, integer, integer, integer, integer, integer, integer, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_ats_ingestion(
  uuid, integer, integer, integer, integer, integer, integer, text
) TO service_role;

NOTIFY pgrst, 'reload schema';
