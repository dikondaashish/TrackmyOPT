-- The main database reached 0.40 of the 0.5 GB free-plan limit on Nov 21,
-- 2026, growing ~30 MB a week. Five tables written by the daily case sync
-- (~2,200 cases) and the job-board ingestion each gained ~15,000 rows a week
-- with no age-based cleanup. Over the limit Supabase can make the database
-- read-only, which would stop case tracking, sign-ups and payments.
--
-- Add one daily purge (pg_cron, 04:30 UTC, away from the 14:00 UTC sync):
--
-- * uscis_check_log, uscis_api_audit: write-only diagnostics. Keep 30 days.
--   (Daily totals already live in uscis_operational_daily.)
-- * case_check_jobs: keep 30 days, every queued/scheduling/running job, and
--   each case's newest job (the monitor-schedule "last attempt" read has no
--   age limit). Trial progress counts jobs since the trial start, and the
--   paid introductory period is shorter than 30 days.
-- * ingestion_audit_log: keep 30 days, every 'started' row, and the newest
--   row per (source, status), which the scheduler reads as "last success" /
--   "last outcome" with no age limit.
-- * opt_case_observations: the daily sync stores a full snapshot even when
--   nothing changed (95% of rows repeat). The served forecast reads only the
--   first and last row per (case, evidence); older middle rows are only read
--   by the accuracy backtest at 30/60/90-day landmarks. Keep the last 15 days
--   in full, plus, for older rows, the first and last row per (case,
--   evidence) and the last row per (case, evidence, week). Backtest
--   "last seen pending" at a landmark older than 15 days can move up to six
--   days earlier; served forecasts are unchanged. This relaxes the original
--   "daily rows remain immutable" note in 20261013133431.
--
-- Deleted space is reused by new rows; Postgres does not shrink the files on
-- its own, so the dashboard size stops growing rather than dropping.
CREATE OR REPLACE FUNCTION public.purge_expired_operational_rows()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
  SET search_path = '' SET statement_timeout = '5min' AS $$
DECLARE
  log_cutoff timestamptz := now() - interval '30 days';
  obs_cutoff timestamptz := now() - interval '15 days';
  n_check bigint; n_audit bigint; n_jobs bigint; n_ingest bigint; n_obs bigint;
BEGIN
  DELETE FROM public.uscis_check_log WHERE created_at < log_cutoff;
  GET DIAGNOSTICS n_check = ROW_COUNT;

  DELETE FROM public.uscis_api_audit WHERE called_at < log_cutoff;
  GET DIAGNOSTICS n_audit = ROW_COUNT;

  WITH ranked AS (
    SELECT job_id, created_at, state,
      row_number() OVER (PARTITION BY case_id ORDER BY created_at DESC, job_id DESC) AS rn
    FROM public.case_check_jobs
  )
  DELETE FROM public.case_check_jobs j
  USING ranked r
  WHERE j.job_id = r.job_id
    AND r.created_at < log_cutoff
    AND r.state NOT IN ('scheduling', 'queued', 'running')
    AND r.rn > 1;
  GET DIAGNOSTICS n_jobs = ROW_COUNT;

  WITH ranked AS (
    SELECT id, run_at, status,
      row_number() OVER (PARTITION BY source_id, status ORDER BY run_at DESC, id) AS rn
    FROM public.ingestion_audit_log
  )
  DELETE FROM public.ingestion_audit_log l
  USING ranked r
  WHERE l.id = r.id
    AND r.run_at < log_cutoff
    AND r.status <> 'started'
    AND r.rn > 1;
  GET DIAGNOSTICS n_ingest = ROW_COUNT;

  WITH keep AS (
    SELECT o.id,
      min(o.id) OVER (PARTITION BY o.case_id, o.evidence_key) AS first_id,
      max(o.id) OVER (PARTITION BY o.case_id, o.evidence_key) AS last_id,
      max(o.id) OVER (PARTITION BY o.case_id, o.evidence_key,
                      date_trunc('week', o.observed_at)) AS week_last_id,
      o.observed_at
    FROM public.opt_case_observations o
  )
  DELETE FROM public.opt_case_observations o
  USING keep k
  WHERE o.id = k.id
    AND k.observed_at < obs_cutoff
    AND o.id NOT IN (k.first_id, k.last_id, k.week_last_id);
  GET DIAGNOSTICS n_obs = ROW_COUNT;

  RETURN jsonb_build_object(
    'uscis_check_log', n_check, 'uscis_api_audit', n_audit,
    'case_check_jobs', n_jobs, 'ingestion_audit_log', n_ingest,
    'opt_case_observations', n_obs);
END $$;
REVOKE ALL ON FUNCTION public.purge_expired_operational_rows() FROM PUBLIC, anon, authenticated, service_role;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'purge_expired_operational_rows';
SELECT cron.schedule(
  'purge_expired_operational_rows',
  '30 4 * * *',
  'SELECT public.purge_expired_operational_rows();'
);
