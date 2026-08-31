-- Permit the ten reviewed phase-one adapter keys in the compatibility ingestion
-- tables. This does not authorize or enable a source; ats_platforms policy plus
-- explicit board verification still gates activation.

ALTER TABLE public.ats_sources
  DROP CONSTRAINT ats_sources_ats_type_check;
ALTER TABLE public.ats_sources
  ADD CONSTRAINT ats_sources_ats_type_check CHECK (
    ats_type IN (
      'greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters',
      'workable', 'recruitee', 'personio', 'bamboohr', 'breezy',
      'successfactors', 'rippling'
    )
  );

ALTER TABLE public.jobs
  DROP CONSTRAINT jobs_source_ats_check;
ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_source_ats_check CHECK (
    source_ats IN (
      'greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters',
      'workable', 'recruitee', 'personio', 'bamboohr', 'breezy',
      'successfactors', 'rippling', 'consumer_board'
    )
  );

NOTIFY pgrst, 'reload schema';
