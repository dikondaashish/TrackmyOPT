-- Make extension job saves idempotent across reloads, double-clicks, tabs, and
-- concurrent requests. Preserve historical duplicate rows; only clear the URL
-- from older exact duplicates before adding the forward-looking unique index.

WITH ranked_urls AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, job_url
      ORDER BY created_at DESC, id DESC
    ) AS duplicate_rank
  FROM public.job_applications
  WHERE job_url IS NOT NULL
    AND btrim(job_url) <> ''
)
UPDATE public.job_applications AS application
SET
  job_url = NULL,
  updated_at = now()
FROM ranked_urls
WHERE application.id = ranked_urls.id
  AND ranked_urls.duplicate_rank > 1;

CREATE UNIQUE INDEX IF NOT EXISTS job_applications_user_job_url_unique
  ON public.job_applications (user_id, job_url)
  WHERE job_url IS NOT NULL
    AND btrim(job_url) <> '';

COMMENT ON INDEX public.job_applications_user_job_url_unique IS
  'Prevents duplicate exact job URLs per user; extension POST treats conflicts as idempotent success.';
