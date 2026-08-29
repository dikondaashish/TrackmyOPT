-- Step 1: source provenance and freshness for the verified ATS feed.
ALTER TABLE public.ats_sources
  ADD COLUMN employer_board_name text;

ALTER TABLE public.jobs
  ADD COLUMN first_seen_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN last_confirmed_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN listing_status text NOT NULL DEFAULT 'open' CHECK (
    listing_status IN ('open', 'stale', 'removed')
  ),
  ADD COLUMN employer_board_name text,
  ADD COLUMN source_trust_tier text NOT NULL DEFAULT 'verified_ats' CHECK (
    source_trust_tier IN ('verified_ats', 'consumer_board')
  );

CREATE INDEX jobs_active_verified_feed_idx
  ON public.jobs (posted_at DESC NULLS LAST, last_confirmed_at DESC)
  WHERE listing_status = 'open' AND source_trust_tier = 'verified_ats';

-- Jobs are discovery records, not user-owned private data. Authenticated users
-- can read only verified-source records; configuration and audit rows remain
-- service-role-only under their existing RLS settings.
CREATE POLICY "Authenticated users can read verified job feed"
  ON public.jobs FOR SELECT
  TO authenticated
  USING (source_trust_tier = 'verified_ats');

GRANT SELECT ON public.jobs TO authenticated;
