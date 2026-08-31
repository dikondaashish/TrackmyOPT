-- Additive discovery foundation for the technology-job aggregation engine.
-- Existing ats_sources/jobs remain the live compatibility path. A discovered
-- board cannot enter that path until its verification_status is `verified`.

CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  h1b_sponsor_id text UNIQUE REFERENCES public.h1b_sponsors (id) ON DELETE SET NULL,
  name text NOT NULL CHECK (length(btrim(name)) > 0),
  legal_name text,
  website text CHECK (website IS NULL OR website ~* '^https://'),
  domain text CHECK (domain IS NULL OR domain ~* '^[a-z0-9][a-z0-9.-]+$'),
  careers_url text CHECK (careers_url IS NULL OR careers_url ~* '^https://'),
  country text,
  industry text,
  company_size text,
  discovery_status text NOT NULL DEFAULT 'seeded' CHECK (
    discovery_status IN (
      'seeded', 'pending_discovery', 'discovered', 'verified', 'rejected', 'inactive'
    )
  ),
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Multiple legal H-1B sponsor entities can share one public brand/domain.
-- Keep that collision visible for verification instead of silently merging it.
CREATE INDEX companies_domain_idx
  ON public.companies (lower(domain))
  WHERE domain IS NOT NULL;
CREATE INDEX companies_discovery_queue_idx
  ON public.companies (discovery_status, last_checked_at NULLS FIRST, id);
CREATE INDEX companies_h1b_sponsor_id_idx
  ON public.companies (h1b_sponsor_id)
  WHERE h1b_sponsor_id IS NOT NULL;

CREATE TABLE public.company_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (
    source_type IN (
      'h1b_sponsor', 'user_provided', 'yc', 'vc_portfolio',
      'public_directory', 'search_provider', 'ats_reverse', 'previously_discovered'
    )
  ),
  source_key text NOT NULL CHECK (length(btrim(source_key)) > 0),
  source_url text CHECK (source_url IS NULL OR source_url ~* '^https://'),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  observed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT company_sources_identity_key UNIQUE (company_id, source_type, source_key)
);

CREATE INDEX company_sources_company_id_idx
  ON public.company_sources (company_id);
CREATE INDEX company_sources_type_observed_idx
  ON public.company_sources (source_type, observed_at DESC);

