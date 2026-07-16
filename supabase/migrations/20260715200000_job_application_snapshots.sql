-- Preserve the compensation and plain-text posting that the extension saw at
-- save time. These snapshots let the tracker show the original context even
-- if the employer later edits or removes the posting.
ALTER TABLE public.job_applications
  ADD COLUMN IF NOT EXISTS salary_text text,
  ADD COLUMN IF NOT EXISTS job_description text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_applications_salary_text_length'
      AND conrelid = 'public.job_applications'::regclass
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_salary_text_length
      CHECK (salary_text IS NULL OR char_length(salary_text) <= 300);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'job_applications_job_description_length'
      AND conrelid = 'public.job_applications'::regclass
  ) THEN
    ALTER TABLE public.job_applications
      ADD CONSTRAINT job_applications_job_description_length
      CHECK (job_description IS NULL OR char_length(job_description) <= 15000);
  END IF;
END $$;

COMMENT ON COLUMN public.job_applications.salary_text IS
  'Normalized compensation text captured from the job posting at save time.';

COMMENT ON COLUMN public.job_applications.job_description IS
  'Plain-text job description snapshot captured at save time, capped at 15,000 characters.';
