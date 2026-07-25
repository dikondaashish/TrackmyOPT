-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                         Functions & Stored Procedures                         ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 004_functions.sql                                                      ║
-- ║  Purpose: Create all database functions and stored procedures                 ║
-- ║  Run: FIFTH - After RLS policies                                              ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: update_updated_at_column()
-- Purpose: Automatically update the updated_at timestamp on row update
-- Used by: Multiple tables via triggers
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
  'Trigger function to automatically update updated_at timestamp';


-- =============================================================================
-- USER MANAGEMENT FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: handle_new_user()
-- Purpose: Automatically create a profile when a user signs up
-- Triggered by: on_auth_user_created trigger on auth.users
-- Security: SECURITY DEFINER to access auth.users
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public;

COMMENT ON FUNCTION public.handle_new_user() IS 
  'Automatically creates profile with email on user signup';


-- -----------------------------------------------------------------------------
-- Function: upgrade_user_to_premium()
-- Purpose: Upgrade a user to premium status after successful payment
-- Called by: Stripe webhook handler
-- Parameters:
--   p_user_id: UUID of the user to upgrade
--   p_stripe_payment_intent_id: Stripe payment intent ID
--   p_stripe_customer_id: Stripe customer ID
-- Returns: BOOLEAN indicating success
-- Security: SECURITY DEFINER to bypass RLS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upgrade_user_to_premium(
  p_user_id UUID,
  p_stripe_payment_intent_id TEXT,
  p_stripe_customer_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  UPDATE public.profiles
  SET 
    premium_status = TRUE,
    premium_purchased_at = NOW(),
    stripe_customer_id = p_stripe_customer_id,
    stripe_payment_intent_id = p_stripe_payment_intent_id
  WHERE user_id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.upgrade_user_to_premium(UUID, TEXT, TEXT) IS 
  'Upgrades a user to premium status after successful payment';


-- =============================================================================
-- EMAIL FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: get_premium_users_for_daily_email()
-- Purpose: Get all premium users who have email reminders enabled
-- Used by: Daily email cron job
-- Returns: Table of user information for sending emails
-- Security: SECURITY DEFINER to bypass RLS
-- -----------------------------------------------------------------------------
-- Drop first to allow signature changes
DROP FUNCTION IF EXISTS public.get_premium_users_for_daily_email();

CREATE OR REPLACE FUNCTION public.get_premium_users_for_daily_email()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  email_address TEXT,
  premium_purchased_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = pg_catalog, public
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
  FROM public.profiles p
  INNER JOIN public.email_preferences ep ON p.user_id = ep.user_id
  WHERE p.premium_status = TRUE
    AND ep.email_enabled = TRUE
    AND ep.email_verified = TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_premium_users_for_daily_email() IS 
  'Returns all premium users who have email reminders enabled';

-- =============================================================================
-- DOCUMENT FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: get_document_expiry_status()
-- Purpose: Calculate document expiry status based on expiry date
-- Parameters:
--   expiry: DATE - The document expiry date
-- Returns: TEXT - Status: 'no_expiry', 'expired', 'critical', 'warning', 'attention', 'good'
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_document_expiry_status(expiry DATE)
RETURNS TEXT AS $$
DECLARE
  days_until_expiry INTEGER;
BEGIN
  IF expiry IS NULL THEN
    RETURN 'no_expiry';
  END IF;
  
  days_until_expiry := expiry - CURRENT_DATE;
  
  IF days_until_expiry < 0 THEN
    RETURN 'expired';
  ELSIF days_until_expiry <= 7 THEN
    RETURN 'critical';
  ELSIF days_until_expiry <= 30 THEN
    RETURN 'warning';
  ELSIF days_until_expiry <= 90 THEN
    RETURN 'attention';
  ELSE
    RETURN 'good';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION public.get_document_expiry_status(DATE) IS 
  'Calculate document expiry status: no_expiry, expired, critical, warning, attention, good';


-- -----------------------------------------------------------------------------
-- Function: create_document_reminders()
-- Purpose: Create automatic reminders for a document based on expiry date
-- Parameters:
--   p_user_id: UUID - User ID
--   p_document_id: UUID - Document ID
--   p_document_name: TEXT - Document name for reminder message
--   p_expiry_date: DATE - Document expiry date
-- Returns: VOID
-- Reminder Schedule: 60, 45, 30, 20, 15, 10, 5, 3, 2, 1 days before expiry
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_document_reminders(
  p_user_id UUID,
  p_document_id UUID,
  p_document_name TEXT,
  p_expiry_date DATE
)
RETURNS VOID AS $$
DECLARE
  reminder_intervals INTEGER[] := ARRAY[60, 45, 30, 20, 15, 10, 5, 3, 2, 1];
  reminder_labels TEXT[] := ARRAY['60 days', '45 days', '30 days', '20 days', '15 days', '10 days', '5 days', '3 days', '2 days', '1 day'];
  reminder_type TEXT;
  reminder_date DATE;
  i INTEGER;
BEGIN
  -- Delete existing reminders for this document
  DELETE FROM public.document_reminders WHERE document_id = p_document_id;
  
  -- Create new reminders
  FOR i IN 1..array_length(reminder_intervals, 1) LOOP
    reminder_date := p_expiry_date - reminder_intervals[i];
    
    -- Only create reminder if it's in the future
    IF reminder_date >= CURRENT_DATE THEN
      reminder_type := CASE reminder_intervals[i]
        WHEN 60 THEN '60_days'
        WHEN 45 THEN '45_days'
        WHEN 30 THEN '30_days'
        WHEN 20 THEN '20_days'
        WHEN 15 THEN '15_days'
        WHEN 10 THEN '10_days'
        WHEN 5 THEN '5_days'
        WHEN 3 THEN '3_days'
        WHEN 2 THEN '2_days'
        WHEN 1 THEN '1_day'
      END;
      
      INSERT INTO public.document_reminders (
        user_id,
        document_id,
        reminder_type,
        reminder_message,
        send_at
      ) VALUES (
        p_user_id,
        p_document_id,
        reminder_type,
        format('Your document "%s" will expire in %s. Please renew it soon.', p_document_name, reminder_labels[i]),
        reminder_date::TIMESTAMPTZ
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.create_document_reminders(UUID, UUID, TEXT, DATE) IS 
  'Create automatic reminders for a document at 60, 45, 30, 20, 15, 10, 5, 3, 2, 1 days before expiry';


-- =============================================================================
-- CASE STATUS FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: update_case_status_updated_at()
-- Purpose: Automatically update the updated_at timestamp for case_status
-- Used by: update_case_status_updated_at_trigger
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_case_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_case_status_updated_at() IS 
  'Trigger function to update case_status.updated_at';


-- =============================================================================
-- DOCUMENT VAULT FUNCTIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Function: update_document_vault_updated_at()
-- Purpose: Automatically update the updated_at timestamp for document vault tables
-- Used by: Multiple triggers on document_passcodes, documents, document_reminders
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_document_vault_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_document_vault_updated_at() IS 
  'Trigger function to update updated_at for document vault tables';


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All functions created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Functions:';
  RAISE NOTICE '  • update_updated_at_column()        - Auto-update timestamps';
  RAISE NOTICE '  • handle_new_user()                 - Create profile on signup';
  RAISE NOTICE '  • upgrade_user_to_premium()         - Premium upgrade';
  RAISE NOTICE '  • get_premium_users_for_daily_email() - Email cron job';
  RAISE NOTICE '  • get_document_expiry_status()      - Document status check';
  RAISE NOTICE '  • create_document_reminders()       - Auto-create reminders';
  RAISE NOTICE '  • update_case_status_updated_at()   - Case status timestamps';
  RAISE NOTICE '  • update_document_vault_updated_at() - Document vault timestamps';
END $$;
