-- Fair rotation cursor for the nearby-case cron scanner.

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS last_nearby_scan_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_case_status_last_nearby_scan_at
  ON public.case_status (last_nearby_scan_at NULLS FIRST);

COMMENT ON COLUMN public.case_status.last_nearby_scan_at IS
  'When the nearby-case cron last scanned around this receipt; used for fair rotation.';
