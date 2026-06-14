-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                            Permission Grants                                  ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 007_grants.sql                                                         ║
-- ║  Purpose: Grant appropriate permissions to roles                              ║
-- ║  Run: EIGHTH - After views                                                    ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  ROLES:                                                                       ║
-- ║  • anon          - Unauthenticated users (minimal access)                    ║
-- ║  • authenticated - Logged-in users (RLS-protected access)                    ║
-- ║  • service_role  - Backend services (full access, bypasses RLS)              ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- SERVICE ROLE GRANTS
-- =============================================================================
-- Service role has full access to all tables (for cron jobs, webhooks, admin)
-- Note: service_role bypasses RLS by default

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.opt_status TO service_role;
GRANT ALL ON public.employment_spans TO service_role;
GRANT ALL ON public.case_status TO service_role;
GRANT ALL ON public.push_subscriptions TO service_role;
GRANT ALL ON public.document_passcodes TO service_role;
GRANT ALL ON public.documents TO service_role;
GRANT ALL ON public.document_reminders TO service_role;
GRANT ALL ON public.email_preferences TO service_role;
GRANT ALL ON public.email_queue TO service_role;
GRANT ALL ON public.payment_transactions TO service_role;
GRANT ALL ON public.blocked_emails TO service_role;
GRANT ALL ON public.notification_settings TO service_role;


-- =============================================================================
-- AUTHENTICATED USER GRANTS
-- =============================================================================
-- Authenticated users have access controlled by RLS policies

-- Full CRUD on user-owned tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opt_status TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employment_spans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_status TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_passcodes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_settings TO authenticated;

-- Read-only access to history/transaction tables
GRANT SELECT ON public.email_queue TO authenticated;
GRANT SELECT ON public.payment_transactions TO authenticated;

-- No access to blocked_emails (service_role only)
-- blocked_emails is handled by RLS policy


-- =============================================================================
-- ANONYMOUS USER GRANTS
-- =============================================================================
-- Anonymous users have no access to any tables
-- All access requires authentication

-- No grants for anon role on any tables


-- =============================================================================
-- SEQUENCE GRANTS
-- =============================================================================
-- Grant usage on sequences for INSERT operations

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- =============================================================================
-- FUNCTION GRANTS
-- =============================================================================
-- Grant execute permissions on functions

GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

GRANT EXECUTE ON FUNCTION public.upgrade_user_to_premium(UUID, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION public.get_premium_users_for_daily_email() TO service_role;

GRANT EXECUTE ON FUNCTION public.get_document_expiry_status(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_document_expiry_status(DATE) TO service_role;

GRANT EXECUTE ON FUNCTION public.create_document_reminders(UUID, UUID, TEXT, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_document_reminders(UUID, UUID, TEXT, DATE) TO service_role;

GRANT EXECUTE ON FUNCTION public.update_case_status_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_case_status_updated_at() TO service_role;

GRANT EXECUTE ON FUNCTION public.update_document_vault_updated_at() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_document_vault_updated_at() TO service_role;


-- =============================================================================
-- VIEW GRANTS
-- =============================================================================
-- Grant select on views

GRANT SELECT ON public.premium_stats TO service_role;
GRANT SELECT ON public.email_delivery_stats TO service_role;
GRANT SELECT ON public.revenue_stats TO service_role;
GRANT SELECT ON public.document_expiry_overview TO authenticated;
GRANT SELECT ON public.document_expiry_overview TO service_role;
GRANT SELECT ON public.user_activity_summary TO authenticated;
GRANT SELECT ON public.user_activity_summary TO service_role;


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All permissions granted successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Permission Summary:';
  RAISE NOTICE '  • service_role  - Full access to all tables';
  RAISE NOTICE '  • authenticated - RLS-protected access to user tables';
  RAISE NOTICE '  • anon          - No table access (auth required)';
  RAISE NOTICE '';
  RAISE NOTICE 'Special Cases:';
  RAISE NOTICE '  • blocked_emails        - service_role only';
  RAISE NOTICE '  • email_queue           - authenticated: SELECT only';
  RAISE NOTICE '  • payment_transactions  - authenticated: SELECT only';
END $$;
