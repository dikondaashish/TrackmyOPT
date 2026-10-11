-- Synthetic fixture: only tables/grants touched by this migration, not a
-- complete replay of production's historical schema.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users(id uuid PRIMARY KEY, email text);
CREATE TABLE public.case_status(id uuid PRIMARY KEY, user_id uuid REFERENCES auth.users ON DELETE CASCADE, receipt_number text);
ALTER TABLE public.case_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY case_owner ON public.case_status FOR DELETE TO authenticated
  USING (user_id = current_setting('test.user_id')::uuid);
CREATE POLICY case_owner_read ON public.case_status FOR SELECT TO authenticated
  USING (user_id = current_setting('test.user_id')::uuid);
GRANT SELECT, DELETE ON public.case_status TO authenticated;
CREATE TABLE public.uscis_check_log(id bigserial PRIMARY KEY, receipt_number text NOT NULL, success boolean, source text, error_message text);
CREATE TABLE public.uscis_api_audit(id uuid DEFAULT gen_random_uuid(), user_id uuid, receipt_number_hash text NOT NULL, allowed boolean, reason text, call_site text);
CREATE TABLE public.uscis_case_cache(receipt_number text, quarantined boolean NOT NULL);
CREATE TABLE public.email_queue(user_id uuid REFERENCES auth.users ON DELETE CASCADE, email_type text, email_data jsonb);
CREATE TABLE public.blocked_emails(email text, reason text);
CREATE TABLE public.policy_notice_email_events(user_id uuid, email text);
INSERT INTO auth.users VALUES
 ('10000000-0000-0000-0000-000000000001','one@example.test'),
 ('10000000-0000-0000-0000-000000000002','two@example.test');
INSERT INTO public.case_status VALUES
 ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','IOE0000000001'),
 ('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','IOE0000000001'),
 ('00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000002','IOE0000000003');
INSERT INTO public.uscis_case_cache VALUES ('IOE0000000001',false),('IOE0000000001',true);
INSERT INTO public.uscis_check_log(receipt_number,success,source) VALUES ('IOE0000000001',true,'legacy');
-- APPLY MIGRATION HERE

CREATE FUNCTION public.test_assert(ok boolean, message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION '%', message; END IF; END $$;
INSERT INTO public.uscis_check_log(case_id,receipt_number,success,source,error_message)
 VALUES ('00000000-0000-0000-0000-000000000001','IOE0000000001',true,'cron','private upstream text'),
 ('00000000-0000-0000-0000-000000000002','IOE0000000001',true,'cron',null);
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.uscis_check_log WHERE error_message IS NOT NULL),'log retained upstream text');
INSERT INTO public.uscis_api_audit(user_id,receipt_number_hash,allowed,reason,call_site)
 SELECT user_id, encode(sha256(convert_to(receipt_number,'UTF8')),'hex'), true,'enrolled','test' FROM public.case_status;
INSERT INTO public.email_queue VALUES
 ('10000000-0000-0000-0000-000000000001','case_status_change','{"receipt_number":"IOE0000000001","new_status":"Received"}'),
 ('10000000-0000-0000-0000-000000000002','case_status_change','{"receipt_number":"IOE0000000001","new_status":"Received"}');
-- Direct authenticated deletion may not delete a different user's case.
SET ROLE authenticated;
SET test.user_id = '10000000-0000-0000-0000-000000000001';
DELETE FROM public.case_status WHERE id = '00000000-0000-0000-0000-000000000002';
DELETE FROM public.case_status WHERE id = '00000000-0000-0000-0000-000000000001';
RESET ROLE;
SELECT public.test_assert((SELECT count(*) FROM public.case_status WHERE receipt_number='IOE0000000001')=1,'shared case deleted');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_check_log WHERE receipt_number='IOE0000000001')=2,'shared logs not preserved');
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.uscis_api_audit WHERE user_id='10000000-0000-0000-0000-000000000001'),'removed user audit retained');
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.email_queue WHERE user_id='10000000-0000-0000-0000-000000000001'),'removed case email retained');
DELETE FROM public.case_status WHERE id = '00000000-0000-0000-0000-000000000002';
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.uscis_check_log WHERE receipt_number='IOE0000000001'),'last-case raw logs retained');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_case_cache)=1 AND (SELECT bool_and(quarantined) FROM public.uscis_case_cache),'quarantine lost or ordinary cache retained');
-- Late writes and denied lookups keep only content-free counters.
INSERT INTO public.uscis_check_log(case_id,receipt_number,success,source) VALUES
 ('00000000-0000-0000-0000-000000000001','IOE0000000001',true,'cron'),
 (NULL,'IOE0000000001',false,'legacy');
