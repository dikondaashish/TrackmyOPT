-- =====================================================
-- Premium Email System - Database Migration
-- =====================================================
-- This migration adds support for:
-- 1. Premium user status
-- 2. Email preferences and reminders
-- 3. Payment tracking
-- 4. Email delivery queue
-- =====================================================

-- =====================================================
-- 1. UPDATE PROFILES TABLE
-- =====================================================
-- Add premium-related columns to existing profiles table

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_status BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS premium_purchased_at TIMESTAMP;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add user info columns (needed for email system)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_premium_status ON profiles(premium_status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Backfill existing users' emails from auth.users
UPDATE profiles p
SET email = au.email
FROM auth.users au
WHERE p.user_id = au.id
  AND p.email IS NULL;

COMMENT ON COLUMN profiles.premium_status IS 'Whether user has purchased premium access';
COMMENT ON COLUMN profiles.premium_purchased_at IS 'Timestamp when premium was purchased';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for this user';
COMMENT ON COLUMN profiles.stripe_payment_intent_id IS 'Last successful payment intent ID';
COMMENT ON COLUMN profiles.email IS 'User email address (synced from auth.users)';
COMMENT ON COLUMN profiles.first_name IS 'User first name for personalization';
COMMENT ON COLUMN profiles.last_name IS 'User last name for personalization';

-- =====================================================
-- 2. CREATE EMAIL_PREFERENCES TABLE
-- =====================================================
-- Stores user email preferences for reminders

CREATE TABLE IF NOT EXISTS email_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_enabled BOOLEAN DEFAULT TRUE,
  verification_token TEXT,
  verification_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can update own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can insert own email preferences" ON email_preferences;
DROP POLICY IF EXISTS "Users can delete own email preferences" ON email_preferences;

-- RLS Policies
CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own email preferences"
  ON email_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_email_address ON email_preferences(email_address);
CREATE INDEX IF NOT EXISTS idx_email_preferences_verified ON email_preferences(email_verified);

-- Add comments
COMMENT ON TABLE email_preferences IS 'Stores user email addresses and preferences for reminder emails';
COMMENT ON COLUMN email_preferences.email_verified IS 'Whether the email address has been verified';
COMMENT ON COLUMN email_preferences.email_enabled IS 'Whether user wants to receive email reminders';

-- =====================================================
-- 3. CREATE EMAIL_QUEUE TABLE
-- =====================================================
-- Tracks all sent/pending emails for analytics and debugging

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'daily_reminder', 'urgent_alert', 'verification', etc.
  email_subject TEXT,
  email_data JSONB, -- Store countdown data, variables used in email
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,
  provider_message_id TEXT, -- Resend/SendGrid message ID
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (service role will bypass this)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own email history" ON email_queue;

-- RLS Policy - users can view their own email history
CREATE POLICY "Users can view own email history"
  ON email_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_sent_at ON email_queue(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_email_queue_email_type ON email_queue(email_type);

-- Add comments
COMMENT ON TABLE email_queue IS 'Tracks all emails sent to users for analytics and debugging';
COMMENT ON COLUMN email_queue.email_type IS 'Type of email: daily_reminder, urgent_alert, verification';
COMMENT ON COLUMN email_queue.email_data IS 'JSON data used in email (countdown info, etc)';
COMMENT ON COLUMN email_queue.status IS 'Email delivery status: pending, sent, failed, bounced';

-- =====================================================
-- 4. CREATE PAYMENT_TRANSACTIONS TABLE
-- =====================================================
-- Tracks all Stripe payment transactions

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL, -- Amount in cents (299 = $2.99)
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'refunded', 'canceled'
  payment_method_type TEXT, -- 'card', 'apple_pay', 'google_pay', etc.
  failure_reason TEXT,
  metadata JSONB, -- Additional Stripe metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running migration)
DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;

-- RLS Policy - users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- Add comments
COMMENT ON TABLE payment_transactions IS 'Tracks all Stripe payment transactions for premium purchases';
COMMENT ON COLUMN payment_transactions.amount IS 'Amount in cents (e.g., 299 = $2.99)';
COMMENT ON COLUMN payment_transactions.status IS 'Payment status: pending, succeeded, failed, refunded, canceled';

-- =====================================================
-- 5. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get premium users with email enabled (for cron job)
CREATE OR REPLACE FUNCTION get_premium_users_for_daily_email()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  email_address TEXT,
  premium_purchased_at TIMESTAMP
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    ep.email_address,
    p.premium_purchased_at
  FROM profiles p
  INNER JOIN email_preferences ep ON p.user_id = ep.user_id
  WHERE p.premium_status = TRUE
    AND ep.email_enabled = TRUE
    AND ep.email_verified = TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_premium_users_for_daily_email IS 'Returns all premium users who have email reminders enabled';

-- Function to update user to premium (called by webhook)
CREATE OR REPLACE FUNCTION upgrade_user_to_premium(
  p_user_id UUID,
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
BEGIN
  -- Update profiles
  UPDATE profiles
  SET 
    premium_status = TRUE,
    premium_purchased_at = NOW(),
    stripe_customer_id = p_stripe_customer_id,
    stripe_payment_intent_id = p_stripe_payment_intent_id
  WHERE user_id = p_user_id;

  -- Return true if update was successful
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION upgrade_user_to_premium IS 'Upgrades a user to premium status after successful payment';

-- Function to handle new user signup (updates existing trigger)
-- This ensures email is copied from auth.users to profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates profile with email on user signup';

-- Ensure trigger exists (recreate if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 6. CREATE VIEWS FOR ANALYTICS
-- =====================================================

-- View: Premium users statistics
CREATE OR REPLACE VIEW premium_stats AS
SELECT 
  COUNT(*) FILTER (WHERE premium_status = TRUE) as total_premium_users,
  COUNT(*) FILTER (WHERE premium_status = FALSE) as total_free_users,
  COUNT(*) as total_users,
  ROUND(
    (COUNT(*) FILTER (WHERE premium_status = TRUE)::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100, 
    2
  ) as premium_percentage
FROM profiles;

COMMENT ON VIEW premium_stats IS 'Statistics about premium vs free users';

-- View: Email delivery statistics
CREATE OR REPLACE VIEW email_delivery_stats AS
SELECT 
  email_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') as delivered,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'bounced') as bounced,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as clicked,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / NULLIF(COUNT(*), 0)::NUMERIC) * 100,
    2
  ) as delivery_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / NULLIF(COUNT(*) FILTER (WHERE status = 'sent'), 0)::NUMERIC) * 100,
    2
  ) as open_rate
FROM email_queue
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY email_type;

COMMENT ON VIEW email_delivery_stats IS 'Email delivery statistics for the last 30 days';

-- View: Revenue statistics
CREATE OR REPLACE VIEW revenue_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'succeeded') as total_successful_payments,
  SUM(amount) FILTER (WHERE status = 'succeeded') as total_revenue_cents,
  ROUND(SUM(amount) FILTER (WHERE status = 'succeeded')::NUMERIC / 100, 2) as total_revenue_dollars,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'succeeded') as unique_paying_users,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  COUNT(*) FILTER (WHERE status = 'refunded') as refunded_payments
