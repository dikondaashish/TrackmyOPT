-- The daily partner import upserts every row it sees, so the snapshot trigger fired
-- on ~3,600 unchanged rows per day. Keep one baseline per timeline, then snapshot
-- only real changes. updated_at keeps its "last seen in an import" meaning.
CREATE OR REPLACE FUNCTION public.capture_opt_community_observation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  IF TG_OP='UPDATE'
     AND (NEW.external_id,NEW.case_kind,NEW.premium_processing,NEW.init_date,NEW.approve_date,NEW.pp_date,
          NEW.days_to_approval,NEW.external_updated_at,NEW.source,NEW.service_center,NEW.source_evidence)
     IS NOT DISTINCT FROM
         (OLD.external_id,OLD.case_kind,OLD.premium_processing,OLD.init_date,OLD.approve_date,OLD.pp_date,
          OLD.days_to_approval,OLD.external_updated_at,OLD.source,OLD.service_center,OLD.source_evidence)
     AND EXISTS (SELECT 1 FROM public.opt_community_observations o WHERE o.timeline_id=NEW.id) THEN
    RETURN NEW;
  END IF;
  INSERT INTO public.opt_community_observations(timeline_id,payload)
  VALUES(NEW.id,jsonb_build_object('external_id',NEW.external_id,'case_kind',NEW.case_kind,
    'premium_processing',NEW.premium_processing,'init_date',NEW.init_date,'approve_date',NEW.approve_date,
    'pp_date',NEW.pp_date,'days_to_approval',NEW.days_to_approval,'external_updated_at',NEW.external_updated_at,
    'source',NEW.source,'service_center',NEW.service_center,'raw_dates',NEW.source_evidence));
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_opt_community_observation() FROM PUBLIC,anon,authenticated;
