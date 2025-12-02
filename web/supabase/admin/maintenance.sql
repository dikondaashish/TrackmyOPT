-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║                           TRACKMYOPT ADMIN SCRIPT                             ║
-- ║                          Database Maintenance                                 ║
-- ╠══════════════════════════════════════════════════════════════════════════════╣
-- ║  Purpose: Database maintenance and cleanup tasks                              ║
-- ║  Run: Supabase SQL Editor (with caution!)                                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- =============================================================================
-- HEALTH CHECKS
-- =============================================================================

-- Check table sizes
SELECT 
  '--- TABLE SIZES ---' as section,
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname || '.' || tablename)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;


-- Check index usage
SELECT 
  '--- INDEX USAGE ---' as section,
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;


-- Check for unused indexes (potential cleanup candidates)
SELECT 
  '--- UNUSED INDEXES ---' as section,
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;


-- =============================================================================
-- CLEANUP TASKS
-- =============================================================================

-- Clean up old email queue entries (older than 90 days)
-- UNCOMMENT TO RUN
/*
DELETE FROM public.email_queue
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status IN ('sent', 'failed', 'bounced');
*/


-- Clean up soft-deleted documents (older than 30 days)
-- UNCOMMENT TO RUN
/*
DELETE FROM public.documents
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '30 days';
*/


-- Clean up expired document reminders
-- UNCOMMENT TO RUN
/*
DELETE FROM public.document_reminders
WHERE status = 'sent'
  AND sent_at < NOW() - INTERVAL '30 days';
*/


-- =============================================================================
-- DATA INTEGRITY CHECKS
-- =============================================================================

-- Find orphaned records (profiles without auth.users)
SELECT 
  '--- ORPHANED PROFILES ---' as section,
  p.user_id,
  p.email,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;


-- Find users without profiles (should not happen)
SELECT 
  '--- USERS WITHOUT PROFILES ---' as section,
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;


-- Find documents with invalid user references
SELECT 
  '--- ORPHANED DOCUMENTS ---' as section,
  d.id,
  d.user_id,
  d.file_name
FROM public.documents d
LEFT JOIN public.profiles p ON d.user_id = p.user_id
WHERE p.user_id IS NULL;


-- =============================================================================
-- VACUUM AND ANALYZE
-- =============================================================================
-- Run these periodically for optimal performance
-- Note: Supabase runs these automatically, but you can trigger manually

-- UNCOMMENT TO RUN
/*
VACUUM ANALYZE public.profiles;
VACUUM ANALYZE public.opt_status;
VACUUM ANALYZE public.employment_spans;
VACUUM ANALYZE public.case_status;
VACUUM ANALYZE public.documents;
VACUUM ANALYZE public.document_reminders;
VACUUM ANALYZE public.email_queue;
VACUUM ANALYZE public.payment_transactions;
*/


-- =============================================================================
-- BACKUP VERIFICATION
-- =============================================================================

-- Count records in all tables (for backup verification)
SELECT 
  '--- RECORD COUNTS ---' as section,
  'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL SELECT 'opt_status', COUNT(*) FROM public.opt_status
UNION ALL SELECT 'employment_spans', COUNT(*) FROM public.employment_spans
UNION ALL SELECT 'case_status', COUNT(*) FROM public.case_status
UNION ALL SELECT 'document_passcodes', COUNT(*) FROM public.document_passcodes
UNION ALL SELECT 'documents', COUNT(*) FROM public.documents
UNION ALL SELECT 'document_reminders', COUNT(*) FROM public.document_reminders
UNION ALL SELECT 'email_preferences', COUNT(*) FROM public.email_preferences
UNION ALL SELECT 'email_queue', COUNT(*) FROM public.email_queue
UNION ALL SELECT 'payment_transactions', COUNT(*) FROM public.payment_transactions
UNION ALL SELECT 'blocked_emails', COUNT(*) FROM public.blocked_emails
UNION ALL SELECT 'notification_settings', COUNT(*) FROM public.notification_settings;
