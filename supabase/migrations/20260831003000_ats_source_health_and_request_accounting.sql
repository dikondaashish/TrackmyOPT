-- Persist actual adapter HTTP attempts, not merely orchestration runs, and
-- stop repeatedly hammering a board after consecutive failures.

ALTER TABLE public.ingestion_audit_log
  ADD COLUMN IF NOT EXISTS http_requests_made integer NOT NULL DEFAULT 0
    CHECK (http_requests_made >= 0),
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

ALTER TABLE public.ats_boards
  ADD COLUMN IF NOT EXISTS circuit_state text NOT NULL DEFAULT 'closed'
    CHECK (circuit_state IN ('closed', 'open')),
  ADD COLUMN IF NOT EXISTS circuit_opened_at timestamptz;

ALTER TABLE public.ats_boards
  ADD CONSTRAINT ats_boards_circuit_timestamps_check CHECK (
    (circuit_state = 'closed' AND circuit_opened_at IS NULL)
    OR (circuit_state = 'open' AND circuit_opened_at IS NOT NULL)
  ) NOT VALID;

ALTER TABLE public.ats_boards
  VALIDATE CONSTRAINT ats_boards_circuit_timestamps_check;

CREATE INDEX IF NOT EXISTS ats_boards_retry_queue_idx
  ON public.ats_boards (
    circuit_state,
    next_retry_at NULLS FIRST,
    last_success_at NULLS FIRST,
    id
  )
  WHERE verification_status = 'verified';

CREATE OR REPLACE FUNCTION public.complete_ats_ingestion(
  audit_id uuid,
  found_count integer,
  new_count integer,
  duplicate_count integer,
  stale_count integer,
  removed_count integer,
  reopened_count integer,
  http_request_count integer,
  failure_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF found_count < 0 OR new_count < 0 OR duplicate_count < 0
     OR stale_count < 0 OR removed_count < 0 OR reopened_count < 0
     OR http_request_count < 0 THEN
    RAISE EXCEPTION 'Ingestion counts must be non-negative';
  END IF;

  UPDATE public.ingestion_audit_log
  SET jobs_found = found_count,
      jobs_new = new_count,
      jobs_duplicate = duplicate_count,
      jobs_stale = stale_count,
      jobs_removed = removed_count,
      jobs_reopened = reopened_count,
      http_requests_made = http_request_count,
      completed_at = now(),
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
  uuid, integer, integer, integer, integer, integer, integer, integer, text
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_ats_ingestion(
  uuid, integer, integer, integer, integer, integer, integer, integer, text
) TO service_role;

NOTIFY pgrst, 'reload schema';