FROM payment_transactions;

COMMENT ON VIEW revenue_stats IS 'Revenue and payment statistics';

-- =====================================================
-- 7. INSERT SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =====================================================

-- Uncomment below to add sample data for testing
/*
-- Sample: Upgrade a test user to premium (replace with actual user_id)
-- UPDATE profiles SET premium_status = TRUE, premium_purchased_at = NOW() 
-- WHERE email = 'test@example.com';
*/

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant service role access to all tables (needed for cron jobs)
GRANT ALL ON email_preferences TO service_role;
GRANT ALL ON email_queue TO service_role;
GRANT ALL ON payment_transactions TO service_role;
GRANT ALL ON profiles TO service_role;

-- Grant authenticated users read access to their own data (handled by RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON email_preferences TO authenticated;
GRANT SELECT ON email_queue TO authenticated;
GRANT SELECT ON payment_transactions TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Premium Email System Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables Created:';
  RAISE NOTICE '  1. profiles (updated with premium columns)';
  RAISE NOTICE '  2. email_preferences';
  RAISE NOTICE '  3. email_queue';
  RAISE NOTICE '  4. payment_transactions';
  RAISE NOTICE '';
  RAISE NOTICE 'Views Created:';
  RAISE NOTICE '  1. premium_stats';
  RAISE NOTICE '  2. email_delivery_stats';
  RAISE NOTICE '  3. revenue_stats';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions Created:';
  RAISE NOTICE '  1. get_premium_users_for_daily_email()';
  RAISE NOTICE '  2. upgrade_user_to_premium()';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '  1. Install npm packages: stripe, @stripe/stripe-js, resend';
  RAISE NOTICE '  2. Add environment variables to .env.local';
  RAISE NOTICE '  3. Create Stripe API endpoints';
  RAISE NOTICE '  4. Set up email service';
  RAISE NOTICE '';
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify migration was successful

SELECT 
  'Profiles Table' as check_name,
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(premium_status) as profiles_with_premium_column,
  COUNT(*) FILTER (WHERE premium_status = TRUE) as premium_users
FROM profiles;

SELECT 
  'Email Preferences Table' as check_name,
  COUNT(*) as total_records
FROM email_preferences;

SELECT 
  'Payment Transactions Table' as check_name,
  COUNT(*) as total_records
FROM payment_transactions;

SELECT 
  'Email Queue Table' as check_name,
  COUNT(*) as total_records
FROM email_queue;

