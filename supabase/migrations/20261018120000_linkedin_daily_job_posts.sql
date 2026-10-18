-- Daily "jobs for OPT & STEM OPT job seekers" posts on the TrackMyOPT LinkedIn
-- company page.
--
-- Only the server (service_role) reads or writes these tables. LinkedIn OAuth
-- tokens are AES-256-GCM ciphertext produced with LINKEDIN_TOKEN_ENCRYPTION_KEY;
-- plaintext tokens must never be stored here.

-- The single connected company page (one row, id is always true).
CREATE TABLE IF NOT EXISTS public.linkedin_page_connection (
  id                        boolean PRIMARY KEY DEFAULT true CHECK (id),
  organization_urn          text NOT NULL CHECK (organization_urn ~ '^urn:li:organization:[0-9]+$'),
  organization_name         text CHECK (char_length(organization_name) <= 200),
  encrypted_access_token    text NOT NULL CHECK (char_length(encrypted_access_token) <= 8000),
  access_token_expires_at   timestamptz NOT NULL,
  encrypted_refresh_token   text CHECK (char_length(encrypted_refresh_token) <= 8000),
  refresh_token_expires_at  timestamptz,
  scopes                    text CHECK (char_length(scopes) <= 500),
  connected_by_email        text NOT NULL CHECK (char_length(connected_by_email) <= 320),
  connected_at              timestamptz NOT NULL DEFAULT now(),
  -- false = the daily cron only prepares a draft; an admin publishes it.
  auto_publish              boolean NOT NULL DEFAULT false,
  enabled                   boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.linkedin_page_connection IS
  'The LinkedIn company page the daily jobs post publishes to. Server only; tokens are encrypted.';

-- One post per US Eastern calendar day.
CREATE TABLE IF NOT EXISTS public.linkedin_daily_posts (
  post_date          date PRIMARY KEY,
  status             text NOT NULL CHECK (status IN ('draft', 'publishing', 'published', 'failed')),
  commentary         text NOT NULL CHECK (char_length(commentary) <= 3000),
  items              jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(items) = 'array'),
  shown_count        integer NOT NULL DEFAULT 0 CHECK (shown_count >= 0),
  linkedin_post_urn  text CHECK (char_length(linkedin_post_urn) <= 200),
  error_code         text CHECK (char_length(error_code) <= 120),
  published_at       timestamptz,
  published_by       text CHECK (char_length(published_by) <= 320),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.linkedin_daily_posts IS
  'Daily LinkedIn jobs post drafts and their publish outcome. Public job data only.';

-- Short links (trackmyopt.com/j/<code>) for featured jobs; a job keeps one
-- code. Later posts skip jobs that an earlier published post featured.
CREATE TABLE IF NOT EXISTS public.linkedin_job_links (
  code               text PRIMARY KEY CHECK (code ~ '^[A-Za-z0-9]{7}$'),
  job_id             text NOT NULL UNIQUE CHECK (char_length(job_id) <= 200),
  title              text NOT NULL CHECK (char_length(title) <= 300),
  company_name       text NOT NULL CHECK (char_length(company_name) <= 200),
  location           text CHECK (char_length(location) <= 500),
  job_url            text NOT NULL CHECK (job_url ~ '^https?://' AND char_length(job_url) <= 2000),
  domain             text NOT NULL CHECK (domain IN ('software', 'data', 'cybersecurity', 'networking')),
  posted_at          timestamptz,
  first_featured_on  date NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS linkedin_job_links_featured_idx
  ON public.linkedin_job_links (first_featured_on);

COMMENT ON TABLE public.linkedin_job_links IS
  'Public job postings featured in LinkedIn posts, keyed by short link code.';

DROP TRIGGER IF EXISTS trg_linkedin_page_connection_updated_at ON public.linkedin_page_connection;
CREATE TRIGGER trg_linkedin_page_connection_updated_at
  BEFORE UPDATE ON public.linkedin_page_connection
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_linkedin_daily_posts_updated_at ON public.linkedin_daily_posts;
CREATE TRIGGER trg_linkedin_daily_posts_updated_at
  BEFORE UPDATE ON public.linkedin_daily_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.linkedin_page_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_page_connection FORCE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_daily_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_daily_posts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_job_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_job_links FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.linkedin_page_connection FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.linkedin_daily_posts FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.linkedin_job_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.linkedin_page_connection TO service_role;
GRANT ALL ON public.linkedin_daily_posts TO service_role;
GRANT ALL ON public.linkedin_job_links TO service_role;
