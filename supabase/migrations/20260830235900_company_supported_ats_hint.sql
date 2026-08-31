-- Prefer cheap, high-confidence discovery work: an official stored careers URL
-- that already names one of the supported ATS hosts. Sponsor priority remains
-- the tie-breaker, and last_checked_at keeps the queue resumable/fair.

ALTER TABLE public.companies
  ADD COLUMN has_supported_ats_hint boolean GENERATED ALWAYS AS (
    careers_url ~* '(greenhouse\.io|lever\.co|ashbyhq\.com|myworkdayjobs\.com|smartrecruiters\.com|workable\.com|recruitee\.com|jobs\.personio\.(com|de)|bamboohr\.com|breezy\.hr)'
  ) STORED;

DROP INDEX public.companies_discovery_queue_idx;
CREATE INDEX companies_discovery_queue_idx
  ON public.companies (
    discovery_status,
    last_checked_at NULLS FIRST,
    has_supported_ats_hint DESC,
    discovery_priority DESC,
    id
  );

NOTIFY pgrst, 'reload schema';
