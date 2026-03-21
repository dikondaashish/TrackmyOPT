-- Subscription id for Stripe subscription checkouts (refund / webhook lookups)
ALTER TABLE public.payment_transactions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

COMMENT ON COLUMN public.payment_transactions.stripe_subscription_id IS
  'Stripe Subscription id (sub_...) when checkout mode is subscription; used for refunds when PI id is synthetic';

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_subscription_id
  ON public.payment_transactions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
