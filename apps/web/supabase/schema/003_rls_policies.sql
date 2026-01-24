-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                      Row Level Security (RLS) Policies                        ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 003_rls_policies.sql                                                   ║
-- ║  Purpose: Enable RLS and create security policies for all tables             ║
-- ║  Run: FOURTH - After indexes                                                  ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  SECURITY BEST PRACTICES:                                                     ║
-- ║  1. All auth.uid() calls wrapped with (select auth.uid()) for performance    ║
-- ║  2. Separate policies for SELECT, INSERT, UPDATE, DELETE operations          ║
-- ║  3. WITH CHECK used for INSERT/UPDATE to validate new data                   ║
-- ║  4. USING clause for SELECT/UPDATE/DELETE to filter existing data            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opt_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employment_spans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_passcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- DROP EXISTING POLICIES (for idempotent migrations)
-- =============================================================================

-- Profiles
DROP POLICY IF EXISTS "profiles self" ON public.profiles;

-- OPT Status
DROP POLICY IF EXISTS "opt_status self" ON public.opt_status;

-- Employment Spans
DROP POLICY IF EXISTS "employment_spans self" ON public.employment_spans;

-- Case Status
DROP POLICY IF EXISTS "Users can view their own case status" ON public.case_status;
DROP POLICY IF EXISTS "Users can insert their own case status" ON public.case_status;
DROP POLICY IF EXISTS "Users can update their own case status" ON public.case_status;
DROP POLICY IF EXISTS "Users can delete their own case status" ON public.case_status;

-- Document Passcodes
DROP POLICY IF EXISTS "Users can view their own passcode" ON public.document_passcodes;
DROP POLICY IF EXISTS "Users can insert their own passcode" ON public.document_passcodes;
DROP POLICY IF EXISTS "Users can update their own passcode" ON public.document_passcodes;
DROP POLICY IF EXISTS "Users can delete their own passcode" ON public.document_passcodes;

-- Documents
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can soft delete their own documents" ON public.documents;

-- Document Reminders
DROP POLICY IF EXISTS "Users can view their own reminders" ON public.document_reminders;
DROP POLICY IF EXISTS "Users can insert their own reminders" ON public.document_reminders;
DROP POLICY IF EXISTS "Users can update their own reminders" ON public.document_reminders;
DROP POLICY IF EXISTS "Users can delete their own reminders" ON public.document_reminders;

-- Email Preferences
DROP POLICY IF EXISTS "Users can view own email preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can insert own email preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can update own email preferences" ON public.email_preferences;
DROP POLICY IF EXISTS "Users can delete own email preferences" ON public.email_preferences;

-- Email Queue
DROP POLICY IF EXISTS "Users can view own email history" ON public.email_queue;

-- Payment Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.payment_transactions;

-- Blocked Emails
DROP POLICY IF EXISTS "Service role only" ON public.blocked_emails;

-- Notification Settings
DROP POLICY IF EXISTS "Users can manage own settings" ON public.notification_settings;


-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================
-- Users can only access their own profile
CREATE POLICY "profiles self" ON public.profiles
  FOR ALL 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);


-- =============================================================================
-- OPT_STATUS POLICIES
-- =============================================================================
-- Users can only access their own OPT status
CREATE POLICY "opt_status self" ON public.opt_status
  FOR ALL 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);


-- =============================================================================
-- EMPLOYMENT_SPANS POLICIES
-- =============================================================================
-- Users can only access their own employment records
CREATE POLICY "employment_spans self" ON public.employment_spans
  FOR ALL 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);


-- =============================================================================
-- CASE_STATUS POLICIES
-- =============================================================================
CREATE POLICY "Users can view their own case status" ON public.case_status
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own case status" ON public.case_status
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own case status" ON public.case_status
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own case status" ON public.case_status
  FOR DELETE 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- DOCUMENT_PASSCODES POLICIES
-- =============================================================================
CREATE POLICY "Users can view their own passcode" ON public.document_passcodes
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own passcode" ON public.document_passcodes
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own passcode" ON public.document_passcodes
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own passcode" ON public.document_passcodes
  FOR DELETE 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- DOCUMENTS POLICIES
-- =============================================================================
-- Note: SELECT includes deleted_at IS NULL check for soft delete
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT 
  USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can soft delete their own documents" ON public.documents
  FOR DELETE 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- DOCUMENT_REMINDERS POLICIES
-- =============================================================================
CREATE POLICY "Users can view their own reminders" ON public.document_reminders
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own reminders" ON public.document_reminders
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own reminders" ON public.document_reminders
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own reminders" ON public.document_reminders
  FOR DELETE 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- EMAIL_PREFERENCES POLICIES
-- =============================================================================
CREATE POLICY "Users can view own email preferences" ON public.email_preferences
  FOR SELECT 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own email preferences" ON public.email_preferences
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own email preferences" ON public.email_preferences
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own email preferences" ON public.email_preferences
  FOR DELETE 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- EMAIL_QUEUE POLICIES
-- =============================================================================
-- Users can only view their own email history (read-only)
CREATE POLICY "Users can view own email history" ON public.email_queue
  FOR SELECT 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- PAYMENT_TRANSACTIONS POLICIES
-- =============================================================================
-- Users can only view their own transactions (read-only)
CREATE POLICY "Users can view own transactions" ON public.payment_transactions
  FOR SELECT 
  USING ((select auth.uid()) = user_id);


-- =============================================================================
-- BLOCKED_EMAILS POLICIES
-- =============================================================================
-- Only service role can access (for cron jobs and admin)
CREATE POLICY "Service role only" ON public.blocked_emails
  FOR ALL 
  USING ((select auth.role()) = 'service_role');


-- =============================================================================
-- NOTIFICATION_SETTINGS POLICIES
-- =============================================================================
CREATE POLICY "Users can manage own settings" ON public.notification_settings
  FOR ALL 
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS enabled and policies created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Security Summary:';
  RAISE NOTICE '  • All tables have RLS enabled';
  RAISE NOTICE '  • All policies use (select auth.uid()) for performance';
  RAISE NOTICE '  • Users can only access their own data';
  RAISE NOTICE '  • blocked_emails is service_role only';
  RAISE NOTICE '  • email_queue and payment_transactions are read-only for users';
END $$;