CREATE TABLE public.ats_platforms (
  key text PRIMARY KEY CHECK (key ~ '^[a-z0-9_]+$'),
  display_name text NOT NULL CHECK (length(btrim(display_name)) > 0),
  priority smallint NOT NULL CHECK (priority BETWEEN 1 AND 3),
  adapter_key text NOT NULL CHECK (length(btrim(adapter_key)) > 0),
  access_mode text NOT NULL CHECK (
    access_mode IN ('public_api', 'public_career_page')
  ),
  authorization_status text NOT NULL DEFAULT 'pending_review' CHECK (
    authorization_status IN ('approved', 'pending_review', 'blocked')
  ),
  discovery_enabled boolean NOT NULL DEFAULT true,
  default_requests_per_minute integer NOT NULL CHECK (default_requests_per_minute > 0),
  default_requests_per_day integer NOT NULL CHECK (default_requests_per_day > 0),
  policy_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ats_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies (id) ON DELETE RESTRICT,
  platform_key text NOT NULL REFERENCES public.ats_platforms (key) ON DELETE RESTRICT,
  board_token text NOT NULL CHECK (length(btrim(board_token)) > 0),
  board_url text NOT NULL CHECK (board_url ~* '^https://'),
  api_url text CHECK (api_url IS NULL OR api_url ~* '^https://'),
  verification_status text NOT NULL DEFAULT 'detected' CHECK (
    verification_status IN (
      'detected', 'pending_verification', 'verified', 'rejected', 'disabled'
    )
  ),
  confidence numeric(4,3) NOT NULL DEFAULT 0 CHECK (
    confidence >= 0 AND confidence <= 1
  ),
  company_name_match boolean,
  website_match boolean,
  domain_match boolean,
  careers_link_match boolean,
  branding_match boolean,
  verification_evidence jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (
    jsonb_typeof(verification_evidence) = 'object'
  ),
  discovered_by text NOT NULL CHECK (
    discovered_by IN (
      'career_page', 'slug_probe', 'ats_reverse', 'manual', 'legacy_source'
    )
  ),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  verified_at timestamptz,
  refresh_interval_minutes integer NOT NULL DEFAULT 360 CHECK (
    refresh_interval_minutes IN (60, 180, 360, 720, 1440, 2880, 10080, 43200)
  ),
  last_fetch_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  next_retry_at timestamptz,
  legacy_source_id uuid UNIQUE REFERENCES public.ats_sources (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ats_boards_platform_token_key UNIQUE (platform_key, board_token),
  CONSTRAINT ats_boards_verified_state_check CHECK (
    (verification_status = 'verified' AND verified_at IS NOT NULL AND confidence >= 0.900)
    OR verification_status <> 'verified'
  )
);

CREATE INDEX ats_boards_company_id_idx ON public.ats_boards (company_id);
CREATE INDEX ats_boards_platform_status_idx
  ON public.ats_boards (platform_key, verification_status, last_success_at DESC NULLS LAST);
CREATE INDEX ats_boards_fetch_queue_idx
  ON public.ats_boards (next_retry_at NULLS FIRST, last_fetch_at NULLS FIRST, id)
  WHERE verification_status = 'verified';

CREATE TABLE public.source_verification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ats_board_id uuid NOT NULL REFERENCES public.ats_boards (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'in_review', 'approved', 'rejected', 'dismissed')
  ),
  priority smallint NOT NULL DEFAULT 2 CHECK (priority BETWEEN 1 AND 5),
  reason text NOT NULL CHECK (length(btrim(reason)) > 0),
  review_note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT source_verification_resolution_check CHECK (
    (status IN ('approved', 'rejected', 'dismissed') AND reviewed_at IS NOT NULL)
    OR status IN ('pending', 'in_review')
  )
);

CREATE UNIQUE INDEX source_verification_queue_open_board_idx
  ON public.source_verification_queue (ats_board_id)
  WHERE status IN ('pending', 'in_review');
CREATE INDEX source_verification_queue_ats_board_id_idx
  ON public.source_verification_queue (ats_board_id);
CREATE INDEX source_verification_queue_work_idx
  ON public.source_verification_queue (status, priority, created_at);

CREATE TABLE public.discovery_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL CHECK (
    run_type IN ('company_seed', 'career_discovery', 'ats_detection', 'board_verification')
  ),
  status text NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'succeeded', 'partial', 'failed')
  ),
  seed_source text,
  companies_attempted integer NOT NULL DEFAULT 0 CHECK (companies_attempted >= 0),
  careers_found integer NOT NULL DEFAULT 0 CHECK (careers_found >= 0),
  boards_detected integer NOT NULL DEFAULT 0 CHECK (boards_detected >= 0),
  boards_verified integer NOT NULL DEFAULT 0 CHECK (boards_verified >= 0),
  boards_queued_for_review integer NOT NULL DEFAULT 0 CHECK (boards_queued_for_review >= 0),
  checkpoint jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(checkpoint) = 'object'),
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT discovery_runs_timestamps_check CHECK (
    (status = 'queued' AND started_at IS NULL AND completed_at IS NULL)
    OR (status = 'running' AND started_at IS NOT NULL AND completed_at IS NULL)
    OR (status IN ('succeeded', 'partial', 'failed')
      AND started_at IS NOT NULL AND completed_at IS NOT NULL)
  )
);

CREATE INDEX discovery_runs_status_created_idx
  ON public.discovery_runs (status, created_at);

