-- One daily_reminder per user per UTC calendar day (race-safe dedupe for cron).
DELETE FROM public.email_queue a
USING public.email_queue b
WHERE a.email_type = 'daily_reminder'
  AND b.email_type = 'daily_reminder'
  AND a.user_id IS NOT NULL
  AND b.user_id IS NOT NULL
  AND a.user_id = b.user_id
  AND (timezone('UTC', a.created_at))::date = (timezone('UTC', b.created_at))::date
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_queue_daily_reminder_user_utc_day
  ON public.email_queue (user_id, email_type, ((timezone('UTC', created_at))::date))
  WHERE email_type = 'daily_reminder' AND user_id IS NOT NULL;

COMMENT ON INDEX idx_email_queue_daily_reminder_user_utc_day IS
  'Prevents duplicate daily_reminder sends per user per UTC day (cron insert-before-send).';
