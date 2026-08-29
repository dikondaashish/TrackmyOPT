\set ON_ERROR_STOP on

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE public.h1b_sponsors (id text PRIMARY KEY);

-- The migration is appended by the verification command after these test-only
-- prerequisites, then the acceptance queries below run against real Postgres.

INSERT INTO public.ats_sources (
  ats_type, board_token, base_url, enabled,
  max_requests_per_minute, max_requests_per_day
) VALUES
  ('greenhouse', 'disabled-board', 'https://boards.greenhouse.io/disabled-board', false, 1, 1),
  ('greenhouse', 'aurora-board', 'https://boards.greenhouse.io/aurora-board', true, 2, 2),
  ('greenhouse', 'borealis-board', 'https://boards.greenhouse.io/borealis-board', true, 1, 1);

-- A disabled board creates an explicit skip audit record and cannot reserve a request.
SELECT accepted, reason
FROM public.reserve_ats_ingestion(
  (SELECT id FROM public.ats_sources WHERE board_token = 'disabled-board')
);

-- Each enabled board receives its own quota. The first request for both boards
-- succeeds; a second Aurora request can record a duplicate without affecting
-- Borealis. A third Aurora request is then rejected by its own source limit.
SELECT audit_log_id AS aurora_audit_id
FROM public.reserve_ats_ingestion(
  (SELECT id FROM public.ats_sources WHERE board_token = 'aurora-board')
) \gset

INSERT INTO public.jobs (
  source_id, source_ats, board_token, external_job_id, title, company_name
)
SELECT id, ats_type, board_token, 'external-100', 'Software Engineer', 'Aurora'
FROM public.ats_sources
WHERE board_token = 'aurora-board';

SELECT public.complete_ats_ingestion(:'aurora_audit_id', 1, 1, 0);

SELECT audit_log_id AS borealis_audit_id
FROM public.reserve_ats_ingestion(
  (SELECT id FROM public.ats_sources WHERE board_token = 'borealis-board')
) \gset

INSERT INTO public.jobs (
  source_id, source_ats, board_token, external_job_id, title, company_name
)
SELECT id, ats_type, board_token, 'external-100', 'Software Engineer', 'Borealis'
FROM public.ats_sources
WHERE board_token = 'borealis-board';

SELECT public.complete_ats_ingestion(:'borealis_audit_id', 1, 1, 0);

-- Repeat Aurora's already-ingested job. The unique index forces an update,
-- leaving one row for Aurora and one independent row for Borealis.
SELECT audit_log_id AS aurora_repeat_audit_id
FROM public.reserve_ats_ingestion(
  (SELECT id FROM public.ats_sources WHERE board_token = 'aurora-board')
) \gset

INSERT INTO public.jobs (
  source_id, source_ats, board_token, external_job_id, title, company_name
)
SELECT id, ats_type, board_token, 'external-100', 'Software Engineer II', 'Aurora'
FROM public.ats_sources
WHERE board_token = 'aurora-board'
ON CONFLICT (source_ats, board_token, external_job_id)
DO UPDATE SET title = EXCLUDED.title;

SELECT public.complete_ats_ingestion(:'aurora_repeat_audit_id', 1, 0, 1);

SELECT accepted, reason
FROM public.reserve_ats_ingestion(
  (SELECT id FROM public.ats_sources WHERE board_token = 'aurora-board')
);

SELECT
  board_token,
  external_job_id,
  count(*) AS rows_per_board_job
FROM public.jobs
GROUP BY board_token, external_job_id
ORDER BY board_token;

SELECT
  source.board_token,
  audit.status,
  audit.jobs_found,
  audit.jobs_new,
  audit.jobs_duplicate,
  audit.error_message
FROM public.ingestion_audit_log AS audit
JOIN public.ats_sources AS source ON source.id = audit.source_id
ORDER BY audit.run_at, source.board_token;
