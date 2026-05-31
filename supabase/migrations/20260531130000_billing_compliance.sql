-- Billing compliance: consent audit trail + policy version seeds

CREATE TABLE IF NOT EXISTS public.billing_consent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  plan_id TEXT,
  billing_interval TEXT,
  terms_version TEXT,
  refund_policy_version TEXT,
  subscription_terms_version TEXT,
  disclosures_json JSONB,
  ip_address TEXT,
  user_agent TEXT,
  stripe_checkout_session_id TEXT,
  stripe_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_consent_events_user_id
  ON public.billing_consent_events(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_billing_consent_events_stripe_session
  ON public.billing_consent_events(stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

ALTER TABLE public.billing_consent_events ENABLE ROW LEVEL SECURITY;

-- Idempotent: safe if migration was partially applied or re-run in SQL editor
DROP POLICY IF EXISTS "Users can view own billing consent events" ON public.billing_consent_events;

CREATE POLICY "Users can view own billing consent events"
  ON public.billing_consent_events FOR SELECT
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.billing_consent_events IS
  'Audit log for subscription checkout consent, cancellation, and policy notices (dispute evidence).';

-- Policy version seeds (subscription + refund)
INSERT INTO public.policy_versions (policy_type, current_version, requires_consent, effective_date, change_summary)
VALUES
  (
    'refund_policy',
    '2026-05-31',
    true,
    '2026-05-31',
    'Clarified Pro 7-day trial, Dedicated 3-day first-month guarantee, no refunds after those windows except billing errors, fraud, or major service failure.'
  ),
  (
    'subscription_billing_terms',
    '2026-05-31',
    true,
    '2026-05-31',
    'Auto-renewing subscription disclosures: trial, renewal amount, cancellation via Stripe portal, access through paid period.'
  )
ON CONFLICT (policy_type) DO UPDATE SET
  current_version = EXCLUDED.current_version,
  requires_consent = EXCLUDED.requires_consent,
  effective_date = EXCLUDED.effective_date,
  change_summary = EXCLUDED.change_summary,
  updated_at = NOW();

UPDATE public.policy_versions
SET
  current_version = '2026-05-31',
  requires_consent = true,
  change_summary = 'Updated subscription billing, cancellation, immigration disclaimers, and auto-renewal terms.',
  effective_date = '2026-05-31',
  updated_at = NOW()
WHERE policy_type = 'terms_of_service';

INSERT INTO public.policy_versions (policy_type, current_version, requires_consent, effective_date, change_summary)
VALUES
  ('privacy_policy', '2026-05-31', true, '2026-05-31', 'Expanded data categories: document vault, case history, analytics, AI features, and accurate third-party list.'),
  ('disclaimer', '2026-05-31', false, '2026-05-31', 'Clarified not legal advice, no government affiliation, no outcome guarantees, AI limitations.'),
  ('cookie_policy', '2026-05-31', false, '2026-05-31', 'Documented essential, analytics (PostHog/Vercel), and Stripe cookies.'),
  ('security_page', '2026-05-31', false, '2026-05-31', 'Security practices: TLS, Stripe payments, access controls; no unverified certification claims.')
ON CONFLICT (policy_type) DO UPDATE SET
  current_version = EXCLUDED.current_version,
  requires_consent = EXCLUDED.requires_consent,
  effective_date = EXCLUDED.effective_date,
  change_summary = EXCLUDED.change_summary,
  updated_at = NOW();
