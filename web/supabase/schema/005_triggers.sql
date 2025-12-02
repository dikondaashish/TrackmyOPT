-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                              Database Triggers                                ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 005_triggers.sql                                                       ║
-- ║  Purpose: Create all database triggers                                        ║
-- ║  Run: SIXTH - After functions                                                 ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- DROP EXISTING TRIGGERS (for idempotent migrations)
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_opt_status_updated_at ON public.opt_status;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_case_status_updated_at_trigger ON public.case_status;
DROP TRIGGER IF EXISTS update_document_passcodes_updated_at ON public.document_passcodes;
DROP TRIGGER IF EXISTS update_documents_updated_at ON public.documents;
DROP TRIGGER IF EXISTS update_document_reminders_updated_at ON public.document_reminders;
DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON public.email_preferences;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.notification_settings;


-- =============================================================================
-- AUTH TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: on_auth_user_created
-- Purpose: Automatically create a profile when a new user signs up
-- Table: auth.users
-- Function: handle_new_user()
-- -----------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 
  'Creates a profile record when a new user signs up';


-- =============================================================================
-- PROFILES TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_profiles_updated_at
-- Purpose: Auto-update updated_at timestamp on profile changes
-- Table: profiles
-- Function: update_updated_at_column()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- OPT_STATUS TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_opt_status_updated_at
-- Purpose: Auto-update updated_at timestamp on OPT status changes
-- Table: opt_status
-- Function: update_updated_at_column()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_opt_status_updated_at
  BEFORE UPDATE ON public.opt_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- CASE_STATUS TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_case_status_updated_at_trigger
-- Purpose: Auto-update updated_at timestamp on case status changes
-- Table: case_status
-- Function: update_case_status_updated_at()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_case_status_updated_at_trigger
  BEFORE UPDATE ON public.case_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_case_status_updated_at();


-- =============================================================================
-- DOCUMENT VAULT TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_document_passcodes_updated_at
-- Purpose: Auto-update updated_at timestamp on passcode changes
-- Table: document_passcodes
-- Function: update_document_vault_updated_at()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_document_passcodes_updated_at
  BEFORE UPDATE ON public.document_passcodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_vault_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: update_documents_updated_at
-- Purpose: Auto-update updated_at timestamp on document changes
-- Table: documents
-- Function: update_document_vault_updated_at()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_vault_updated_at();

-- -----------------------------------------------------------------------------
-- Trigger: update_document_reminders_updated_at
-- Purpose: Auto-update updated_at timestamp on reminder changes
-- Table: document_reminders
-- Function: update_document_vault_updated_at()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_document_reminders_updated_at
  BEFORE UPDATE ON public.document_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_document_vault_updated_at();


-- =============================================================================
-- EMAIL TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_email_preferences_updated_at
-- Purpose: Auto-update updated_at timestamp on email preference changes
-- Table: email_preferences
-- Function: update_updated_at_column()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON public.email_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- PAYMENT TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_payment_transactions_updated_at
-- Purpose: Auto-update updated_at timestamp on payment transaction changes
-- Table: payment_transactions
-- Function: update_updated_at_column()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- NOTIFICATION TRIGGERS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Trigger: update_notification_settings_updated_at
-- Purpose: Auto-update updated_at timestamp on notification settings changes
-- Table: notification_settings
-- Function: update_updated_at_column()
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All triggers created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Triggers:';
  RAISE NOTICE '  • on_auth_user_created              - Auto-create profile on signup';
  RAISE NOTICE '  • update_profiles_updated_at        - Auto-update profiles.updated_at';
  RAISE NOTICE '  • update_opt_status_updated_at      - Auto-update opt_status.updated_at';
  RAISE NOTICE '  • update_case_status_updated_at     - Auto-update case_status.updated_at';
  RAISE NOTICE '  • update_document_passcodes_updated_at';
  RAISE NOTICE '  • update_documents_updated_at';
  RAISE NOTICE '  • update_document_reminders_updated_at';
  RAISE NOTICE '  • update_email_preferences_updated_at';
  RAISE NOTICE '  • update_payment_transactions_updated_at';
  RAISE NOTICE '  • update_notification_settings_updated_at';
END $$;
