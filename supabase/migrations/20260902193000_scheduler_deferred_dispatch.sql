-- Make overlap-protected hourly dispatches observable instead of appearing
-- queued when the orchestrator intentionally skips source work.
ALTER TABLE public.scheduler_runs
  DROP CONSTRAINT IF EXISTS scheduler_runs_dispatch_status_check;

ALTER TABLE public.scheduler_runs
  ADD CONSTRAINT scheduler_runs_dispatch_status_check CHECK (
    dispatch_status IN ('dispatched', 'queued', 'suppressed', 'failed', 'deferred')
  );

COMMENT ON COLUMN public.scheduler_runs.error_message IS
  'Sanitized enqueue failure or overlap-deferral reason when dispatch_status is failed or deferred.';
