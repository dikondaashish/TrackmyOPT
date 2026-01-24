-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT DATABASE                                 ║
-- ║                              Database Views                                   ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  File: 006_views.sql                                                          ║
-- ║  Purpose: Create all database views for analytics and reporting              ║
-- ║  Run: SEVENTH - After triggers                                                ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  SECURITY: All views use SECURITY INVOKER (default in PostgreSQL 15+)        ║
-- ║  This ensures views respect the RLS policies of the querying user            ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- DROP EXISTING VIEWS (for idempotent migrations)
-- =============================================================================
DROP VIEW IF EXISTS public.premium_stats;
DROP VIEW IF EXISTS public.email_delivery_stats;
DROP VIEW IF EXISTS public.revenue_stats;
DROP VIEW IF EXISTS public.document_expiry_overview;
DROP VIEW IF EXISTS public.user_activity_summary;


-- =============================================================================
-- VIEW: premium_stats
-- =============================================================================
-- Purpose: Statistics about premium vs free users
-- Access: Admin/Analytics only (no RLS bypass)
-- Security: SECURITY INVOKER - respects RLS
-- -----------------------------------------------------------------------------
CREATE VIEW public.premium_stats
WITH (security_invoker = on)
AS
SELECT 
  COUNT(*) FILTER (WHERE premium_status = TRUE) AS total_premium_users,
  COUNT(*) FILTER (WHERE premium_status = FALSE) AS total_free_users,
  COUNT(*) AS total_users,
  ROUND(
    (COUNT(*) FILTER (WHERE premium_status = TRUE)::NUMERIC / 
     NULLIF(COUNT(*), 0)::NUMERIC) * 100, 
    2
  ) AS premium_percentage
FROM public.profiles;

COMMENT ON VIEW public.premium_stats IS 
  'Statistics about premium vs free users - Admin only';


-- =============================================================================
-- VIEW: email_delivery_stats
-- =============================================================================
-- Purpose: Email delivery statistics for the last 30 days
-- Access: Admin/Analytics only
-- Security: SECURITY INVOKER - respects RLS
-- -----------------------------------------------------------------------------
CREATE VIEW public.email_delivery_stats
WITH (security_invoker = on)
AS
SELECT 
  email_type,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') AS delivered,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed,
  COUNT(*) FILTER (WHERE status = 'bounced') AS bounced,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) AS opened,
  COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) AS clicked,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / 
     NULLIF(COUNT(*), 0)::NUMERIC) * 100,
    2
  ) AS delivery_rate,
  ROUND(
    (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE status = 'sent'), 0)::NUMERIC) * 100,
    2
  ) AS open_rate
FROM public.email_queue
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY email_type;

COMMENT ON VIEW public.email_delivery_stats IS 
  'Email delivery statistics for the last 30 days';


-- =============================================================================
-- VIEW: revenue_stats
-- =============================================================================
-- Purpose: Revenue and payment statistics
-- Access: Admin/Analytics only
-- Security: SECURITY INVOKER - respects RLS
-- -----------------------------------------------------------------------------
CREATE VIEW public.revenue_stats
WITH (security_invoker = on)
AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'succeeded') AS total_successful_payments,
  SUM(amount) FILTER (WHERE status = 'succeeded') AS total_revenue_cents,
  ROUND(
    SUM(amount) FILTER (WHERE status = 'succeeded')::NUMERIC / 100, 
    2
  ) AS total_revenue_dollars,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'succeeded') AS unique_paying_users,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_payments,
  COUNT(*) FILTER (WHERE status = 'refunded') AS refunded_payments
FROM public.payment_transactions;

COMMENT ON VIEW public.revenue_stats IS 
  'Revenue and payment statistics';


-- =============================================================================
-- VIEW: document_expiry_overview
-- =============================================================================
-- Purpose: Overview of documents by expiry status
-- Access: Users can see their own documents (via RLS on documents table)
-- Security: SECURITY INVOKER - respects RLS
-- -----------------------------------------------------------------------------
CREATE VIEW public.document_expiry_overview
WITH (security_invoker = on)
AS
SELECT 
  user_id,
  COUNT(*) AS total_documents,
  COUNT(*) FILTER (WHERE expiry_date IS NULL) AS no_expiry,
  COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE) AS expired,
  COUNT(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 7) AS expiring_7_days,
  COUNT(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE + 8 AND CURRENT_DATE + 30) AS expiring_30_days,
  COUNT(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE + 31 AND CURRENT_DATE + 90) AS expiring_90_days,
  COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE + 90) AS valid
FROM public.documents
WHERE deleted_at IS NULL
GROUP BY user_id;

COMMENT ON VIEW public.document_expiry_overview IS 
  'Overview of documents by expiry status - respects RLS';


-- =============================================================================
-- VIEW: user_activity_summary
-- =============================================================================
-- Purpose: Summary of user activity across the platform
-- Access: Users can see their own activity (via RLS)
-- Security: SECURITY INVOKER - respects RLS
-- -----------------------------------------------------------------------------
CREATE VIEW public.user_activity_summary
WITH (security_invoker = on)
AS
SELECT 
  p.user_id,
  p.email,
  p.premium_status,
  p.created_at AS signup_date,
  os.updated_at AS last_opt_update,
  (SELECT COUNT(*) FROM public.employment_spans es WHERE es.user_id = p.user_id) AS employment_records,
  (SELECT COUNT(*) FROM public.documents d WHERE d.user_id = p.user_id AND d.deleted_at IS NULL) AS documents_count,
  (SELECT COUNT(*) FROM public.email_queue eq WHERE eq.user_id = p.user_id) AS emails_sent
FROM public.profiles p
LEFT JOIN public.opt_status os ON p.user_id = os.user_id;

COMMENT ON VIEW public.user_activity_summary IS 
  'Summary of user activity across the platform - respects RLS';


-- =============================================================================
-- VERIFICATION
-- =============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All views created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Views (all with SECURITY INVOKER):';
  RAISE NOTICE '  • premium_stats           - Premium user statistics';
  RAISE NOTICE '  • email_delivery_stats    - Email delivery metrics';
  RAISE NOTICE '  • revenue_stats           - Payment/revenue metrics';
  RAISE NOTICE '  • document_expiry_overview - Document expiry summary';
  RAISE NOTICE '  • user_activity_summary   - User activity overview';
END $$;
