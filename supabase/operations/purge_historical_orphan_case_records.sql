-- NOT a migration; NOT executed by the application or this release.
-- Requires the owner's action-time confirmation for a permanent historical
-- purge. Set trackmyopt.historical_case_purge_approved to 'yes' only after
-- reviewing the same predicates/counts. No aggregate backfill.
BEGIN;
SET LOCAL statement_timeout = '15s';
DO $approval$
BEGIN
  IF current_setting('trackmyopt.historical_case_purge_approved', true) IS DISTINCT FROM 'yes' THEN
    RAISE EXCEPTION 'Historical purge requires explicit owner confirmation';
  END IF;
END $approval$;

-- Stabilize enrollment/Auth checks for this short maintenance transaction.
LOCK TABLE public.case_status IN SHARE MODE;
LOCK TABLE auth.users IN SHARE MODE;
LOCK TABLE public.uscis_case_cache IN SHARE MODE;

-- Conservative evidence exclusion: do not touch any quarantined cache row
-- OR historical diagnostic tied to a receipt present in that quarantine.
DELETE FROM public.uscis_check_log l
WHERE NOT EXISTS (
  SELECT 1 FROM public.case_status c
  WHERE upper(trim(c.receipt_number)) = upper(trim(l.receipt_number))
)
AND NOT EXISTS (
  SELECT 1 FROM public.uscis_case_cache q
  WHERE q.quarantined
    AND upper(trim(q.receipt_number)) = upper(trim(l.receipt_number))
);

DELETE FROM public.uscis_api_audit a
WHERE a.user_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = a.user_id)
  AND NOT EXISTS (
    SELECT 1 FROM public.uscis_case_cache q
    WHERE q.quarantined
      AND encode(sha256(convert_to(upper(trim(q.receipt_number)), 'UTF8')), 'hex') = a.receipt_number_hash
  );

DELETE FROM public.blocked_emails b
WHERE b.reason = 'account_deleted'
  AND NOT EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(b.email));
COMMIT;
