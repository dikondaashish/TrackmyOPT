-- Backfill activation timestamps for users who completed onboarding before tracking existed.
-- Also sets first_dashboard_viewed_at so legacy users are not queued for D1 nudge blast.

UPDATE public.profiles
SET
  onboarding_completed_at = COALESCE(onboarding_completed_at, created_at),
  first_dashboard_viewed_at = COALESCE(first_dashboard_viewed_at, created_at)
WHERE onboarding_completed = true
  AND onboarding_completed_at IS NULL;