INSERT INTO public.uscis_api_audit VALUES (gen_random_uuid(),'10000000-0000-0000-0000-000000000001',encode(sha256(convert_to('IOE0000000001','UTF8')),'hex'),true,'enrolled','test');
INSERT INTO public.uscis_api_audit VALUES (gen_random_uuid(),'10000000-0000-0000-0000-000000000001','unregistered-hash',false,'receipt_not_enrolled_for_user','test');
INSERT INTO public.email_queue VALUES ('10000000-0000-0000-0000-000000000001','case_status_change','{"receipt_number":"IOE0000000001"}');
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.uscis_check_log WHERE receipt_number='IOE0000000001'),'late check log recreated');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit)=1,'late audit recreated');
SELECT public.test_assert((SELECT count(*) FROM public.email_queue)=0,'late email recreated');
SELECT public.test_assert((SELECT lookups_allowed=3 AND lookups_blocked=2 AND checks_succeeded=3 AND checks_failed=1 FROM public.uscis_operational_daily),'daily totals incorrect');
SELECT public.test_assert(NOT has_table_privilege('anon','public.uscis_operational_daily','SELECT'),'anon reads metrics');
SELECT public.test_assert(NOT has_table_privilege('authenticated','public.uscis_operational_daily','SELECT'),'user reads metrics');
SELECT public.test_assert(NOT has_function_privilege('authenticated','public.purge_removed_case_data()','EXECUTE'),'user executes privileged function');
SELECT public.test_assert((SELECT relrowsecurity AND relforcerowsecurity FROM pg_class WHERE oid='public.uscis_operational_daily'::regclass),'RLS missing');
-- An unexpected cleanup failure rolls back the case deletion and its cascades.
INSERT INTO public.uscis_case_cache VALUES ('IOE0000000003',false);
CREATE FUNCTION public.test_fail_cleanup() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic cleanup failure'; END $$;
CREATE TRIGGER test_fail_cleanup BEFORE DELETE ON public.uscis_case_cache FOR EACH ROW EXECUTE FUNCTION public.test_fail_cleanup();
DO $$ BEGIN
 BEGIN
   DELETE FROM public.case_status WHERE id='00000000-0000-0000-0000-000000000003';
   RAISE EXCEPTION 'cleanup failure was swallowed';
 EXCEPTION WHEN raise_exception THEN
   IF SQLERRM <> 'synthetic cleanup failure' THEN RAISE; END IF;
 END;
END $$;
SELECT public.test_assert(EXISTS (SELECT 1 FROM public.case_status WHERE id='00000000-0000-0000-0000-000000000003'),'partial failure removed enrollment');
DROP TRIGGER test_fail_cleanup ON public.uscis_case_cache;
-- Delete via Auth too (another user remains for concurrency test).
INSERT INTO public.blocked_emails VALUES ('one@example.test','account_deleted'),('one@example.test','fraud');
INSERT INTO public.policy_notice_email_events VALUES ('10000000-0000-0000-0000-000000000001','one@example.test');
DELETE FROM auth.users WHERE id='10000000-0000-0000-0000-000000000001';
SELECT public.test_assert((SELECT count(*) FROM public.blocked_emails)=1 AND (SELECT bool_and(reason='fraud') FROM public.blocked_emails),'email block cleanup incorrect');
SELECT public.test_assert(NOT EXISTS (SELECT 1 FROM public.policy_notice_email_events),'policy notice email retained');
