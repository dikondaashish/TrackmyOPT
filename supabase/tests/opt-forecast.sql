CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE TABLE public.case_status(id uuid PRIMARY KEY,user_id uuid,receipt_number text,filing_category text,filing_category_confirmed_at timestamptz,received_date date,pp_start_date date);
CREATE TABLE public.community_opt_timelines(id uuid PRIMARY KEY,external_id text,case_kind text,premium_processing boolean,init_date date,approve_date date,pp_date date,days_to_approval int,external_updated_at timestamptz,source text,service_center text);
INSERT INTO public.case_status VALUES
('00000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','IOE0000000001','initial_opt',now(),'2026-01-01',NULL),
('00000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','IOE0000000001','initial_opt',now(),'2026-01-01',NULL),
('00000000-0000-0000-0000-000000000003','10000000-0000-0000-0000-000000000003','IOE0000000002','stem_extension',now(),'2026-01-01',NULL);
GRANT SELECT,UPDATE,DELETE ON public.case_status TO service_role;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.community_opt_timelines TO service_role;
INSERT INTO public.community_opt_timelines(id,external_id,case_kind,premium_processing,init_date,source) VALUES('20000000-0000-0000-0000-000000000002','optt_preexisting','initial_opt',false,'2026-02-01','reddit');
-- APPLY MIGRATION HERE
CREATE FUNCTION public.test_assert(ok boolean,message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION '%',message; END IF; END $$;
SELECT public.test_assert((SELECT count(*)=0 FROM public.opt_case_observations),'historical observations backfilled');
SELECT public.test_assert((SELECT NOT uscis_training_authorized AND promoted_model IS NULL FROM public.opt_forecast_policy),'training enabled without review');
SELECT public.test_assert(NOT has_table_privilege('authenticated','public.opt_case_observations','SELECT'),'private history readable');
SELECT public.test_assert(NOT has_table_privilege('anon','public.opt_case_forecasts','SELECT'),'forecasts public');
SELECT public.test_assert(NOT has_table_privilege('service_role','public.opt_case_observations','UPDATE'),'history rewritable');
SELECT public.test_assert(NOT has_function_privilege('authenticated','public.read_opt_case_observations(timestamptz,bigint,integer)','EXECUTE'),'training RPC public');
SELECT public.test_assert((SELECT bool_and(relrowsecurity AND relforcerowsecurity) FROM pg_class WHERE relname IN ('opt_case_identity','opt_case_observations','opt_community_observations','opt_case_forecasts','opt_forecast_runs','opt_forecast_run_cases','opt_forecast_policy')),'RLS missing');
SET ROLE service_role;
SELECT public.record_opt_case_observation(id,now(),'{"status":"Case Was Received","form":"I-765","received":"2026-01-01","events":[{"date":"2026-01-01","status":"Case Was Received","unexpected":"do not retain"}],"receiptNumber":"do not retain","description":"do not retain"}') FROM public.case_status;
SELECT public.test_assert((SELECT count(*)=3 FROM public.opt_case_observations),'missing enrolled observations');
SELECT public.test_assert((SELECT count(DISTINCT application_id)=2 FROM public.read_opt_case_observations(now())),'shared receipt counted twice');
SELECT public.test_assert((SELECT bool_and(NOT (provider ? 'receiptNumber') AND NOT (provider ? 'description') AND NOT ((provider->'events'->0) ? 'unexpected')) FROM public.opt_case_observations),'unsafe provider fields retained');
SELECT public.test_assert((SELECT count(*)=0 FROM public.read_opt_case_observations(now()-interval '1 day')),'future evidence leaked');
SELECT public.test_assert(NOT public.record_opt_case_observation('00000000-0000-0000-0000-000000000099',now(),'{"status":"Case Was Received","events":[]}'),'deleted case accepted');
UPDATE public.case_status SET reported_filing_date='2025-12-30' WHERE id='00000000-0000-0000-0000-000000000001';
SELECT public.test_assert((SELECT count(*)=1 FROM public.opt_case_observations WHERE evidence_type='metadata'),'metadata change not versioned');
SELECT public.test_assert((SELECT count(DISTINCT synced_at)=1 FROM public.opt_case_observations WHERE case_id='00000000-0000-0000-0000-000000000001'),'metadata falsely refreshed USCIS check');
INSERT INTO public.community_opt_timelines(id,external_id,case_kind,premium_processing,init_date,source) VALUES('20000000-0000-0000-0000-000000000001','optt_synthetic','initial_opt',false,'2026-01-01','reddit');
UPDATE public.community_opt_timelines SET approve_date='2026-04-01',days_to_approval=90 WHERE external_id='optt_synthetic';
SELECT public.test_assert((SELECT count(*)=2 FROM public.opt_community_observations),'community correction overwrote history');
SELECT public.test_assert((SELECT count(*)=1 FROM public.read_opt_community_asof(clock_timestamp())),'asof community duplicates');
SELECT public.test_assert((SELECT payload->>'approve_date'='2026-04-01' FROM public.read_opt_community_asof(clock_timestamp())),'community latest wrong');
UPDATE public.community_opt_timelines SET source=source WHERE external_id='optt_synthetic';
SELECT public.test_assert((SELECT count(*)=2 FROM public.opt_community_observations),'unchanged daily upsert duplicated a snapshot');
UPDATE public.community_opt_timelines SET source=source WHERE external_id='optt_preexisting';
SELECT public.test_assert((SELECT count(*)=1 FROM public.opt_community_observations WHERE payload->>'external_id'='optt_preexisting'),'first import after release did not record a baseline');
UPDATE public.community_opt_timelines SET source=source WHERE external_id='optt_preexisting';
SELECT public.test_assert((SELECT count(*)=1 FROM public.opt_community_observations WHERE payload->>'external_id'='optt_preexisting'),'unchanged baseline duplicated');
UPDATE public.community_opt_timelines SET source_evidence='{"approve_date":"2026-05-01"}' WHERE external_id='optt_preexisting';
SELECT public.test_assert((SELECT count(*)=2 FROM public.opt_community_observations WHERE payload->>'external_id'='optt_preexisting'),'raw date correction not versioned');
UPDATE public.opt_forecast_policy SET uscis_training_authorized=true,authorization_reference='synthetic test permission';
SELECT public.test_assert(public.claim_opt_forecast_run(current_date,'test-v1')->>'state'='running','claim failed');
SELECT public.test_assert(public.claim_opt_forecast_run(current_date,'test-v1')->>'state'='busy','concurrent run allowed');
INSERT INTO public.opt_forecast_run_cases SELECT id,'00000000-0000-0000-0000-000000000001' FROM public.opt_forecast_runs;
INSERT INTO public.opt_case_forecasts(case_id,run_id,payload) SELECT '00000000-0000-0000-0000-000000000002',id,'{}'::jsonb FROM public.opt_forecast_runs;
DELETE FROM public.case_status WHERE id='00000000-0000-0000-0000-000000000001';
SELECT public.test_assert((SELECT count(*)=0 FROM public.opt_forecast_runs),'deleted training case retained in model');
SELECT public.test_assert((SELECT count(*)=0 FROM public.opt_case_forecasts),'derived prediction retained after invalidation');
SELECT public.test_assert((SELECT count(*)=2 FROM public.opt_case_observations),'shared owner observations removed');
SELECT public.test_assert((SELECT count(*)=2 FROM public.opt_case_identity),'shared identity removed');
UPDATE public.case_status SET receipt_number='IOE0000000003' WHERE id='00000000-0000-0000-0000-000000000002';
SELECT public.test_assert((SELECT count(*)=0 FROM public.opt_case_observations WHERE case_id='00000000-0000-0000-0000-000000000002'),'changed receipt retained prior application history');
DELETE FROM public.community_opt_timelines;
SELECT public.test_assert((SELECT count(*)=0 FROM public.opt_community_observations),'community removal retained history');
RESET ROLE;
