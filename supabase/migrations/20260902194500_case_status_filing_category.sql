-- User-selected filing category (OPT vs STEM OPT) for community estimates.
-- Distinct from case_type, which USCIS overwrites on every status check.

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS filing_category text NOT NULL DEFAULT 'initial_opt'
    CHECK (filing_category IN ('initial_opt', 'stem_extension'));

COMMENT ON COLUMN public.case_status.filing_category IS
  'User-selected OPT filing type for estimates and UX; not overwritten by USCIS checks.';
