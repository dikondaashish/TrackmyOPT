-- Backfill RPC definitions referenced by production routes and data scripts.
-- Every function is service-role only; public/authenticated callers use APIs.

-- This view previously existed only in the legacy schema snapshot. Defining it
-- here keeps a migration-only database reset complete.
CREATE OR REPLACE VIEW public.sponsor_intelligence_agg
WITH (security_invoker = on)
AS
WITH latest_filings AS (
  SELECT DISTINCT ON (filing.sponsor_id)
    filing.sponsor_id,
    filing.employer_address1,
    filing.employer_city,
    filing.employer_state
  FROM public.h1b_filings AS filing
  WHERE filing.sponsor_id IS NOT NULL
  ORDER BY filing.sponsor_id, filing.received_date DESC
),
law_firm_stats AS (
  SELECT
    filing.sponsor_id,
    filing.lawfirm_name,
    count(*) AS filing_count
  FROM public.h1b_filings AS filing
  WHERE filing.sponsor_id IS NOT NULL
    AND filing.lawfirm_name IS NOT NULL
  GROUP BY filing.sponsor_id, filing.lawfirm_name
),
top_firms AS (
  SELECT DISTINCT ON (stats.sponsor_id)
    stats.sponsor_id,
    stats.lawfirm_name AS top_law_firm
  FROM law_firm_stats AS stats
  ORDER BY stats.sponsor_id, stats.filing_count DESC
),
wage_stats AS (
  SELECT
    filing.sponsor_id,
    count(*) AS total_filings,
    count(*) FILTER (
      WHERE filing.pw_wage_level ILIKE '%I%'
        AND filing.pw_wage_level NOT ILIKE '%II%'
        AND filing.pw_wage_level NOT ILIKE '%IV%'
    ) AS level1_count
  FROM public.h1b_filings AS filing
  WHERE filing.sponsor_id IS NOT NULL
    AND filing.pw_wage_level IS NOT NULL
  GROUP BY filing.sponsor_id
)
SELECT
  sponsor.id AS sponsor_id,
  sponsor.name,
  latest.employer_address1,
  latest.employer_city,
  latest.employer_state,
  firms.top_law_firm,
  CASE
    WHEN wages.total_filings > 0
      THEN wages.level1_count::numeric / wages.total_filings::numeric
    ELSE 0::numeric
  END AS entry_level_percent
FROM public.h1b_sponsors AS sponsor
LEFT JOIN latest_filings AS latest ON sponsor.id = latest.sponsor_id
LEFT JOIN top_firms AS firms ON sponsor.id = firms.sponsor_id
LEFT JOIN wage_stats AS wages ON sponsor.id = wages.sponsor_id;

REVOKE ALL ON public.sponsor_intelligence_agg
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.sponsor_intelligence_agg TO service_role;

CREATE OR REPLACE FUNCTION public.increment_referral_clicks(ref_code TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  UPDATE public.referrals
  SET clicks = clicks + 1
  WHERE lower(code) = lower(trim(ref_code))
    AND is_active = TRUE;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.increment_referral_signups(ref_code TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  UPDATE public.referrals
  SET signups = signups + 1
  WHERE lower(code) = lower(trim(ref_code))
    AND is_active = TRUE;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.increment_referral_conversions(ref_code TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  UPDATE public.referrals
  SET premium_conversions = premium_conversions + 1
  WHERE lower(code) = lower(trim(ref_code))
    AND is_active = TRUE;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION public.get_sponsor_intelligence(target_ids TEXT[])
RETURNS TABLE (
  sponsor_id TEXT,
  employer_address1 TEXT,
  employer_city TEXT,
  employer_state TEXT,
  top_law_firm TEXT,
  entry_level_percent NUMERIC
)
LANGUAGE sql
STABLE
SET search_path = pg_catalog, public
AS $$
  SELECT
    intel.sponsor_id,
    intel.employer_address1,
    intel.employer_city,
    intel.employer_state,
    intel.top_law_firm,
    intel.entry_level_percent
  FROM public.sponsor_intelligence_agg AS intel
  WHERE intel.sponsor_id = ANY(target_ids);
$$;

REVOKE ALL ON FUNCTION public.increment_referral_clicks(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_referral_signups(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_referral_conversions(TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_sponsor_intelligence(TEXT[])
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.increment_referral_clicks(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_referral_signups(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_referral_conversions(TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_sponsor_intelligence(TEXT[]) TO service_role;
