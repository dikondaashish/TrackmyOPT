-- D1 activation nudge timestamps + email dedupe + ATS scan usage type.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_dashboard_viewed_at timestamptz;

COMMENT ON COLUMN public.profiles.onboarding_completed_at IS
  'Set when onboarding_completed flips true (wizard finish or skip).';
COMMENT ON COLUMN public.profiles.first_dashboard_viewed_at IS
  'First dashboard mount; used to suppress D1 activation nudge.';

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_queue_d1_activation_nudge_user
  ON public.email_queue (user_id, email_type)
  WHERE email_type = 'd1_activation_nudge' AND user_id IS NOT NULL;

COMMENT ON INDEX idx_email_queue_d1_activation_nudge_user IS
  'At most one D1 activation nudge per user (cron claim-before-send).';

ALTER TABLE public.resume_generations
  DROP CONSTRAINT IF EXISTS resume_generations_generation_type_check;

ALTER TABLE public.resume_generations
  ADD CONSTRAINT resume_generations_generation_type_check
  CHECK (generation_type IN ('generate', 'regenerate', 'ats_scan'));
