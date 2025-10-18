-- =====================================================
-- MANUAL PREMIUM UPGRADE
-- =====================================================
-- Run this in Supabase SQL Editor to manually upgrade user to premium
-- This is needed because webhook isn't set up yet

-- =====================================================
-- STEP 1: Find Your User ID
-- =====================================================
-- First, let's confirm which user to upgrade
SELECT 
  user_id,
  email,
  first_name,
  premium_status,
  stripe_customer_id
FROM profiles
WHERE email = 'dikondaashish@gmail.com';

-- =====================================================
-- STEP 2: Upgrade User to Premium
-- =====================================================
-- This simulates what the webhook would do

UPDATE profiles
SET 
  premium_status = TRUE,
  premium_purchased_at = NOW(),
  stripe_payment_intent_id = 'pi_manual_upgrade'
WHERE email = 'dikondaashish@gmail.com';

-- =====================================================
-- STEP 3: Verify Premium Status
-- =====================================================
SELECT 
  user_id,
  email,
  premium_status,
  premium_purchased_at,
  stripe_customer_id
FROM profiles
WHERE email = 'dikondaashish@gmail.com';

-- =====================================================
-- Expected Result:
-- premium_status should be TRUE
-- premium_purchased_at should show current timestamp
-- =====================================================

-- =====================================================
-- AFTER RUNNING THIS:
-- =====================================================
-- 1. Close and reopen your Chrome extension
-- 2. The "Upgrade to Premium" button should disappear
-- 3. You should see the email input form
-- 4. You can now add your email for daily reminders
-- =====================================================

