-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                            Core Tables Schema                                 ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 001_tables.sql                                                         ║
-- ║  Purpose: Define all database tables                                          ║
-- ║  Run: SECOND - After extensions                                               ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- TABLE: profiles
-- =============================================================================
-- Extended user profile information linked to Supabase Auth
-- One profile per authenticated user (auto-created on signup)
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
--   - Referenced by: opt_status, employment_spans, documents, etc.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary Key
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User Information (synced from auth.users)
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  
  -- User Preferences
  timezone TEXT DEFAULT 'America/New_York',
  is_stem_eligible BOOLEAN DEFAULT FALSE,
  
  -- Premium Status
  premium_status BOOLEAN DEFAULT FALSE,
  premium_purchased_at TIMESTAMPTZ,
  
  -- Stripe Integration
  stripe_customer_id TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Notification Settings
  notification_email TEXT,                    -- For Case Status & Document Vault
  opt_apply_email TEXT,                       -- OPT Apply Dates tool
  opt_clock_email TEXT,                       -- OPT Clock Tracker tool
  stem_apply_email TEXT,                      -- STEM Apply Dates tool
  stem_clock_email TEXT,                      -- STEM Clock Tracker tool
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
  -- Note: profiles table does not have updated_at column
);

-- Table Comment
COMMENT ON TABLE public.profiles IS 'Extended user profile information linked to Supabase Auth';

-- Column Comments
COMMENT ON COLUMN public.profiles.user_id IS 'Primary key, references auth.users(id)';
COMMENT ON COLUMN public.profiles.email IS 'User email (synced from auth.users on signup)';
COMMENT ON COLUMN public.profiles.timezone IS 'User timezone for accurate countdown calculations';
COMMENT ON COLUMN public.profiles.is_stem_eligible IS 'Whether user is eligible for STEM OPT extension';
COMMENT ON COLUMN public.profiles.premium_status IS 'Whether user has purchased premium access';
COMMENT ON COLUMN public.profiles.premium_purchased_at IS 'Timestamp when premium was purchased';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe customer ID for this user';
COMMENT ON COLUMN public.profiles.notification_email IS 'Email for Case Status & Document Vault notifications';
COMMENT ON COLUMN public.profiles.opt_apply_email IS 'Email for OPT Apply Dates tool notifications';
COMMENT ON COLUMN public.profiles.opt_clock_email IS 'Email for OPT Clock Tracker tool notifications';
COMMENT ON COLUMN public.profiles.stem_apply_email IS 'Email for STEM Apply Dates tool notifications';
COMMENT ON COLUMN public.profiles.stem_clock_email IS 'Email for STEM Clock Tracker tool notifications';


