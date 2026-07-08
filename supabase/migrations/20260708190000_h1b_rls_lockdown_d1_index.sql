-- Close direct client reads of h1b_sponsors; all access must go through authenticated API routes.
DROP POLICY IF EXISTS "Anyone can read h1b_sponsors" ON public.h1b_sponsors;

-- Partial index to speed D1 activation nudge cron queries.
CREATE INDEX IF NOT EXISTS idx_profiles_d1_nudge_candidates
  ON public.profiles (onboarding_completed_at)
  WHERE onboarding_completed = true
    AND premium_status = false
    AND first_dashboard_viewed_at IS NULL
    AND onboarding_completed_at IS NOT NULL;
