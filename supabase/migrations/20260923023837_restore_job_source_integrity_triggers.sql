-- Reconcile verified production drift from job_board_step_0. The source
-- identity function/trigger and jobs timestamp trigger were absent, while
-- newer job-board schema and RPCs were already present. Do not replay Step 0.
-- No existing rows, policies, quotas, or ingestion RPCs are changed.

CREATE OR REPLACE FUNCTION public.assert_job_source_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  configured_source public.ats_sources%ROWTYPE;
BEGIN
  SELECT * INTO configured_source
  FROM public.ats_sources
  WHERE id = NEW.source_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown ATS source %', NEW.source_id;
  END IF;

  IF NEW.source_ats IS DISTINCT FROM configured_source.ats_type
     OR NEW.board_token IS DISTINCT FROM configured_source.board_token THEN
    RAISE EXCEPTION 'Job source identity must match its configured ATS source';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assert_job_source_identity()
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assert_job_source_identity() TO service_role;

DROP TRIGGER IF EXISTS jobs_assert_source_identity ON public.jobs;
CREATE TRIGGER jobs_assert_source_identity
  BEFORE INSERT OR UPDATE OF source_id, source_ats, board_token ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.assert_job_source_identity();

DROP TRIGGER IF EXISTS jobs_set_updated_at ON public.jobs;
CREATE TRIGGER jobs_set_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();