-- =============================================================================
-- TABLE: opt_status
-- =============================================================================
-- Core OPT timeline tracking with all critical dates
-- Stores all dates needed for OPT period calculations
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.opt_status (
  -- Primary Key
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Critical Dates
  program_end_date DATE NOT NULL,             -- Academic program completion date
  dso_recommendation_date DATE,               -- Date DSO recommended OPT
  opt_start_date DATE NOT NULL,               -- OPT period start date
  opt_ead_end_date DATE NOT NULL,             -- OPT EAD expiration date
  stem_start_date DATE,                       -- STEM extension start date (if applicable)
  
  -- Tracking
  last_updated_field TEXT,                    -- Which date field was most recently updated
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.opt_status IS 'OPT timeline tracking with all critical dates';

-- Column Comments
COMMENT ON COLUMN public.opt_status.program_end_date IS 'Academic program completion date';
COMMENT ON COLUMN public.opt_status.dso_recommendation_date IS 'Date DSO recommended OPT';
COMMENT ON COLUMN public.opt_status.opt_start_date IS 'OPT period start date';
COMMENT ON COLUMN public.opt_status.opt_ead_end_date IS 'OPT Employment Authorization Document expiration';
COMMENT ON COLUMN public.opt_status.stem_start_date IS 'STEM extension start date (if applicable)';
COMMENT ON COLUMN public.opt_status.last_updated_field IS 'Tracks which date field was most recently updated';


-- =============================================================================
-- TABLE: employment_spans
-- =============================================================================
-- Employment history tracking during OPT period
-- Users can have multiple employment records
-- 
-- Relationships:
--   - user_id → auth.users(id) [N:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.employment_spans (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Employment Details
  employer_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE,                              -- NULL means currently employed
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.employment_spans IS 'Employment history during OPT period';

-- Column Comments
COMMENT ON COLUMN public.employment_spans.end_date IS 'NULL means currently employed';


-- =============================================================================
-- TABLE: case_status
-- =============================================================================
-- USCIS case status tracking
-- Stores receipt number and status history
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.case_status (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Case Information
  receipt_number TEXT NOT NULL,               -- USCIS receipt number (e.g., IOE123456789)
  current_status TEXT,                        -- Latest case status from USCIS
  case_type TEXT,                             -- Type of case (I-765, I-129, etc.)
  received_date DATE,
  
  -- Status Tracking
  last_checked_at TIMESTAMPTZ,                -- Last time we checked USCIS
  last_status_change_at TIMESTAMPTZ,          -- Last time status actually changed
  status_history JSONB DEFAULT '[]'::JSONB,   -- Array of {status, date, description}
  
  -- Notification Settings
  notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_case UNIQUE (user_id)
);

-- Table Comment
COMMENT ON TABLE public.case_status IS 'USCIS case status tracking information';

-- Column Comments
COMMENT ON COLUMN public.case_status.receipt_number IS 'USCIS receipt number (e.g., IOE123456789)';
COMMENT ON COLUMN public.case_status.current_status IS 'Latest case status from USCIS';
COMMENT ON COLUMN public.case_status.case_type IS 'Type of case (I-765, I-129, etc.)';
COMMENT ON COLUMN public.case_status.status_history IS 'JSON array of historical status updates';
COMMENT ON COLUMN public.case_status.notifications_enabled IS 'Whether user wants notifications for status changes';


-- =============================================================================
-- TABLE: document_passcodes
-- =============================================================================
-- Stores user's vault passcode (hashed)
-- Premium feature for secure document storage
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.document_passcodes (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Passcode (hashed)
  passcode_hash TEXT NOT NULL,
  
  -- Security
  failed_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_passcode UNIQUE (user_id)
);

-- Table Comment
COMMENT ON TABLE public.document_passcodes IS 'Hashed passcodes for document vault access';


-- =============================================================================
-- TABLE: documents
-- =============================================================================
-- Document metadata and AI-extracted information
-- Premium feature for secure document storage with AI analysis
-- 
-- Relationships:
--   - user_id → auth.users(id) [N:1]
--   - Referenced by: document_reminders
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.documents (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- File Information
  file_name TEXT NOT NULL,
  filename TEXT NOT NULL,                     -- Duplicate for API compatibility
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  
  -- Storage
  s3_key TEXT NOT NULL,
  s3_bucket TEXT NOT NULL,
  
  -- Document Classification
  document_type TEXT NOT NULL,                -- passport, visa, i20, ead_card, etc.
  category TEXT,                              -- Same as document_type (API compatibility)
  
  -- AI Analysis
  ai_analyzed BOOLEAN DEFAULT FALSE,
  ai_analysis_date TIMESTAMPTZ,
  ai_confidence INTEGER,                      -- Confidence score (0-100)
  raw_ocr_text TEXT,
  extracted_text TEXT,                        -- Full text extracted by AI
  extracted_fields JSONB DEFAULT '{}'::JSONB, -- AI-extracted metadata
  summary TEXT,
  
  -- Important Dates
  issue_date DATE,
  expiry_date DATE,
  
  -- User-added Information
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                      -- Soft delete
);

-- Table Comment
COMMENT ON TABLE public.documents IS 'Document metadata and AI-extracted information';

-- Column Comments
COMMENT ON COLUMN public.documents.document_type IS 'Type: passport, visa, i20, ead_card, i983, offer_letter, paystub, receipt_notice, other';
COMMENT ON COLUMN public.documents.extracted_fields IS 'JSONB field containing AI-extracted metadata specific to document type';
COMMENT ON COLUMN public.documents.deleted_at IS 'Soft delete timestamp - documents are never hard deleted';
COMMENT ON COLUMN public.documents.ai_confidence IS 'AI confidence score (0-100)';


-- =============================================================================
-- TABLE: document_reminders
-- =============================================================================
-- Auto-generated reminders for document expirations
-- 
-- Relationships:
--   - user_id → auth.users(id) [N:1]
--   - document_id → documents(id) [N:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.document_reminders (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  
  -- Reminder Details
  reminder_type TEXT NOT NULL,                -- 6_months, 3_months, 1_month, 7_days, expired
  reminder_message TEXT NOT NULL,
  send_at TIMESTAMPTZ NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'pending',              -- pending, sent, failed, cancelled
  sent_at TIMESTAMPTZ,
  
  -- Channels
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  notification_sent BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.document_reminders IS 'Auto-generated reminders for document expirations';

-- Column Comments
COMMENT ON COLUMN public.document_reminders.reminder_type IS '6_months, 3_months, 1_month, 7_days, or expired';
COMMENT ON COLUMN public.document_reminders.status IS 'pending, sent, failed, or cancelled';


-- =============================================================================
-- TABLE: email_preferences
-- =============================================================================
-- User email preferences for reminders
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_preferences (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email Settings
  email_address TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_enabled BOOLEAN DEFAULT TRUE,
  
  -- Verification
  verification_token TEXT,
  verification_sent_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_email_pref UNIQUE (user_id)
);

-- Table Comment
COMMENT ON TABLE public.email_preferences IS 'User email addresses and preferences for reminder emails';

-- Column Comments
COMMENT ON COLUMN public.email_preferences.email_verified IS 'Whether the email address has been verified';
COMMENT ON COLUMN public.email_preferences.email_enabled IS 'Whether user wants to receive email reminders';


-- =============================================================================
-- TABLE: email_queue
-- =============================================================================
-- Tracks all sent/pending emails for analytics and debugging
-- 
-- Relationships:
--   - user_id → auth.users(id) [N:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.email_queue (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email Details
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL,                   -- daily_reminder, urgent_alert, verification, etc.
  email_subject TEXT,
  email_data JSONB,                           -- Store countdown data, variables used in email
  
  -- Delivery Status
  status TEXT DEFAULT 'pending',              -- pending, sent, failed, bounced
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  provider_message_id TEXT,                   -- Resend/SendGrid message ID
  
  -- Engagement Tracking
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.email_queue IS 'Tracks all emails sent to users for analytics and debugging';

-- Column Comments
COMMENT ON COLUMN public.email_queue.email_type IS 'Type: daily_reminder, urgent_alert, verification, case_status_change, document_expiry';
COMMENT ON COLUMN public.email_queue.email_data IS 'JSON data used in email (countdown info, etc)';
COMMENT ON COLUMN public.email_queue.status IS 'Delivery status: pending, sent, failed, bounced';


-- =============================================================================
-- TABLE: payment_transactions
-- =============================================================================
-- Tracks all Stripe payment transactions
-- 
-- Relationships:
--   - user_id → auth.users(id) [N:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe Information
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_checkout_session_id TEXT,
  
  -- Payment Details
  amount INTEGER NOT NULL,                    -- Amount in cents (299 = $2.99)
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,                       -- pending, succeeded, failed, refunded, canceled
  payment_method_type TEXT,                   -- card, apple_pay, google_pay, etc.
  failure_reason TEXT,
  
  -- Metadata
  metadata JSONB,                             -- Additional Stripe metadata
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.payment_transactions IS 'Stripe payment transactions for premium purchases';

-- Column Comments
COMMENT ON COLUMN public.payment_transactions.amount IS 'Amount in cents (e.g., 299 = $2.99)';
COMMENT ON COLUMN public.payment_transactions.status IS 'Payment status: pending, succeeded, failed, refunded, canceled';


-- =============================================================================
-- TABLE: blocked_emails
-- =============================================================================
-- Tracks blocked/bounced email addresses
-- Service role only - users cannot access
-- 
-- Relationships: None (standalone)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.blocked_emails (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Email Information
  email TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,                       -- bounced, complained, unsubscribed
  
  -- Timestamps
  blocked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Comment
COMMENT ON TABLE public.blocked_emails IS 'Blocked/bounced email addresses - service role only';


-- =============================================================================
-- TABLE: notification_settings
-- =============================================================================
-- User notification preferences
-- 
-- Relationships:
--   - user_id → auth.users(id) [1:1]
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notification_settings (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification Preferences
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT FALSE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  
  -- Frequency
  daily_digest BOOLEAN DEFAULT TRUE,
  instant_alerts BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_notification_settings UNIQUE (user_id)
);

-- Table Comment
COMMENT ON TABLE public.notification_settings IS 'User notification preferences';


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All tables created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables:';
  RAISE NOTICE '  • profiles              - User profiles';
  RAISE NOTICE '  • opt_status            - OPT timeline tracking';
  RAISE NOTICE '  • employment_spans      - Employment history';
  RAISE NOTICE '  • case_status           - USCIS case tracking';
  RAISE NOTICE '  • document_passcodes    - Vault passcodes';
  RAISE NOTICE '  • documents             - Document storage';
  RAISE NOTICE '  • document_reminders    - Expiry reminders';
  RAISE NOTICE '  • email_preferences     - Email settings';
  RAISE NOTICE '  • email_queue           - Email tracking';
  RAISE NOTICE '  • payment_transactions  - Payment history';
  RAISE NOTICE '  • blocked_emails        - Blocked emails';
  RAISE NOTICE '  • notification_settings - Notification prefs';
END $$;
