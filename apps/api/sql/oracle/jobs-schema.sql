-- Oracle Database Actions / SQL Worksheet script.
-- Run the entire file with Run Script (F5), not Run Statement (Ctrl+Enter).
-- The first executable statement intentionally creates JOBS. Indexes are
-- defined only after that statement completes.
--
-- This is the shadow job-data schema only. It does not alter Supabase or any
-- user, account, application, resume, OPT, or H-1B tables.
-- IDs remain text so existing Supabase identifiers can be preserved without
-- cross-database foreign keys.

CREATE TABLE jobs (
  id                         VARCHAR2(36 CHAR) NOT NULL,
  source_id                  VARCHAR2(36 CHAR) NOT NULL,
  source_ats                 VARCHAR2(32 CHAR) NOT NULL,
  board_token                VARCHAR2(255 CHAR) NOT NULL,
  external_job_id            VARCHAR2(255 CHAR) NOT NULL,
  title                      VARCHAR2(500 CHAR) NOT NULL,
  company_name               VARCHAR2(500 CHAR) NOT NULL,
  location                   VARCHAR2(1000 CHAR),
  department                 VARCHAR2(500 CHAR),
  description                CLOB,
  job_url                    VARCHAR2(2000 CHAR),
  posted_at                  TIMESTAMP(6) WITH TIME ZONE,
  updated_at                 TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  opt_eligible               NUMBER(1),
  stem_opt_eligible          NUMBER(1),
  cpt_eligible               NUMBER(1),
  h1b_sponsor_status         VARCHAR2(64 CHAR),
  created_at                 TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  first_seen_at              TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  last_confirmed_at          TIMESTAMP(6) WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL,
  listing_status             VARCHAR2(16 CHAR) DEFAULT 'open' NOT NULL,
  employer_board_name        VARCHAR2(500 CHAR),
  source_trust_tier          VARCHAR2(32 CHAR) DEFAULT 'verified_ats' NOT NULL,
  employer_match_id          VARCHAR2(36 CHAR),
  missing_since_at           TIMESTAMP(6) WITH TIME ZONE,
  removed_at                 TIMESTAMP(6) WITH TIME ZONE,
  CONSTRAINT jobs_pk PRIMARY KEY (id),
  CONSTRAINT jobs_source_board_external_uk
    UNIQUE (source_ats, board_token, external_job_id),
  CONSTRAINT jobs_source_ats_ck CHECK (
    source_ats IN (
      'greenhouse', 'lever', 'ashby', 'workday', 'smartrecruiters',
      'workable', 'recruitee', 'personio', 'bamboohr', 'breezy',
      'successfactors', 'rippling', 'consumer_board'
    )
  ),
  CONSTRAINT jobs_listing_status_ck
    CHECK (listing_status IN ('open', 'stale', 'removed')),
  CONSTRAINT jobs_source_trust_tier_ck
    CHECK (source_trust_tier IN ('verified_ats', 'consumer_board')),
  CONSTRAINT jobs_listing_lifecycle_timestamps_ck CHECK (
    (listing_status = 'open' AND missing_since_at IS NULL AND removed_at IS NULL)
    OR (listing_status = 'stale' AND missing_since_at IS NOT NULL AND removed_at IS NULL)
    OR (listing_status = 'removed' AND missing_since_at IS NOT NULL AND removed_at IS NOT NULL)
  ),
  CONSTRAINT jobs_opt_eligible_ck CHECK (opt_eligible IN (0, 1) OR opt_eligible IS NULL),
  CONSTRAINT jobs_stem_opt_eligible_ck CHECK (stem_opt_eligible IN (0, 1) OR stem_opt_eligible IS NULL),
  CONSTRAINT jobs_cpt_eligible_ck CHECK (cpt_eligible IN (0, 1) OR cpt_eligible IS NULL)
);

-- These indexes match the shadow adapter's verified-feed, source-reconcile,
-- company, location, and employer-match lookups. Supabase-only evidence and
-- user-tracker tables are deliberately not represented here.
CREATE INDEX jobs_active_feed_idx
  ON jobs (posted_at DESC, last_confirmed_at DESC);
CREATE INDEX jobs_company_name_idx ON jobs (company_name);
CREATE INDEX jobs_location_idx ON jobs (location);
CREATE INDEX jobs_source_id_idx ON jobs (source_id);
CREATE INDEX jobs_employer_match_id_idx ON jobs (employer_match_id);

-- Post-run verification. Oracle stores an unquoted JOBS identifier in uppercase.
SELECT table_name
FROM user_tables
WHERE table_name = 'JOBS';

SELECT index_name
FROM user_indexes
WHERE table_name = 'JOBS'
ORDER BY index_name;
