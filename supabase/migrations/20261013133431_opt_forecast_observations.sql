-- Additive, prospective evidence. No historical backfill or receipt copying.
BEGIN;
ALTER TABLE public.case_status ADD COLUMN reported_filing_date date;
ALTER TABLE public.case_status ADD COLUMN reported_premium_start date;
ALTER TABLE public.community_opt_timelines ADD COLUMN source_evidence jsonb;

CREATE TABLE public.opt_case_identity (
  case_id uuid PRIMARY KEY REFERENCES public.case_status(id) ON DELETE CASCADE,
  application_id uuid NOT NULL
);
CREATE INDEX opt_case_identity_application ON public.opt_case_identity(application_id);

CREATE TABLE public.opt_case_observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_id uuid NOT NULL REFERENCES public.case_status(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  synced_at timestamptz NOT NULL,
  evidence_type text NOT NULL DEFAULT 'uscis' CHECK(evidence_type IN ('uscis','metadata')),
  provider jsonb NOT NULL CHECK (jsonb_typeof(provider) = 'object'),
  reported jsonb NOT NULL CHECK (jsonb_typeof(reported) = 'object')
);
CREATE UNIQUE INDEX opt_case_sync_once ON public.opt_case_observations(case_id,synced_at) WHERE evidence_type='uscis';
CREATE INDEX opt_observation_case_time ON public.opt_case_observations(case_id, observed_at, id);

CREATE TABLE public.opt_community_observations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timeline_id uuid NOT NULL REFERENCES public.community_opt_timelines(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  payload jsonb NOT NULL
);
CREATE INDEX opt_community_observation_time ON public.opt_community_observations(timeline_id, observed_at, id);

CREATE TABLE public.opt_forecast_policy (
  singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
  uscis_training_authorized boolean NOT NULL DEFAULT false,
  authorization_reference text,
  promoted_model text,
  validation jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (NOT uscis_training_authorized OR (authorization_reference IS NOT NULL AND length(trim(authorization_reference)) > 0)),
  CHECK (promoted_model IS NULL OR (uscis_training_authorized AND validation IS NOT NULL))
);
INSERT INTO public.opt_forecast_policy(singleton) VALUES(true);

