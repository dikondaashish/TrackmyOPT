-- Premium plan + subscription end (used by Stripe webhook and /api/premium/status)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.profiles.plan_tier IS 'Stripe plan: pro, dedicated, free, etc.';
COMMENT ON COLUMN public.profiles.subscription_expires_at IS 'Current Stripe subscription period end (UTC)';