CREATE TABLE public.source_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ats_board_id uuid REFERENCES public.ats_boards (id) ON DELETE CASCADE,
  discovery_run_id uuid REFERENCES public.discovery_runs (id) ON DELETE SET NULL,
  error_type text NOT NULL CHECK (
    error_type IN (
      'http_404', 'http_403', 'http_429', 'http_5xx', 'timeout',
      'schema_changed', 'invalid_board', 'company_mismatch', 'blocked',
      'robots_disallowed', 'malformed_response', 'unknown'
    )
  ),
  http_status integer CHECK (http_status IS NULL OR http_status BETWEEN 100 AND 599),
  message text NOT NULL CHECK (length(btrim(message)) > 0),
  retryable boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  CONSTRAINT source_errors_owner_check CHECK (
    ats_board_id IS NOT NULL OR discovery_run_id IS NOT NULL
  )
);

CREATE INDEX source_errors_board_occurred_idx
  ON public.source_errors (ats_board_id, occurred_at DESC)
  WHERE ats_board_id IS NOT NULL;
CREATE INDEX source_errors_unresolved_idx
  ON public.source_errors (error_type, occurred_at DESC)
  WHERE resolved_at IS NULL;
CREATE INDEX source_errors_discovery_run_id_idx
  ON public.source_errors (discovery_run_id)
  WHERE discovery_run_id IS NOT NULL;

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_verification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_errors ENABLE ROW LEVEL SECURITY;

-- These are internal operations tables. Only the server-side service role can
-- manage them; anon/authenticated users receive neither grants nor policies.
REVOKE ALL ON public.companies FROM anon, authenticated;
REVOKE ALL ON public.company_sources FROM anon, authenticated;
REVOKE ALL ON public.ats_platforms FROM anon, authenticated;
REVOKE ALL ON public.ats_boards FROM anon, authenticated;
REVOKE ALL ON public.source_verification_queue FROM anon, authenticated;
REVOKE ALL ON public.discovery_runs FROM anon, authenticated;
REVOKE ALL ON public.source_errors FROM anon, authenticated;

CREATE POLICY "Service role manages companies"
  ON public.companies FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages company sources"
  ON public.company_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages ATS platforms"
  ON public.ats_platforms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages ATS boards"
  ON public.ats_boards FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages verification queue"
  ON public.source_verification_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages discovery runs"
  ON public.discovery_runs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role manages source errors"
  ON public.source_errors FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Existing ingestion uses ats_sources.company_id for every employer lookup.
-- Index the pre-existing foreign key while this migration is touching the
-- source-management foundation.
CREATE INDEX IF NOT EXISTS ats_sources_company_id_idx
  ON public.ats_sources (company_id)
  WHERE company_id IS NOT NULL;

CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();
CREATE TRIGGER ats_platforms_set_updated_at
  BEFORE UPDATE ON public.ats_platforms
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();
CREATE TRIGGER ats_boards_set_updated_at
  BEFORE UPDATE ON public.ats_boards
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();
CREATE TRIGGER source_verification_queue_set_updated_at
  BEFORE UPDATE ON public.source_verification_queue
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

INSERT INTO public.ats_platforms (
  key, display_name, priority, adapter_key, access_mode,
  authorization_status, discovery_enabled,
  default_requests_per_minute, default_requests_per_day, policy_notes
)
VALUES
  ('greenhouse', 'Greenhouse', 1, 'greenhouse', 'public_api', 'approved', true, 5, 250,
    'Approved public Job Board API basis from Step 0; per-employer verification remains required.'),
  ('lever', 'Lever', 1, 'lever', 'public_api', 'pending_review', true, 5, 250,
    'Technical adapter available; platform policy review required before source activation.'),
  ('ashby', 'Ashby', 1, 'ashby', 'public_api', 'approved', true, 5, 250,
    'Approved public Job Postings API basis from Step 0; per-employer verification remains required.'),
  ('workday', 'Workday', 1, 'workday', 'public_api', 'pending_review', true, 2, 150,
    'Tenant/shard/site must come from an official public careers URL; review before activation.'),
  ('smartrecruiters', 'SmartRecruiters', 1, 'smartrecruiters', 'public_api', 'pending_review', true, 4, 250, NULL),
  ('workable', 'Workable', 1, 'workable', 'public_api', 'pending_review', true, 2, 150, NULL),
  ('recruitee', 'Recruitee', 1, 'recruitee', 'public_api', 'pending_review', true, 4, 250, NULL),
  ('personio', 'Personio', 1, 'personio', 'public_api', 'pending_review', true, 3, 200, NULL),
  ('bamboohr', 'BambooHR', 1, 'bamboohr', 'public_career_page', 'pending_review', true, 3, 200, NULL),
  ('breezy', 'Breezy HR', 1, 'breezy', 'public_career_page', 'pending_review', true, 2, 150, NULL)
ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  priority = EXCLUDED.priority,
  adapter_key = EXCLUDED.adapter_key,
  access_mode = EXCLUDED.access_mode,
  default_requests_per_minute = EXCLUDED.default_requests_per_minute,
  default_requests_per_day = EXCLUDED.default_requests_per_day,
  policy_notes = EXCLUDED.policy_notes;