CREATE TABLE public.opt_forecast_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL,
  as_of timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  state text NOT NULL CHECK(state IN ('running','ready','error','review_required')),
  curves jsonb,
  report jsonb,
  completed_at timestamptz,
  lease_expires_at timestamptz,
  UNIQUE(model_version, as_of)
);
CREATE INDEX opt_forecast_run_latest ON public.opt_forecast_runs(created_at DESC) WHERE state='ready';
-- Membership enables deletion of derived artifacts; hashes are not anonymization.
CREATE TABLE public.opt_forecast_run_cases (
  run_id uuid NOT NULL REFERENCES public.opt_forecast_runs(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.case_status(id) ON DELETE CASCADE,
  PRIMARY KEY(run_id, case_id)
);
CREATE INDEX opt_forecast_run_cases_case ON public.opt_forecast_run_cases(case_id);
CREATE TABLE public.opt_case_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES public.case_status(id) ON DELETE CASCADE,
  run_id uuid REFERENCES public.opt_forecast_runs(id) ON DELETE CASCADE,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  shown_at timestamptz,
  payload jsonb NOT NULL
);
CREATE INDEX opt_case_forecast_latest ON public.opt_case_forecasts(case_id, calculated_at DESC);
CREATE INDEX opt_case_forecast_run ON public.opt_case_forecasts(run_id);

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['opt_case_identity','opt_case_observations','opt_community_observations','opt_forecast_policy','opt_forecast_runs','opt_forecast_run_cases','opt_case_forecasts'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC,anon,authenticated',t);
    EXECUTE format('GRANT SELECT,INSERT,UPDATE,DELETE ON public.%I TO service_role',t);
  END LOOP;
END $$;
-- Only append using the fixed RPC. Neither browser roles nor service updates may rewrite history.
REVOKE INSERT,UPDATE,DELETE ON public.opt_case_observations FROM service_role;
REVOKE INSERT,UPDATE,DELETE ON public.opt_community_observations FROM service_role;
REVOKE INSERT,UPDATE,DELETE ON public.opt_case_identity FROM service_role;
REVOKE ALL ON SEQUENCE public.opt_case_observations_id_seq,public.opt_community_observations_id_seq FROM PUBLIC,anon,authenticated,service_role;

CREATE FUNCTION public.record_opt_case_observation(p_case_id uuid,p_synced_at timestamptz,p_provider jsonb)
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
  INSERT INTO public.opt_case_observations(case_id,synced_at,provider,reported)
  VALUES(c.id,p_synced_at,safe_provider,jsonb_build_object('category',c.filing_category,
    'category_confirmed_at',c.filing_category_confirmed_at,'filing_date',c.reported_filing_date,
    'premium_start',c.reported_premium_start,'legacy_premium_start',c.pp_start_date))
  ON CONFLICT(case_id,synced_at) WHERE evidence_type='uscis' DO NOTHING;
  RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.record_opt_case_observation(uuid,timestamptz,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_opt_case_observation(uuid,timestamptz,jsonb) TO service_role;

CREATE FUNCTION public.capture_opt_metadata_revision()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE previous public.opt_case_observations;
BEGIN
  IF (NEW.reported_filing_date,NEW.reported_premium_start,NEW.filing_category,NEW.filing_category_confirmed_at)
     IS NOT DISTINCT FROM (OLD.reported_filing_date,OLD.reported_premium_start,OLD.filing_category,OLD.filing_category_confirmed_at) THEN RETURN NEW; END IF;
  SELECT * INTO previous FROM public.opt_case_observations WHERE case_id=NEW.id ORDER BY id DESC LIMIT 1;
  IF previous.id IS NULL THEN RETURN NEW; END IF;
  INSERT INTO public.opt_case_observations(case_id,synced_at,evidence_type,provider,reported)
  VALUES(NEW.id,previous.synced_at,'metadata',previous.provider,jsonb_build_object('category',NEW.filing_category,
    'category_confirmed_at',NEW.filing_category_confirmed_at,'filing_date',NEW.reported_filing_date,
    'premium_start',NEW.reported_premium_start,'legacy_premium_start',NEW.pp_start_date));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_opt_metadata_revision() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER capture_opt_metadata_revision AFTER UPDATE OF reported_filing_date,reported_premium_start,filing_category,filing_category_confirmed_at ON public.case_status
FOR EACH ROW EXECUTE FUNCTION public.capture_opt_metadata_revision();

CREATE FUNCTION public.capture_opt_community_observation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.opt_community_observations(timeline_id,payload)
  VALUES(NEW.id,jsonb_build_object('external_id',NEW.external_id,'case_kind',NEW.case_kind,
    'premium_processing',NEW.premium_processing,'init_date',NEW.init_date,'approve_date',NEW.approve_date,
    'pp_date',NEW.pp_date,'days_to_approval',NEW.days_to_approval,'external_updated_at',NEW.external_updated_at,
    'source',NEW.source,'service_center',NEW.service_center,'raw_dates',NEW.source_evidence));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_opt_community_observation() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER capture_opt_community_observation AFTER INSERT OR UPDATE ON public.community_opt_timelines
FOR EACH ROW EXECUTE FUNCTION public.capture_opt_community_observation();

-- The existing access-controlled case row is the receipt vault. Exact receipt equality
-- is resolved INSIDE PostgreSQL; only internal UUIDs leave this function.
CREATE FUNCTION public.read_opt_case_observations(p_cutoff timestamptz,p_after bigint DEFAULT 0,p_limit integer DEFAULT 1000)
RETURNS TABLE(id bigint,case_id uuid,application_id uuid,observed_at timestamptz,synced_at timestamptz,provider jsonb,reported jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  WITH boundaries AS (
    -- Retain first/last observation for identical evidence, avoiding unbounded daily repeats
    -- in a model read. The original daily rows remain immutable for auditing.
    SELECT min(o.id) first_id,max(o.id) last_id FROM public.opt_case_observations o
    WHERE o.observed_at<=p_cutoff GROUP BY o.case_id,o.provider,o.reported
  )
  SELECT o.id,o.case_id,i.application_id,o.observed_at,o.synced_at,o.provider,o.reported
  FROM public.opt_case_observations o JOIN public.opt_case_identity i ON i.case_id=o.case_id
  WHERE o.id>p_after AND o.observed_at<=p_cutoff
    AND o.id IN (SELECT first_id FROM boundaries UNION SELECT last_id FROM boundaries)
  ORDER BY o.id LIMIT greatest(1,least(p_limit,1000));
$$;
REVOKE ALL ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) TO service_role;

CREATE FUNCTION public.read_opt_community_asof(p_cutoff timestamptz,p_after bigint DEFAULT 0,p_limit integer DEFAULT 1000)
RETURNS SETOF public.opt_community_observations LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT s.* FROM (
    SELECT DISTINCT ON(o.timeline_id) o.* FROM public.opt_community_observations o
    WHERE o.observed_at<=p_cutoff ORDER BY o.timeline_id,o.observed_at DESC,o.id DESC
  ) s WHERE s.id>p_after ORDER BY s.id LIMIT greatest(1,least(p_limit,1000));
$$;
REVOKE ALL ON FUNCTION public.read_opt_community_asof(timestamptz,bigint,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_opt_community_asof(timestamptz,bigint,integer) TO service_role;

CREATE FUNCTION public.claim_opt_forecast_run(p_day date,p_version text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE previous public.opt_forecast_runs; next_id uuid; permitted boolean;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('opt-forecast-'||p_day::text||p_version,0));
  SELECT * INTO previous FROM public.opt_forecast_runs WHERE model_version=p_version AND as_of=p_day::timestamp AT TIME ZONE 'UTC' FOR UPDATE;
  IF previous.state='ready' THEN RETURN jsonb_build_object('state','already_refreshed'); END IF;
  IF previous.state='running' AND previous.lease_expires_at>clock_timestamp() THEN RETURN jsonb_build_object('state','busy'); END IF;
  -- Retry gets a new FK identity, so a late writer from a timed-out run cannot publish.
  IF previous.id IS NOT NULL THEN DELETE FROM public.opt_forecast_runs WHERE id=previous.id; END IF;
  SELECT uscis_training_authorized INTO permitted FROM public.opt_forecast_policy WHERE singleton;
  INSERT INTO public.opt_forecast_runs(model_version,as_of,state,lease_expires_at)
  VALUES(p_version,p_day::timestamp AT TIME ZONE 'UTC',CASE WHEN permitted THEN 'running' ELSE 'review_required' END,clock_timestamp()+interval '10 minutes') RETURNING id INTO next_id;
  RETURN jsonb_build_object('id',next_id,'state',CASE WHEN permitted THEN 'running' ELSE 'review_required' END);
END $$;
REVOKE ALL ON FUNCTION public.claim_opt_forecast_run(date,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_opt_forecast_run(date,text) TO service_role;

CREATE FUNCTION public.invalidate_removed_opt_training_case()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  DELETE FROM public.opt_forecast_runs r WHERE r.id IN
    (SELECT m.run_id FROM public.opt_forecast_run_cases m WHERE m.case_id=OLD.id);
  IF TG_OP='UPDATE' THEN
    DELETE FROM public.opt_case_observations WHERE case_id=OLD.id;
    DELETE FROM public.opt_case_identity WHERE case_id=OLD.id;
    DELETE FROM public.opt_case_forecasts WHERE case_id=OLD.id;
    RETURN NEW;
  END IF;
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.invalidate_removed_opt_training_case() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER invalidate_removed_opt_training_case BEFORE DELETE ON public.case_status
FOR EACH ROW EXECUTE FUNCTION public.invalidate_removed_opt_training_case();
CREATE TRIGGER invalidate_changed_opt_receipt BEFORE UPDATE OF receipt_number ON public.case_status
FOR EACH ROW WHEN (upper(trim(OLD.receipt_number)) IS DISTINCT FROM upper(trim(NEW.receipt_number)))
EXECUTE FUNCTION public.invalidate_removed_opt_training_case();

COMMENT ON TABLE public.opt_case_observations IS 'Prospective USCIS observations for currently enrolled cases. Event dates live in provider; observed_at is server ingestion time. No historical backdating. Cascade on enrollment deletion.';
COMMENT ON TABLE public.opt_forecast_policy IS 'Default closed for cross-case USCIS training and serving pending actual API agreement/privacy review and out-of-sample validation. No automatic promotion.';
COMMIT;
