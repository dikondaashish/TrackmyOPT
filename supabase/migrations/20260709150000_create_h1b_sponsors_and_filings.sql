-- Historical migration for h1b_sponsors and h1b_filings.
--
-- These tables are referenced by RLS (20260322_enforce_core_rls.sql) and the
-- sponsor_intelligence_agg view (006_views.sql) but were created out-of-band
-- directly on the live DB, so they had no repo migration. This records their
-- actual deployed shape for reproducible `supabase db push` / migration replay.
--
-- Schema below mirrors the LIVE database exactly (verified via information_schema
-- on project deknauqkqqzwuvopqott). NOTE: it intentionally does NOT match
-- apps/web/types/supabase.ts, which was generated against a newer/divergent
-- intended schema (live uses id uuid + date columns; types declare id text +
-- text dates). That drift is a separate issue and is NOT widened here — using
-- CREATE TABLE IF NOT EXISTS keeps this safe against the existing live tables
-- and faithful to reality.

-- =============================================================================
-- h1b_sponsors (verified live column set)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.h1b_sponsors (
  id text PRIMARY KEY,
  name text NOT NULL,
  industry text,
  size text,
  location text,
  city text,
  state text,
  address_line1 text,
  website text,
  careers_url text,
  common_roles text[],
  approvals_2021 integer,
  approvals_2022 integer,
  approvals_2023 integer,
  approvals_2024 integer,
  approvals_2025 integer,
  total_approvals integer,
  sponsorship_strength text,
  h1b_dependent boolean,
  is_virtual_office boolean,
  entry_level_percent double precision,
  top_law_firm text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================================
-- h1b_filings (verified live column set)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.h1b_filings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number text NOT NULL,
  status text,
  received_date date,
  decision_date date,
  original_cert_date date,
  visa_class text,
  job_title text,
  soc_code text,
  soc_title text,
  full_time_position text,
  begin_date date,
  end_date date,
  total_workers integer,
  employer_name text,
  employer_address1 text,
  employer_address2 text,
  employer_city text,
  employer_state text,
  employer_postal_code text,
  employer_country text,
  employer_phone text,
  employer_phone_ext text,
  employer_province text,
  employer_fein text,
  naics_code text,
  employer_poc_name text,
  employer_poc_job_title text,
  employer_poc_address1 text,
  employer_poc_address2 text,
  employer_poc_city text,
  employer_poc_state text,
  employer_poc_postal_code text,
  employer_poc_province text,
  employer_poc_country text,
  employer_poc_email text,
  employer_poc_phone text,
  employer_poc_phone_ext text,
  agent_attorney_name text,
  agent_attorney_address1 text,
  agent_attorney_address2 text,
  agent_attorney_city text,
  agent_attorney_state text,
  agent_attorney_postal_code text,
  agent_attorney_province text,
  agent_attorney_country text,
  agent_attorney_email text,
  agent_attorney_phone text,
  agent_attorney_phone_ext text,
  agent_representing_employer text,
  lawfirm_name text,
  lawfirm_business_fein text,
  worksite_address1 text,
  worksite_address2 text,
  worksite_city text,
  worksite_county text,
  worksite_state text,
  worksite_postal_code text,
  worksite_workers integer,
  total_worksite_locations integer,
  trade_name_dba text,
  secondary_entity text,
  secondary_entity_business_name text,
  wage_rate_from numeric,
  wage_rate_to numeric,
  wage_unit text,
  prevailing_wage numeric,
  pw_unit text,
  pw_wage_level text,
  pw_source text,
  pw_source_year integer,
  pw_other_source text,
  pw_other_year integer,
  pw_tracking_number text,
  pw_survey_name text,
  pw_survey_publisher text,
  sponsor_id text REFERENCES public.h1b_sponsors (id),
  new_employment integer,
  continued_employment integer,
  change_previous_employment integer,
  new_concurrent_employment integer,
  change_employer integer,
  amended_petition integer,
  h_1b_dependent text,
  willful_violator text,
  support_h1b text,
  appendix_a_attached text,
  public_disclosure text,
  agree_to_lc_statement text,
  statutory_basis text,
  preparer_first_name text,
  preparer_middle_initial text,
  preparer_last_name text,
  preparer_business_name text,
  preparer_email text,
  created_at timestamptz DEFAULT now()
);

-- Indexes the view/scripts actually join or filter on.
CREATE INDEX IF NOT EXISTS idx_h1b_filings_sponsor_id
  ON public.h1b_filings (sponsor_id);
CREATE INDEX IF NOT EXISTS idx_h1b_filings_received_date
  ON public.h1b_filings (received_date);

-- RLS for these tables is already handled by 20260322_enforce_core_rls.sql
-- (idempotent ALTER TABLE IF EXISTS + policies). h1b_sponsors' public-read
-- policy was later dropped by 20260708190000_h1b_rls_lockdown_d1_index.sql.
-- No RLS changes needed here.
