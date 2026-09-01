-- Keep a durable dispatch record even when the Render queue request fails.
ALTER TABLE public.scheduler_runs
  ADD COLUMN IF NOT EXISTS dispatch_status text NOT NULL DEFAULT 'dispatched',
  ADD COLUMN IF NOT EXISTS error_message text,
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.scheduler_runs
  DROP CONSTRAINT IF EXISTS scheduler_runs_dispatch_status_check;

ALTER TABLE public.scheduler_runs
  ADD CONSTRAINT scheduler_runs_dispatch_status_check CHECK (
    dispatch_status IN ('dispatched', 'queued', 'suppressed', 'failed')
  );

UPDATE public.scheduler_runs
SET dispatch_status = CASE
  WHEN queued_at IS NOT NULL THEN 'queued'
  ELSE 'dispatched'
END
WHERE dispatch_status = 'dispatched';

COMMENT ON COLUMN public.scheduler_runs.dispatch_status IS
  'Durable scheduler dispatch state: dispatched, queued, suppressed, or failed.';

COMMENT ON COLUMN public.scheduler_runs.error_message IS
  'Sanitized enqueue failure detail when dispatch_status is failed.';
