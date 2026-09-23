-- Optional user-confirmed company website for employment-history logos.
-- Additive only: existing records, dates, grants, and RLS remain unchanged.
ALTER TABLE public.employment_spans
  ADD COLUMN IF NOT EXISTS employer_domain text;

COMMENT ON COLUMN public.employment_spans.employer_domain IS
  'Optional normalized company hostname confirmed by the user; used to display a company logo.';

NOTIFY pgrst, 'reload schema';