-- The H-1B sponsor table is the first free company seed. It remains the legal
-- sponsor dataset; companies is a separate public-brand/discovery identity.
INSERT INTO public.companies (
  h1b_sponsor_id, name, legal_name, website, domain, careers_url,
  industry, company_size, discovery_status
)
SELECT
  sponsor.id,
  sponsor.name,
  sponsor.name,
  CASE
    WHEN sponsor.website ~* '^https://' THEN sponsor.website
    WHEN sponsor.website ~* '^http://' THEN 'https://' || substring(sponsor.website FROM 8)
    ELSE 'https://' || sponsor.website
  END,
  lower(regexp_replace(
    split_part(
      regexp_replace(sponsor.website, '^https?://', '', 'i'),
      '/', 1
    ),
    '^www\.', '', 'i'
  )),
  CASE
    WHEN sponsor.careers_url IS NULL OR btrim(sponsor.careers_url) = '' THEN NULL
    WHEN sponsor.careers_url ~* '^https://' THEN sponsor.careers_url
    WHEN sponsor.careers_url ~* '^http://' THEN 'https://' || substring(sponsor.careers_url FROM 8)
    ELSE 'https://' || sponsor.careers_url
  END,
  sponsor.industry,
  sponsor.size,
  CASE
    WHEN sponsor.careers_url IS NOT NULL AND btrim(sponsor.careers_url) <> ''
      THEN 'pending_discovery'
    ELSE 'seeded'
  END
FROM public.h1b_sponsors AS sponsor
WHERE sponsor.website IS NOT NULL
  AND btrim(sponsor.website) <> ''
ON CONFLICT (h1b_sponsor_id) DO NOTHING;

INSERT INTO public.company_sources (company_id, source_type, source_key, source_url)
SELECT company.id, 'h1b_sponsor', company.h1b_sponsor_id, company.website
FROM public.companies AS company
WHERE company.h1b_sponsor_id IS NOT NULL
ON CONFLICT (company_id, source_type, source_key) DO NOTHING;

-- Backfill only sources that were already manually authorized and enabled.
INSERT INTO public.ats_boards (
  company_id, platform_key, board_token, board_url,
  verification_status, confidence,
  company_name_match, website_match, domain_match, careers_link_match,
  verification_evidence, discovered_by, verified_at,
  refresh_interval_minutes, legacy_source_id
)
SELECT
  company.id,
  source.ats_type,
  source.board_token,
  source.base_url,
  'verified',
  1.000,
  true,
  true,
  true,
  true,
  jsonb_build_object(
    'basis', 'legacy_source_onboarding',
    'employer_board_name', source.employer_board_name,
    'source_id', source.id
  ),
  'legacy_source',
  source.updated_at,
  60,
  source.id
FROM public.ats_sources AS source
JOIN public.companies AS company
  ON company.h1b_sponsor_id = source.company_id
WHERE source.enabled
ON CONFLICT (platform_key, board_token) DO NOTHING;

NOTIFY pgrst, 'reload schema';
