-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT ADMIN SCRIPT                             ║
-- ║                          Manual Premium Upgrade                               ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Purpose: Manually upgrade a user to premium status                           ║
-- ║  Use Case: When Stripe webhook fails or for testing                           ║
-- ║  Run: Supabase SQL Editor                                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- STEP 1: Find the user to upgrade
-- =============================================================================
-- Replace 'user@example.com' with the actual email address

SELECT 
  user_id,
  email,
  first_name,
  last_name,
  premium_status,
  premium_purchased_at,
  stripe_customer_id
FROM public.profiles
WHERE email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- STEP 2: Upgrade user to premium
-- =============================================================================
-- Replace 'user@example.com' with the actual email address
-- Replace stripe IDs if you have them, or use 'manual_upgrade' placeholders

UPDATE public.profiles
SET 
  premium_status = TRUE,
  premium_purchased_at = NOW(),
  stripe_payment_intent_id = 'pi_manual_upgrade',  -- Or actual Stripe ID
  stripe_customer_id = 'cus_manual_upgrade'        -- Or actual Stripe ID
WHERE email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- STEP 3: Verify the upgrade
-- =============================================================================

SELECT 
  user_id,
  email,
  premium_status,
  premium_purchased_at,
  stripe_customer_id,
  stripe_payment_intent_id
FROM public.profiles
WHERE email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- STEP 4: (Optional) Create a payment transaction record
-- =============================================================================
-- This creates a record for tracking purposes

/*
INSERT INTO public.payment_transactions (
  user_id,
  stripe_payment_intent_id,
  stripe_customer_id,
  amount,
  currency,
  status,
  payment_method_type,
  metadata
)
SELECT 
  user_id,
  'pi_manual_upgrade',
  'cus_manual_upgrade',
  299,  -- $2.99 in cents
  'usd',
  'succeeded',
  'manual',
  '{"reason": "Manual upgrade by admin"}'::jsonb
FROM public.profiles
WHERE email = 'user@example.com';  -- ← CHANGE THIS
*/


-- =============================================================================
-- AFTER RUNNING THIS SCRIPT:
-- =============================================================================
-- 1. User should refresh their browser/extension
-- 2. Premium features should now be accessible
-- 3. "Upgrade to Premium" buttons should disappear
-- 4. Email reminder inputs should be visible
-- =============================================================================
