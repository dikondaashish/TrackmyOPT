-- Backfill migration: record the live shape of six tables that exist in
-- production but had no tracked CREATE migration (security audit reconciliation).
--
-- Verified against project deknauqkqqzwuvopqott via information_schema/pg_catalog.
-- Fully additive and idempotent: CREATE TABLE/INDEX IF NOT EXISTS + policy guards,
-- so applying against production (where these already exist) is a no-op, while a
-- fresh rebuild reproduces prod exactly. RLS state and policies mirror live,
-- including tables intentionally left with NO policies (service-role-only).
--
-- All user_id columns reference auth.users(id) ON DELETE CASCADE — the standard
-- pattern across this schema (matches the *_user_id_fkey / CASCADE seen live).

-- =============================================================================
-- job_stages  (job tracker kanban columns; created via applied migration
-- 20260205234316 create_job_stages_table, never captured in the repo)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.job_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title text NOT NULL,
  color text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.job_stages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own stages" ON public.job_stages
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert their own stages" ON public.job_stages
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update their own stages" ON public.job_stages
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete their own stages" ON public.job_stages
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- ocr_jobs  (durable Textract OCR job state; created out-of-band, no migration
-- record at all). Note: live has INSERT/SELECT/UPDATE policies but NO DELETE.
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.ocr_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  textract_job_id text NOT NULL,
  status text NOT NULL DEFAULT 'IN_PROGRESS'::text,
  s3_key text NOT NULL,
  file_name text,
  extracted_text text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ocr_jobs ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ocr_jobs_user_id ON public.ocr_jobs USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_textract_job_id ON public.ocr_jobs USING btree (textract_job_id);
CREATE INDEX IF NOT EXISTS idx_ocr_jobs_status_updated ON public.ocr_jobs USING btree (status, updated_at);

DO $$ BEGIN
  CREATE POLICY "ocr_jobs_select_own" ON public.ocr_jobs
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "ocr_jobs_insert_own" ON public.ocr_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "ocr_jobs_update_own" ON public.ocr_jobs
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- referrals  (referral codes + counters; created via applied migration
-- 20260302170303 create_referrals_table, never captured in the repo).
-- RLS enabled with NO policies -> only service_role can read/write (matches live).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  owner_email text,
  clicks integer NOT NULL DEFAULT 0,
  signups integer NOT NULL DEFAULT 0,
  premium_conversions integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Redundant-but-real: a secondary non-unique index on code also exists live.
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals USING btree (code);

-- =============================================================================
-- resume_drafts  (resume-builder autosave; created out-of-band, no migration).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.resume_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  draft_key text NOT NULL,
  step text,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, draft_key)
);
ALTER TABLE public.resume_drafts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_resume_drafts_user_id_updated
  ON public.resume_drafts USING btree (user_id, updated_at DESC);

DO $$ BEGIN
  CREATE POLICY "resume_drafts_select_own" ON public.resume_drafts
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "resume_drafts_insert_own" ON public.resume_drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "resume_drafts_update_own" ON public.resume_drafts
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "resume_drafts_delete_own" ON public.resume_drafts
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- resumes  (parsed resume records; created out-of-band, no migration).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  filename text NOT NULL,
  description text,
  content text,
  structured_data jsonb,
  is_parsed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  file_path text
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own resumes" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert their own resumes" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update their own resumes" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete their own resumes" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- uscis_check_log  (USCIS lookup telemetry; created out-of-band, no migration).
-- bigint identity via bigserial reproduces the live uscis_check_log_id_seq.
-- RLS enabled with NO policies -> service_role-only (matches live; consistent
-- with the other uscis_* audit tables).
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.uscis_check_log (
  id bigserial PRIMARY KEY,
  receipt_number text NOT NULL,
  success boolean NOT NULL,
  source text NOT NULL,
  duration_ms integer,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.uscis_check_log ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_uscis_check_log_receipt
  ON public.uscis_check_log USING btree (receipt_number);
CREATE INDEX IF NOT EXISTS idx_uscis_check_log_created_at
  ON public.uscis_check_log USING btree (created_at DESC);
