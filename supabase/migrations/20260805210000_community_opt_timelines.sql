-- Partner community OPT/STEM EAD timelines.
-- Sources: opt-tracker.com and opt-pulse.vercel.app, both under written
-- permission from their founders. Self-reported / Reddit-sourced stage dates —
-- NOT USCIS Case Status API data.
-- Used only for anonymized processing-time estimates. No receipt numbers stored.

CREATE TABLE IF NOT EXISTS public.community_opt_timelines (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id          text NOT NULL UNIQUE,
  source               text NOT NULL CHECK (source IN ('reddit', 'registered', 'other')),
  case_kind            text NOT NULL CHECK (case_kind IN ('initial_opt', 'stem_extension')),
  service_center       text CHECK (
    service_center IS NULL OR service_center IN (
      'potomac', 'nebraska', 'texas', 'vermont', 'california', 'nbc'
    )
  ),
  premium_processing   boolean NOT NULL DEFAULT false,
  init_date            date,
  biometrics_date      date,
  pp_date              date,
  approve_date         date,
  card_produce_date    date,
  delivered_date       date,
  nationality          text,
  days_to_approval     integer,
  days_to_produce      integer,
  days_to_deliver      integer,
  external_updated_at  timestamptz,
  ingested_at          timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_opt_timelines_days_to_approval_range
    CHECK (days_to_approval IS NULL OR (days_to_approval BETWEEN 1 AND 400)),
  CONSTRAINT community_opt_timelines_days_to_produce_range
    CHECK (days_to_produce IS NULL OR (days_to_produce BETWEEN 0 AND 120)),
  CONSTRAINT community_opt_timelines_days_to_deliver_range
    CHECK (days_to_deliver IS NULL OR (days_to_deliver BETWEEN 0 AND 90))
);

COMMENT ON TABLE public.community_opt_timelines IS
  'Anonymized community OPT/STEM timelines ingested from partners opt-tracker.com and opt-pulse.vercel.app. Planning estimates only — not official USCIS data.';

CREATE INDEX IF NOT EXISTS community_opt_timelines_match_idx
  ON public.community_opt_timelines (case_kind, premium_processing, service_center)
  WHERE days_to_approval IS NOT NULL;

CREATE INDEX IF NOT EXISTS community_opt_timelines_approve_date_idx
  ON public.community_opt_timelines (approve_date DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS public.community_opt_ingest_runs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at      timestamptz NOT NULL DEFAULT now(),
  finished_at     timestamptz,
  status          text NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'ok', 'error')),
  pages_fetched   integer NOT NULL DEFAULT 0,
  rows_upserted   integer NOT NULL DEFAULT 0,
  rows_skipped    integer NOT NULL DEFAULT 0,
  source_total    integer,
  error_message   text
);

COMMENT ON TABLE public.community_opt_ingest_runs IS
  'Audit log for community OPT timeline ingest cron runs.';

ALTER TABLE public.community_opt_timelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_opt_timelines FORCE ROW LEVEL SECURITY;
ALTER TABLE public.community_opt_ingest_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_opt_ingest_runs FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.community_opt_timelines FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.community_opt_ingest_runs FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.community_opt_timelines TO service_role;
GRANT ALL ON public.community_opt_ingest_runs TO service_role;

DROP TRIGGER IF EXISTS trg_community_opt_timelines_updated_at
  ON public.community_opt_timelines;
CREATE TRIGGER trg_community_opt_timelines_updated_at
  BEFORE UPDATE ON public.community_opt_timelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
