-- ═══════════════════════════════════════════════════════════════════════════════
-- Stripe ↔ Supabase reconciliation (live data, project deknauqkqqzwuvopqott)
-- Ground truth: Stripe MCP list_subscriptions(status=all), fetch_stripe_resources(sub_*)
-- Price map: price_1SybmpPHud1cOy4g5H9vHFEp + prod_TwUmlwWo5Bgh2S → pro
--             price_1SybmoPHud1cOy4gqKs8T9o4 + prod_TwUmlwWo5Bgh2S → pro (yearly)
--             prod_TwVBOldTG8hoPz → dedicated
--
-- APPLY ONLY AFTER REVIEWING THE RECONCILIATION REPORT.
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 1) Three live Stripe subscriptions (trialing, pro monthly) — source of truth ───
-- sub_1TDRAUPHud1cOy4gEtDneWtF / cus_UBoZOg36TSaMhN / current_period_end 1774710624
-- sub_1TDFwmPHud1cOy4gZjGN1KmK / cus_UAnLQsaMNKPfOG / current_period_end 1774667490
-- sub_1TBpiKPHud1cOy4gZR1W5VcC / cus_UAA12SBMuSZd7J / current_period_end 1774328321

-- ─── 2) Sync profiles for the three paying-path customers ───
UPDATE public.profiles
SET
  premium_status = TRUE,
  plan_tier = 'pro',
  subscription_expires_at = (timestamp with time zone 'epoch' + 1774710624 * interval '1 second'),
  stripe_customer_id = 'cus_UBoZOg36TSaMhN',
  stripe_payment_intent_id = 'sub_1TDRAUPHud1cOy4gEtDneWtF',
  premium_purchased_at = COALESCE(premium_purchased_at, (timestamp with time zone 'epoch' + 1774105824 * interval '1 second'))
WHERE user_id = '13eed302-bbf2-4c26-be74-429ac0dcbf47';

UPDATE public.profiles
SET
  premium_status = TRUE,
  plan_tier = 'pro',
  subscription_expires_at = (timestamp with time zone 'epoch' + 1774667490 * interval '1 second'),
  stripe_customer_id = 'cus_UAnLQsaMNKPfOG',
  stripe_payment_intent_id = 'sub_1TDFwmPHud1cOy4gZjGN1KmK',
  premium_purchased_at = COALESCE(premium_purchased_at, (timestamp with time zone 'epoch' + 1774062690 * interval '1 second'))
WHERE user_id = 'fad289e7-5874-41e6-a388-f0a75b0c74f8';

UPDATE public.profiles
SET
  premium_status = TRUE,
  plan_tier = 'pro',
  subscription_expires_at = (timestamp with time zone 'epoch' + 1774328321 * interval '1 second'),
  stripe_customer_id = 'cus_UAA12SBMuSZd7J',
  stripe_payment_intent_id = 'sub_1TBpiKPHud1cOy4gZR1W5VcC',
  premium_purchased_at = COALESCE(premium_purchased_at, (timestamp with time zone 'epoch' + 1773723521 * interval '1 second'))
WHERE user_id = 'c26fcb7f-4e75-4ed7-a77c-883502049395';

-- ─── 3) Revoke premium: cs_test-only, deleted Stripe customers, or manual grant ───
UPDATE public.profiles
SET
  premium_status = FALSE,
  plan_tier = NULL,
  subscription_expires_at = NULL,
  premium_purchased_at = NULL,
  stripe_payment_intent_id = NULL,
  stripe_customer_id = NULL
WHERE user_id IN (
  'f4b3efb4-ca86-4908-87d8-9fe4ba32111a',  -- test user — cs_test_, no live Stripe customer
  '6c03d215-3c8a-4bfc-ad73-3220685ee810',  -- heartbreakers — Stripe customer no longer exists
  '1b40f580-0777-48e7-a578-d129ce22d8c3',  -- cs_test_
  '732bf6d5-fb8e-4ffa-8e9e-0d10dafbd940',  -- cs_test_
  'af42455b-bb8b-4a83-a86d-d18c7b427a45',  -- cs_test_
  'c327e54c-65d0-42fd-933d-bba20a906c19'   -- manual premium, no Stripe customer / no payment row
);

-- ─── 4) Remove stale orphan pending checkout for user 13eed302 (duplicate session) ───
DELETE FROM public.payment_transactions
WHERE id = '1985e69f-b743-4c85-91f0-22c341465b10'
  AND stripe_payment_intent_id LIKE 'pending_cs_live_%'
  AND status = 'pending';

-- ─── 5) Backfill payment_transactions for Stripe subscribers missing a row ───
INSERT INTO public.payment_transactions (
  user_id,
  stripe_payment_intent_id,
  stripe_customer_id,
  stripe_checkout_session_id,
  stripe_subscription_id,
  amount,
  currency,
  status,
  payment_method_type,
  metadata
)
SELECT
  'fad289e7-5874-41e6-a388-f0a75b0c74f8',
  'sub_1TDFwmPHud1cOy4gZjGN1KmK',
  'cus_UAnLQsaMNKPfOG',
  NULL,
  'sub_1TDFwmPHud1cOy4gZjGN1KmK',
  799,
  'usd',
  'succeeded',
  'card',
  jsonb_build_object('plan_id', 'pro', 'reconciliation', 'stripe_supabase_sync_20260321')
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_transactions pt
  WHERE pt.stripe_payment_intent_id = 'sub_1TDFwmPHud1cOy4gZjGN1KmK'
);

INSERT INTO public.payment_transactions (
  user_id,
  stripe_payment_intent_id,
  stripe_customer_id,
  stripe_checkout_session_id,
  stripe_subscription_id,
  amount,
  currency,
  status,
  payment_method_type,
  metadata
)
SELECT
  'c26fcb7f-4e75-4ed7-a77c-883502049395',
  'sub_1TBpiKPHud1cOy4gZR1W5VcC',
  'cus_UAA12SBMuSZd7J',
  NULL,
  'sub_1TBpiKPHud1cOy4gZR1W5VcC',
  799,
  'usd',
  'succeeded',
  'card',
  jsonb_build_object('plan_id', 'pro', 'reconciliation', 'stripe_supabase_sync_20260321')
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_transactions pt
  WHERE pt.stripe_payment_intent_id = 'sub_1TBpiKPHud1cOy4gZR1W5VcC'
);

COMMIT;
