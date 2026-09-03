-- Expand filing_category to cover common non-OPT USCIS cases (Phase 2).

ALTER TABLE public.case_status
  DROP CONSTRAINT IF EXISTS case_status_filing_category_check;

ALTER TABLE public.case_status
  ADD CONSTRAINT case_status_filing_category_check
  CHECK (
    filing_category IN (
      'initial_opt',
      'stem_extension',
      'h1b',
      'h4',
      'h4_ead',
      'i485',
      'i130',
      'i140',
      'i131',
      'other'
    )
  );

COMMENT ON COLUMN public.case_status.filing_category IS
  'User-selected case/filing type for UX and estimates; not overwritten by USCIS checks.';
