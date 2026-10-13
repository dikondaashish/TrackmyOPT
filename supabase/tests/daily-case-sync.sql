CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE TABLE public.profiles(user_id uuid PRIMARY KEY,premium_status boolean,subscription_expires_at timestamptz);
CREATE TABLE public.case_status(
 id uuid PRIMARY KEY,user_id uuid,receipt_number text,current_status text,case_type text,received_date text,
 status_history jsonb,last_checked_at timestamptz,last_status_change_at timestamptz,last_check_failed_at timestamptz,
 last_check_error_code text,last_check_error_message text
);
GRANT SELECT,INSERT,UPDATE ON public.case_status TO authenticated;
GRANT SELECT,UPDATE ON public.case_status TO service_role; GRANT SELECT ON public.profiles TO service_role;
INSERT INTO public.profiles VALUES
 ('10000000-0000-0000-0000-000000000001',false,NULL),
 ('10000000-0000-0000-0000-000000000002',true,NULL),
 ('10000000-0000-0000-0000-000000000003',true,now()-interval '1 day');
INSERT INTO public.case_status(id,user_id,receipt_number,current_status) VALUES
 ('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','IOE0000000001','Received'),
 ('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','IOE0000000002','Received'),
 ('00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','IOE0000000003','Received'),
 ('00000000-0000-0000-0000-000000000004','10000000-0000-0000-0000-000000000001','IOE0000000004','Received');
-- APPLY MIGRATION HERE
CREATE FUNCTION public.test_assert(ok boolean,message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION '%',message; END IF; END $$;
SELECT public.test_assert(NOT has_column_privilege('authenticated','public.case_status','last_manual_check_at','UPDATE'),'client can reset cooldown');
SELECT public.test_assert(NOT has_column_privilege('authenticated','public.case_status','free_first_refresh_pending','INSERT'),'client can set internal display state');
SELECT public.test_assert(has_column_privilege('authenticated','public.case_status','current_status','UPDATE'),'old client write grant changed');
SELECT public.test_assert(NOT has_function_privilege('authenticated','public.prepare_case_refresh(uuid,uuid)','EXECUTE'),'user can execute privileged refresh');
SELECT public.test_assert(NOT has_function_privilege('anon','public.acquire_uscis_request(text)','EXECUTE'),'anon can acquire allowance');
SELECT public.test_assert(NOT has_table_privilege('authenticated','public.uscis_request_budget','SELECT'),'quota readable');
SELECT public.test_assert((SELECT relrowsecurity FROM pg_class WHERE oid='public.uscis_request_gate'::regclass),'gate RLS missing');
SET ROLE service_role;
UPDATE public.case_status SET current_status='Approved' WHERE id='00000000-0000-0000-0000-000000000001';
SELECT public.test_assert((SELECT free_visible_status->>'current_status'='Received' FROM public.case_status WHERE id='00000000-0000-0000-0000-000000000001'),'daily sync changed visible snapshot');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000002')->>'source'='missing','foreign case refresh allowed');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001')->>'source'='database','first click calls provider');
SELECT public.test_assert((SELECT free_visible_status->>'current_status'='Approved' FROM public.case_status WHERE id='00000000-0000-0000-0000-000000000001'),'cache click did not reveal latest');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001')->>'source'='uscis','second click is not live');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001')->>'source'='cooldown','manual cooldown not enforced');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002')->>'source'='uscis','premium does not fetch live');
SELECT public.test_assert(public.prepare_case_refresh('00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003')->>'source'='database','expired plan is premium');
SELECT public.test_assert((public.acquire_uscis_request('production')->>'allowed')::boolean,'first allowance denied');
SELECT public.test_assert(NOT (public.acquire_uscis_request('production')->>'allowed')::boolean,'unpaced second allowance');
SELECT public.defer_uscis_requests('production',300);
SELECT public.test_assert((public.acquire_uscis_request('production')->>'retry_after_ms')::integer>290000,'provider cooldown ignored');
UPDATE public.uscis_request_gate SET next_request_at='-infinity',blocked_until='-infinity' WHERE environment='production';
INSERT INTO public.uscis_request_budget VALUES('production',date_trunc('hour',now())-interval '23 hours',350000);
SELECT public.test_assert(public.acquire_uscis_request('production')->>'reason'='quota','rolling quota exceeded');
RESET ROLE;
