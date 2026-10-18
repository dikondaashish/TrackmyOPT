-- Automatic OPT / STEM OPT policy-news blog posts.
--
-- The /api/cron/policy-news-blog cron watches official government sources
-- (Federal Register, USCIS alerts, Study in the States), stores each candidate
-- once, has Gemini write an article for relevant ones, and publishes it at
-- /blog/<slug> without manual review.
--
-- Only the server (service_role) reads or writes these tables. They hold
-- public government notices and generated articles, never applicant data.

-- One row per government notice that passed the keyword filter.
CREATE TABLE IF NOT EXISTS public.policy_news_items (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source         text NOT NULL CHECK (source IN ('federal_register', 'uscis_alerts', 'study_in_the_states')),
  external_id    text NOT NULL CHECK (char_length(external_id) <= 500),
  title          text NOT NULL CHECK (char_length(title) <= 1000),
  url            text NOT NULL CHECK (url ~ '^https://' AND char_length(url) <= 2000),
  document_type  text CHECK (char_length(document_type) <= 100),
  published_at   timestamptz,
  summary        text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 20000),
  full_text_url  text CHECK (full_text_url ~ '^https://' AND char_length(full_text_url) <= 2000),
  -- pending -> processing -> published | skipped (not relevant) | failed (gave up)
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'processing', 'published', 'skipped', 'failed')),
  attempts       integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  claimed_at     timestamptz,
  error_code     text CHECK (char_length(error_code) <= 120),
  article_slug   text CHECK (char_length(article_slug) <= 120),
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS policy_news_items_status_idx
  ON public.policy_news_items (status, created_at);

COMMENT ON TABLE public.policy_news_items IS
  'Official OPT/STEM OPT policy notices seen by the policy-news blog cron. Public government data only.';

-- Published generated articles, rendered by app/blog/[slug].
CREATE TABLE IF NOT EXISTS public.auto_blog_posts (
  slug            text PRIMARY KEY
                  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND char_length(slug) <= 120),
  -- A ResearchArticle (apps/web/data/blog-series/types.ts).
  article         jsonb NOT NULL CHECK (jsonb_typeof(article) = 'object'),
  source_item_id  bigint REFERENCES public.policy_news_items (id) ON DELETE SET NULL,
  published_at    timestamptz NOT NULL DEFAULT now(),
  -- Set to take a post down; the blog stops serving it within an hour.
  unpublished_at  timestamptz,
  -- AI-generated 1200x630 WebP cover, served at /blog-covers/<slug>.webp.
  cover_image     bytea CHECK (octet_length(cover_image) <= 2000000),
  -- Set when an admin reviews the post in Settings; it then carries the
  -- standard Vinay Kumar byline instead of "TrackMyOPT News Desk".
  reviewed_at     timestamptz,
  reviewed_by     text CHECK (char_length(reviewed_by) <= 320),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auto_blog_posts_published_idx
  ON public.auto_blog_posts (published_at DESC) WHERE unpublished_at IS NULL;

COMMENT ON TABLE public.auto_blog_posts IS
  'Automatically generated policy-news blog articles served at /blog/<slug>.';

DROP TRIGGER IF EXISTS trg_policy_news_items_updated_at ON public.policy_news_items;
CREATE TRIGGER trg_policy_news_items_updated_at
  BEFORE UPDATE ON public.policy_news_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_auto_blog_posts_updated_at ON public.auto_blog_posts;
CREATE TRIGGER trg_auto_blog_posts_updated_at
  BEFORE UPDATE ON public.auto_blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.policy_news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_news_items FORCE ROW LEVEL SECURITY;
ALTER TABLE public.auto_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_blog_posts FORCE ROW LEVEL SECURITY;

REVOKE ALL ON public.policy_news_items FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.auto_blog_posts FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.policy_news_items TO service_role;
GRANT ALL ON public.auto_blog_posts TO service_role;
