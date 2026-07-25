-- Phase 4: D1 nudge targets signup age, not onboarding completion.
DROP INDEX IF EXISTS idx_profiles_d1_nudge_candidates;

CREATE INDEX IF NOT EXISTS idx_profiles_d1_nudge_candidates
  ON public.profiles (created_at)
  WHERE premium_status = false
    AND first_dashboard_viewed_at IS NULL
    AND created_at IS NOT NULL;
