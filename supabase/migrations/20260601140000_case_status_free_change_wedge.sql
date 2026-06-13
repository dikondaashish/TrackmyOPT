-- Free-user status change wedge: track when cron detected a change but email was suppressed (non-Pro).

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS status_last_changed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_change_alert_suppressed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_status_viewed_at timestamptz;

COMMENT ON COLUMN public.case_status.status_last_changed_at IS
  'Set when a real USCIS status change is detected for a free user (not first-ever check).';
COMMENT ON COLUMN public.case_status.last_change_alert_suppressed IS
  'True when a status change was detected but email alert was not sent (free tier).';
COMMENT ON COLUMN public.case_status.last_status_viewed_at IS
  'Last time the user viewed /dashboard/case-status (for wedge dismissal).';
