-- Drop the legacy Supabase job store from the main project.
--
-- Oracle has been the only live job store since 2026-09-07
-- (JOB_DATA_STORE=oracle on Render and Vercel). The API and web app no longer
-- contain any code that reads or writes public.jobs, public.job_visa_signals or
-- public.job_sponsorship_summary; job records and visa evidence are served by
-- the Oracle job store through the API's /job-board/jobs boundary.
--
-- Apply only after the code that removed the Supabase job store is deployed.
--
-- Kept: ats_sources, ingestion audits, employer_matches, h1b_sponsors and the
-- shared trigger function job_board_set_updated_at (still used by ats_sources,
-- employer_matches, companies, ats_platforms, ats_boards and
-- source_verification_queue).
--
-- No CASCADE: if anything unexpected still depends on these objects, the
-- migration fails instead of silently dropping it.

-- The only RLS policy on employer_matches joined public.jobs. The web app now
-- reads match metadata with the service role, scoped to match IDs of verified
-- jobs returned by the Oracle job API, so the policy has no remaining reader.
DROP POLICY IF EXISTS "Authenticated users can read matches for verified jobs"
  ON public.employer_matches;

DROP VIEW IF EXISTS public.job_sponsorship_summary;
DROP TABLE IF EXISTS public.job_visa_signals;
DROP TABLE IF EXISTS public.jobs;

-- Trigger functions used only by triggers on public.jobs.
DROP FUNCTION IF EXISTS public.assert_job_source_identity();
DROP FUNCTION IF EXISTS public.assert_job_employer_match_identity();
