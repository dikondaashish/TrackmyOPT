-- One daily_reminder per user per UTC calendar day (race-safe dedupe for cron).
-- Index expressions must be IMMUTABLE: extract(epoch FROM ts AT TIME ZONE 'UTC') is valid;
-- bare extract(epoch FROM timestamptz) and timezone() are not.

DROP FUNCTION IF EXISTS public.email_queue_utc_date(timestamptz);
DROP FUNCTION IF EXISTS public.email_queue_utc_day(timestamptz);

DELETE FROM public.email_queue a
USING public.email_queue b
WHERE a.email_type = 'daily_reminder'
  AND b.email_type = 'daily_reminder'
  AND a.user_id IS NOT NULL
  AND b.user_id IS NOT NULL
  AND a.user_id = b.user_id
  AND floor(extract(epoch FROM a.created_at AT TIME ZONE 'UTC') / 86400)::bigint
    = floor(extract(epoch FROM b.created_at AT TIME ZONE 'UTC') / 86400)::bigint
  AND a.created_at > b.created_at;

DROP INDEX IF EXISTS public.idx_email_queue_daily_reminder_user_utc_day;

CREATE UNIQUE INDEX idx_email_queue_daily_reminder_user_utc_day
  ON public.email_queue (
    user_id,
    email_type,
    (floor(extract(epoch FROM created_at AT TIME ZONE 'UTC') / 86400)::bigint)
  )
  WHERE email_type = 'daily_reminder' AND user_id IS NOT NULL;

COMMENT ON INDEX idx_email_queue_daily_reminder_user_utc_day IS
  'Prevents duplicate daily_reminder sends per user per UTC day (cron insert-before-send).';
