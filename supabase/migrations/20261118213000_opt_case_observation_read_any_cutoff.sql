-- The daily forecast refresh still failed on Nov 18, 2026 at 20:15 UTC after
-- the observation table was vacuumed (TRACKMYOPT-36): the first read of its
-- backtest asks for evidence as of 90 days ago. No observation is that old,
-- so the old query walked the whole primary key (~71k heap rows) looking for
-- 1,000 matches and took ~9.6 s against the 8 s API statement timeout. Later
-- pages of today's read could also plan a full merge join (~8.5 s).
--
-- Drive every page from the small boundary-id list instead: compute the
-- first/last id per (case, evidence) as of the cutoff (index-only scan), pick
-- the page of ids after p_after that have an identity row, then fetch only
-- those rows by primary key. Measured on production: 0.44 s for a cutoff with
-- no data and 1.8 s for a mid-table page of today's read.
--
-- Same rows, order and limit as before (each boundary id already satisfies
-- the cutoff; ids without an identity row are skipped, as the old inner join
-- did, and still count against nothing). Signature, security and grants are
-- unchanged.
CREATE OR REPLACE FUNCTION public.read_opt_case_observations(p_cutoff timestamptz,p_after bigint DEFAULT 0,p_limit integer DEFAULT 1000)
RETURNS TABLE(id bigint,case_id uuid,application_id uuid,observed_at timestamptz,synced_at timestamptz,provider jsonb,reported jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  WITH boundaries AS (
    SELECT min(o.id) first_id,max(o.id) last_id FROM public.opt_case_observations o
    WHERE o.observed_at<=p_cutoff
    GROUP BY o.case_id,o.evidence_key
  ), ids AS MATERIALIZED (
    SELECT first_id AS id FROM boundaries UNION SELECT last_id FROM boundaries
  ), page AS MATERIALIZED (
    SELECT ids.id FROM ids
    WHERE ids.id>p_after
      AND EXISTS (
        SELECT 1 FROM public.opt_case_observations o2
        JOIN public.opt_case_identity i2 ON i2.case_id=o2.case_id
        WHERE o2.id=ids.id
      )
    ORDER BY ids.id LIMIT greatest(1,least(p_limit,1000))
  )
  SELECT o.id,o.case_id,i.application_id,o.observed_at,o.synced_at,o.provider,o.reported
  FROM page
  JOIN public.opt_case_observations o ON o.id=page.id
  JOIN public.opt_case_identity i ON i.case_id=o.case_id
  ORDER BY o.id;
$$;
REVOKE ALL ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) TO service_role;
