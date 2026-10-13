-- Keep USCIS modifiedDate (non-IOE receipts only) to study "silent updates" later.
-- USCIS documents it as changing on internal/administrative events too, so it is
-- evidence to evaluate, not a status. Added only when present and well-formed, so
-- IOE observations (and their first/last deduplication) are unchanged.
CREATE OR REPLACE FUNCTION public.record_opt_case_observation(p_case_id uuid,p_synced_at timestamptz,p_provider jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE c public.case_status; safe_provider jsonb; application uuid;
BEGIN
  SELECT * INTO c FROM public.case_status WHERE id=p_case_id FOR KEY SHARE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF p_synced_at > clock_timestamp()+interval '1 minute' OR p_synced_at < clock_timestamp()-interval '10 minutes' THEN
    RAISE EXCEPTION 'Invalid observation time';
  END IF;
  IF jsonb_typeof(p_provider->'events') IS DISTINCT FROM 'array' OR coalesce(length(p_provider->>'status'),0) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Invalid provider evidence';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('opt-identity-'||upper(trim(c.receipt_number)),0));
  SELECT i.application_id INTO application FROM public.opt_case_identity i
    JOIN public.case_status linked ON linked.id=i.case_id
    WHERE upper(trim(linked.receipt_number))=upper(trim(c.receipt_number)) LIMIT 1;
  INSERT INTO public.opt_case_identity(case_id,application_id) VALUES(c.id,coalesce(application,gen_random_uuid()))
    ON CONFLICT(case_id) DO NOTHING;
  -- Allowlist excludes receipt, description, name, nationality, tokens and upstream payloads.
  safe_provider := jsonb_build_object('status',p_provider->>'status','form',p_provider->>'form','received',p_provider->>'received','events',
    (SELECT coalesce(jsonb_agg(jsonb_build_object('date',e->>'date','status',e->>'status')),'[]'::jsonb)
     FROM jsonb_array_elements(p_provider->'events') e));
  IF p_provider->>'modified' ~ '^\d{2}-\d{2}-\d{4} \d{2}:\d{2}:\d{2}$' THEN
    safe_provider := safe_provider || jsonb_build_object('modified',p_provider->>'modified');
  END IF;
  INSERT INTO public.opt_case_observations(case_id,synced_at,provider,reported)
  VALUES(c.id,p_synced_at,safe_provider,jsonb_build_object('category',c.filing_category,
    'category_confirmed_at',c.filing_category_confirmed_at,'filing_date',c.reported_filing_date,
    'premium_start',c.reported_premium_start,'legacy_premium_start',c.pp_start_date))
  ON CONFLICT(case_id,synced_at) WHERE evidence_type='uscis' DO NOTHING;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.record_opt_case_observation(uuid,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_opt_case_observation(uuid,timestamptz,jsonb) TO service_role;
