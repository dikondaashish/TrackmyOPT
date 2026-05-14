-- Lifetime Pro free trial: one Stripe trial per auth user (enforced in create-checkout + applyStripeCheckoutSession).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_free_trial_consumed boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.pro_free_trial_consumed IS
  'After any successful Pro subscription checkout, Stripe trial_period_days is omitted for future Pro checkouts.';

UPDATE public.profiles p
SET pro_free_trial_consumed = true
WHERE EXISTS (
  SELECT 1
  FROM public.payment_transactions t
  WHERE t.user_id = p.user_id
    AND t.status = 'succeeded'
    AND lower(coalesce(t.metadata->>'plan_id', '')) = 'pro'
);
