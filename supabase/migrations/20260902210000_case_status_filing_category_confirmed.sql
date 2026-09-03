-- Track when the user explicitly confirmed their filing type (vs migration default).

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS filing_category_confirmed_at timestamptz;

COMMENT ON COLUMN public.case_status.filing_category_confirmed_at IS
  'Set when the user explicitly selects or updates filing_category; null prompts legacy backfill.';
