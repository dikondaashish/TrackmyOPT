-- Document STEM OPT window alert email_type (no schema change; uses existing email_queue)

COMMENT ON COLUMN public.email_queue.email_type IS 'Type: daily_reminder, urgent_alert, verification, case_status_change, document_expiry, stem_opt_window_open (STEM OPT 90-day filing window alert from cron), etc.';
