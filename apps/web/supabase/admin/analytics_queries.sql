-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT ADMIN SCRIPT                             ║
-- ║                           Analytics Queries                                   ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Purpose: Business analytics and metrics                                      ║
-- ║  Run: Supabase SQL Editor                                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- USER METRICS
-- =============================================================================

-- Total users and premium conversion
SELECT 
  '--- USER METRICS ---' as section,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE premium_status = TRUE) as premium_users,
  COUNT(*) FILTER (WHERE premium_status = FALSE) as free_users,
  ROUND(
    COUNT(*) FILTER (WHERE premium_status = TRUE)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as conversion_rate_percent
FROM public.profiles;


-- New users by day (last 30 days)
SELECT 
  DATE(created_at) as signup_date,
  COUNT(*) as new_users,
  COUNT(*) FILTER (WHERE premium_status = TRUE) as premium_signups
FROM public.profiles
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;


-- =============================================================================
-- REVENUE METRICS
-- =============================================================================

-- Total revenue
SELECT 
  '--- REVENUE METRICS ---' as section,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
  SUM(amount) FILTER (WHERE status = 'succeeded') / 100.0 as total_revenue_usd,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'succeeded') as unique_paying_users,
  AVG(amount) FILTER (WHERE status = 'succeeded') / 100.0 as avg_payment_usd
FROM public.payment_transactions;


-- Revenue by day (last 30 days)
SELECT 
  DATE(created_at) as payment_date,
  COUNT(*) as transactions,
  SUM(amount) / 100.0 as revenue_usd
FROM public.payment_transactions
WHERE status = 'succeeded'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY payment_date DESC;


-- =============================================================================
-- EMAIL METRICS
-- =============================================================================

-- Email delivery stats by type
SELECT 
  '--- EMAIL METRICS ---' as section,
  email_type,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') as delivered,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as opened,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as delivery_rate_percent,
  ROUND(
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::NUMERIC / 
    NULLIF(COUNT(*) FILTER (WHERE status = 'sent'), 0) * 100, 
    2
  ) as open_rate_percent
FROM public.email_queue
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY email_type
ORDER BY total_sent DESC;


-- =============================================================================
-- DOCUMENT VAULT METRICS
-- =============================================================================

-- Document upload stats
SELECT 
  '--- DOCUMENT METRICS ---' as section,
  COUNT(*) as total_documents,
  COUNT(DISTINCT user_id) as users_with_documents,
  COUNT(*) FILTER (WHERE ai_analyzed = TRUE) as ai_analyzed,
  COUNT(*) FILTER (WHERE expiry_date IS NOT NULL) as with_expiry_date
FROM public.documents
WHERE deleted_at IS NULL;


-- Documents by type
SELECT 
  document_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE expiry_date < CURRENT_DATE) as expired,
  COUNT(*) FILTER (WHERE expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + 30) as expiring_soon
FROM public.documents
WHERE deleted_at IS NULL
GROUP BY document_type
ORDER BY count DESC;


-- =============================================================================
-- CASE STATUS METRICS
-- =============================================================================

-- Case tracking usage
SELECT 
  '--- CASE STATUS METRICS ---' as section,
  COUNT(*) as total_cases_tracked,
  COUNT(DISTINCT user_id) as users_tracking_cases,
  COUNT(*) FILTER (WHERE notifications_enabled = TRUE) as with_notifications_enabled
FROM public.case_status;


-- Cases by type
SELECT 
  case_type,
  COUNT(*) as count
FROM public.case_status
WHERE case_type IS NOT NULL
GROUP BY case_type
ORDER BY count DESC;


-- =============================================================================
-- ENGAGEMENT METRICS
-- =============================================================================

-- Active users (updated OPT status in last 7 days)
SELECT 
  '--- ENGAGEMENT METRICS ---' as section,
  COUNT(DISTINCT user_id) as active_users_7d
FROM public.opt_status
WHERE updated_at > NOW() - INTERVAL '7 days';


-- Users with complete profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE first_name IS NOT NULL) as with_first_name,
  COUNT(*) FILTER (WHERE notification_email IS NOT NULL) as with_notification_email,
  COUNT(*) FILTER (WHERE opt_apply_email IS NOT NULL OR opt_clock_email IS NOT NULL) as with_tool_emails
FROM public.profiles;


-- =============================================================================
-- FEATURE USAGE
-- =============================================================================

-- Feature adoption rates
SELECT 
  '--- FEATURE USAGE ---' as section,
  (SELECT COUNT(*) FROM public.profiles) as total_users,
  (SELECT COUNT(DISTINCT user_id) FROM public.opt_status) as using_opt_tracking,
  (SELECT COUNT(DISTINCT user_id) FROM public.employment_spans) as using_employment_tracking,
  (SELECT COUNT(DISTINCT user_id) FROM public.case_status) as using_case_tracking,
  (SELECT COUNT(DISTINCT user_id) FROM public.documents WHERE deleted_at IS NULL) as using_document_vault,
  (SELECT COUNT(DISTINCT user_id) FROM public.document_passcodes) as with_vault_passcode;
