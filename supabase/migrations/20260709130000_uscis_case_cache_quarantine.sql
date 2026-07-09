-- Quarantine neighbor-scan cache data (preserve rows; exclude from reads).
-- Every existing uscis_case_cache row was populated via sequential neighbor scanning.

ALTER TABLE public.uscis_case_cache
  ADD COLUMN IF NOT EXISTS quarantined boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.uscis_case_cache.quarantined IS
  'True when row was sourced from neighbor scanning; excluded from product reads.';

UPDATE public.uscis_case_cache
SET quarantined = true
WHERE quarantined = false;
