-- Store HTML/text for cron retry of stuck transactional emails; track retry attempts.
ALTER TABLE public.email_queue
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS body_html text,
  ADD COLUMN IF NOT EXISTS body_text text;

COMMENT ON COLUMN public.email_queue.retry_count IS 'Number of failed send attempts from retry cron (max 3)';
COMMENT ON COLUMN public.email_queue.body_html IS 'Stored HTML body for SMTP retry without regenerating';
COMMENT ON COLUMN public.email_queue.body_text IS 'Stored plain-text body for SMTP retry';
