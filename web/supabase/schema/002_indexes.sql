-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                              Database Indexes                                 ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 002_indexes.sql                                                        ║
-- ║  Purpose: Create all database indexes for query performance                   ║
-- ║  Run: THIRD - After tables                                                    ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- PROFILES INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_premium_status 
  ON public.profiles(premium_status);

CREATE INDEX IF NOT EXISTS idx_profiles_email 
  ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_profiles_notification_email 
  ON public.profiles(notification_email) 
  WHERE notification_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_opt_apply_email 
  ON public.profiles(opt_apply_email) 
  WHERE opt_apply_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_opt_clock_email 
  ON public.profiles(opt_clock_email) 
  WHERE opt_clock_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stem_apply_email 
  ON public.profiles(stem_apply_email) 
  WHERE stem_apply_email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_stem_clock_email 
  ON public.profiles(stem_clock_email) 
  WHERE stem_clock_email IS NOT NULL;


-- =============================================================================
-- EMPLOYMENT_SPANS INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_employment_spans_user_id 
  ON public.employment_spans(user_id);

CREATE INDEX IF NOT EXISTS idx_employment_spans_dates 
  ON public.employment_spans(user_id, start_date, end_date);


-- =============================================================================
-- CASE_STATUS INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_case_status_user_id 
  ON public.case_status(user_id);

CREATE INDEX IF NOT EXISTS idx_case_status_receipt_number 
  ON public.case_status(receipt_number);

CREATE INDEX IF NOT EXISTS idx_case_status_last_checked 
  ON public.case_status(last_checked_at);


-- =============================================================================
-- DOCUMENT_PASSCODES INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_document_passcodes_user_id 
  ON public.document_passcodes(user_id);


-- =============================================================================
-- DOCUMENTS INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id 
  ON public.documents(user_id);

CREATE INDEX IF NOT EXISTS idx_documents_document_type 
  ON public.documents(document_type);

CREATE INDEX IF NOT EXISTS idx_documents_user_category 
  ON public.documents(user_id, category);

CREATE INDEX IF NOT EXISTS idx_documents_expiry_date 
  ON public.documents(expiry_date) 
  WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_documents_deleted_at 
  ON public.documents(deleted_at);

CREATE INDEX IF NOT EXISTS idx_documents_uploaded_at 
  ON public.documents(uploaded_at DESC);


-- =============================================================================
-- DOCUMENT_REMINDERS INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_document_reminders_user_id 
  ON public.document_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_document_reminders_document_id 
  ON public.document_reminders(document_id);

CREATE INDEX IF NOT EXISTS idx_document_reminders_send_at 
  ON public.document_reminders(send_at);

CREATE INDEX IF NOT EXISTS idx_document_reminders_status 
  ON public.document_reminders(status);


-- =============================================================================
-- EMAIL_PREFERENCES INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id 
  ON public.email_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_email_preferences_email_address 
  ON public.email_preferences(email_address);

CREATE INDEX IF NOT EXISTS idx_email_preferences_verified 
  ON public.email_preferences(email_verified);


-- =============================================================================
-- EMAIL_QUEUE INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id 
  ON public.email_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_email_queue_status 
  ON public.email_queue(status);

CREATE INDEX IF NOT EXISTS idx_email_queue_sent_at 
  ON public.email_queue(sent_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_created_at 
  ON public.email_queue(created_at);

CREATE INDEX IF NOT EXISTS idx_email_queue_email_type 
  ON public.email_queue(email_type);


-- =============================================================================
-- PAYMENT_TRANSACTIONS INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id 
  ON public.payment_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
  ON public.payment_transactions(status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_payment_intent 
  ON public.payment_transactions(stripe_payment_intent_id);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at 
  ON public.payment_transactions(created_at);


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All indexes created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Index Summary:';
  RAISE NOTICE '  • profiles              - 7 indexes';
  RAISE NOTICE '  • employment_spans      - 2 indexes';
  RAISE NOTICE '  • case_status           - 3 indexes';
  RAISE NOTICE '  • document_passcodes    - 1 index';
  RAISE NOTICE '  • documents             - 6 indexes';
  RAISE NOTICE '  • document_reminders    - 4 indexes';
  RAISE NOTICE '  • email_preferences     - 3 indexes';
  RAISE NOTICE '  • email_queue           - 5 indexes';
  RAISE NOTICE '  • payment_transactions  - 4 indexes';
END $$;
