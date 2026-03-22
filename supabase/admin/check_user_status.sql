-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT ADMIN SCRIPT                             ║
-- ║                            Check User Status                                  ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Purpose: View complete user information for debugging                        ║
-- ║  Run: Supabase SQL Editor                                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- FIND USER BY EMAIL
-- =============================================================================
-- Replace 'user@example.com' with the actual email address

SELECT 
  '--- PROFILE ---' as section,
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.timezone,
  p.is_stem_eligible,
  p.premium_status,
  p.premium_purchased_at,
  p.stripe_customer_id,
  p.notification_email,
  p.opt_apply_email,
  p.opt_clock_email,
  p.stem_apply_email,
  p.stem_clock_email,
  p.created_at
FROM public.profiles p
WHERE p.email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- CHECK OPT STATUS
-- =============================================================================

SELECT 
  '--- OPT STATUS ---' as section,
  os.user_id,
  os.program_end_date,
  os.dso_recommendation_date,
  os.opt_start_date,
  os.opt_ead_end_date,
  os.stem_start_date,
  os.last_updated_field,
  os.created_at,
  os.updated_at
FROM public.opt_status os
JOIN public.profiles p ON os.user_id = p.user_id
WHERE p.email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- CHECK EMPLOYMENT HISTORY
-- =============================================================================

SELECT 
  '--- EMPLOYMENT ---' as section,
  es.id,
  es.employer_name,
  es.start_date,
  es.end_date,
  CASE WHEN es.end_date IS NULL THEN 'Current' ELSE 'Past' END as status,
  es.created_at
FROM public.employment_spans es
JOIN public.profiles p ON es.user_id = p.user_id
WHERE p.email = 'user@example.com'  -- ← CHANGE THIS
ORDER BY es.start_date DESC;


-- =============================================================================
-- CHECK CASE STATUS
-- =============================================================================

SELECT 
  '--- CASE STATUS ---' as section,
  cs.receipt_number,
  cs.current_status,
  cs.case_type,
  cs.last_checked_at,
  cs.last_status_change_at,
  cs.notifications_enabled,
  cs.created_at
FROM public.case_status cs
JOIN public.profiles p ON cs.user_id = p.user_id
WHERE p.email = 'user@example.com';  -- ← CHANGE THIS


-- =============================================================================
-- CHECK DOCUMENTS
-- =============================================================================

SELECT 
  '--- DOCUMENTS ---' as section,
  d.id,
  d.file_name,
  d.document_type,
  d.expiry_date,
  public.get_document_expiry_status(d.expiry_date) as expiry_status,
  d.ai_analyzed,
  d.created_at
FROM public.documents d
JOIN public.profiles p ON d.user_id = p.user_id
WHERE p.email = 'user@example.com'  -- ← CHANGE THIS
  AND d.deleted_at IS NULL
ORDER BY d.created_at DESC;


-- =============================================================================
-- CHECK PAYMENT HISTORY
-- =============================================================================

SELECT 
  '--- PAYMENTS ---' as section,
  pt.stripe_payment_intent_id,
  pt.amount / 100.0 as amount_dollars,
  pt.currency,
  pt.status,
  pt.payment_method_type,
  pt.created_at
FROM public.payment_transactions pt
JOIN public.profiles p ON pt.user_id = p.user_id
WHERE p.email = 'user@example.com'  -- ← CHANGE THIS
ORDER BY pt.created_at DESC;


-- =============================================================================
-- CHECK EMAIL HISTORY
-- =============================================================================

SELECT 
  '--- EMAILS ---' as section,
  eq.email_type,
  eq.email_subject,
  eq.status,
  eq.sent_at,
  eq.opened_at,
  eq.created_at
FROM public.email_queue eq
JOIN public.profiles p ON eq.user_id = p.user_id
WHERE p.email = 'user@example.com'  -- ← CHANGE THIS
ORDER BY eq.created_at DESC
LIMIT 10;
