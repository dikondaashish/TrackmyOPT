-- All enrolled cases sync daily. Free users see only their explicitly revealed snapshot.
BEGIN;
ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS free_visible_status jsonb,
  ADD COLUMN IF NOT EXISTS free_first_refresh_pending boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_manual_check_at timestamptz;

CREATE OR REPLACE FUNCTION public.case_visible_snapshot(p_case public.case_status)
RETURNS jsonb LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = '' AS $$
 SELECT jsonb_build_object(
   'current_status',p_case.current_status,'case_type',p_case.case_type,
   'received_date',p_case.received_date,'status_history',p_case.status_history,
   'last_checked_at',p_case.last_checked_at,'last_status_change_at',p_case.last_status_change_at,
   'last_check_failed_at',p_case.last_check_failed_at,
   'last_check_error_code',p_case.last_check_error_code,
   'last_check_error_message',p_case.last_check_error_message
 );
$$;
UPDATE public.case_status c SET free_visible_status=public.case_visible_snapshot(c)
 WHERE free_visible_status IS NULL;

-- Preserve existing client-write permissions on old columns, while preventing
-- direct Data API writes from resetting the new internal cooldown/display state.
DO $$
DECLARE role_name text; cols text; allowed_insert boolean; allowed_update boolean;
BEGIN
 SELECT string_agg(quote_ident(attname),',') INTO cols FROM pg_attribute
  WHERE attrelid='public.case_status'::regclass AND attnum>0 AND NOT attisdropped
   AND attname NOT IN ('free_visible_status','free_first_refresh_pending','last_manual_check_at');
 FOREACH role_name IN ARRAY ARRAY['anon','authenticated'] LOOP
   allowed_insert := has_table_privilege(role_name,'public.case_status','INSERT');
   allowed_update := has_table_privilege(role_name,'public.case_status','UPDATE');
   EXECUTE format('REVOKE INSERT,UPDATE ON public.case_status FROM %I',role_name);
   IF allowed_insert THEN EXECUTE format('GRANT INSERT (%s) ON public.case_status TO %I',cols,role_name); END IF;
   IF allowed_update THEN EXECUTE format('GRANT UPDATE (%s) ON public.case_status TO %I',cols,role_name); END IF;
 END LOOP;
END;
$$;

-- Locks the exact owned row so concurrent first clicks cannot both consume the cache step.
CREATE OR REPLACE FUNCTION public.prepare_case_refresh(p_case_id uuid,p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE c public.case_status; premium boolean; stamp timestamptz := clock_timestamp(); seconds integer;
BEGIN
 SELECT * INTO c FROM public.case_status WHERE id=p_case_id AND user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('source','missing'); END IF;
 SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id=p_user_id AND premium_status=true AND (subscription_expires_at IS NULL OR subscription_expires_at>stamp)) INTO premium;
 IF NOT premium AND c.free_first_refresh_pending THEN
   UPDATE public.case_status SET free_visible_status=public.case_visible_snapshot(c),free_first_refresh_pending=false
    WHERE id=c.id AND user_id=p_user_id;
   RETURN jsonb_build_object('source','database');
 END IF;
 IF c.last_manual_check_at > stamp - interval '5 minutes' THEN
   seconds := greatest(1,ceil(extract(epoch FROM c.last_manual_check_at + interval '5 minutes' - stamp))::integer);
   RETURN jsonb_build_object('source','cooldown','retry_after',seconds);
 END IF;
 UPDATE public.case_status SET last_manual_check_at=stamp WHERE id=c.id AND user_id=p_user_id;
 RETURN jsonb_build_object('source','uscis','receipt_number',c.receipt_number);
END;
$$;

-- One shared gate for all instances, manual requests, OAuth and worker retries.
-- No receipt/user data. A conservative 25-hour budget avoids reset/timezone bursts.
CREATE TABLE public.uscis_request_gate (
 environment text PRIMARY KEY CHECK(environment IN ('production','sandbox')),
 next_request_at timestamptz NOT NULL DEFAULT '-infinity',
 blocked_until timestamptz NOT NULL DEFAULT '-infinity'
);
CREATE TABLE public.uscis_request_budget (
 environment text NOT NULL REFERENCES public.uscis_request_gate(environment) ON DELETE CASCADE,
 bucket_hour timestamptz NOT NULL,
 requests integer NOT NULL CHECK(requests>=0),
 PRIMARY KEY(environment,bucket_hour)
);
ALTER TABLE public.uscis_request_gate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uscis_request_budget ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.uscis_request_gate,public.uscis_request_budget FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.uscis_request_gate,public.uscis_request_budget TO service_role;
INSERT INTO public.uscis_request_gate(environment) VALUES ('production'),('sandbox');

CREATE OR REPLACE FUNCTION public.acquire_uscis_request(p_environment text)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE gate public.uscis_request_gate; stamp timestamptz; bucket timestamptz; total bigint; cap integer;
BEGIN
 SELECT * INTO gate FROM public.uscis_request_gate WHERE environment=p_environment FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invalid USCIS environment'; END IF;
 stamp := clock_timestamp(); bucket := date_trunc('hour',stamp);
 IF greatest(gate.next_request_at,gate.blocked_until)>stamp THEN
   RETURN jsonb_build_object('allowed',false,'retry_after_ms',greatest(1,ceil(extract(epoch FROM greatest(gate.next_request_at,gate.blocked_until)-stamp)*1000)), 'reason','pace');
 END IF;
 cap := CASE WHEN p_environment='sandbox' THEN 900 ELSE 350000 END;
 SELECT coalesce(sum(requests),0) INTO total FROM public.uscis_request_budget
  WHERE environment=p_environment AND bucket_hour>=bucket - interval '24 hours';
 IF total>=cap THEN RETURN jsonb_build_object('allowed',false,'retry_after_ms',3600000,'reason','quota'); END IF;
 UPDATE public.uscis_request_gate SET next_request_at=stamp+interval '250 milliseconds' WHERE environment=p_environment;
 INSERT INTO public.uscis_request_budget VALUES(p_environment,bucket,1)
 ON CONFLICT(environment,bucket_hour) DO UPDATE SET requests=public.uscis_request_budget.requests+1;
 DELETE FROM public.uscis_request_budget WHERE environment=p_environment AND bucket_hour<bucket-interval '48 hours';
 RETURN jsonb_build_object('allowed',true,'granted_at',stamp);
END;
$$;
CREATE OR REPLACE FUNCTION public.defer_uscis_requests(p_environment text,p_seconds integer)
RETURNS void LANGUAGE sql SECURITY INVOKER SET search_path = '' AS $$
 UPDATE public.uscis_request_gate SET blocked_until=greatest(blocked_until,clock_timestamp()+make_interval(secs=>least(86400,greatest(1,p_seconds)))) WHERE environment=p_environment;
$$;
REVOKE ALL ON FUNCTION public.case_visible_snapshot(public.case_status),public.prepare_case_refresh(uuid,uuid),public.acquire_uscis_request(text),public.defer_uscis_requests(text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.case_visible_snapshot(public.case_status),public.prepare_case_refresh(uuid,uuid),public.acquire_uscis_request(text),public.defer_uscis_requests(text,integer) TO service_role;
COMMIT;
