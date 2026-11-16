-- read_opt_case_observations hit the statement timeout (57014) with ~67k
-- observations (TRACKMYOPT-36 / -2Y), failing the daily forecast refresh.
-- EXPLAIN ANALYZE showed nearly all of the ~10 s in reading and comparing the
-- TOASTed provider/reported jsonb of every row to find each case's first/last
-- identical evidence, recomputed on every page and every as-of cutoff. Hashing
-- them at query time still took ~7 s.
--
-- Store the evidence key once per row (a generated column, computed on insert)
-- and index it, so the boundaries come from a small index-only scan and never
-- read the jsonb. Equal jsonb values print identically, so grouping by the md5
-- of their canonical text matches grouping by the values (numerically equal
-- numbers written with different scale, e.g. 1.0 and 1.00, now count as
-- different evidence and add a boundary row). Every insert names its columns,
-- so the new column needs no writer changes. Signature, security and grants
-- of the read function are unchanged.
--
-- The ADD COLUMN rewrites the table once (~67k rows) under an exclusive lock;
-- apply it away from the 14:00 UTC daily case sync.
ALTER TABLE public.opt_case_observations
  ADD COLUMN IF NOT EXISTS evidence_key text
  GENERATED ALWAYS AS (md5(provider::text) || md5(reported::text)) STORED;

CREATE INDEX IF NOT EXISTS opt_observation_evidence_key
  ON public.opt_case_observations (case_id, evidence_key) INCLUDE (id, observed_at);

CREATE OR REPLACE FUNCTION public.read_opt_case_observations(p_cutoff timestamptz,p_after bigint DEFAULT 0,p_limit integer DEFAULT 1000)
RETURNS TABLE(id bigint,case_id uuid,application_id uuid,observed_at timestamptz,synced_at timestamptz,provider jsonb,reported jsonb)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  WITH boundaries AS (
    SELECT min(o.id) first_id,max(o.id) last_id FROM public.opt_case_observations o
    WHERE o.observed_at<=p_cutoff
    GROUP BY o.case_id,o.evidence_key
  )
  SELECT o.id,o.case_id,i.application_id,o.observed_at,o.synced_at,o.provider,o.reported
  FROM public.opt_case_observations o JOIN public.opt_case_identity i ON i.case_id=o.case_id
  WHERE o.id>p_after AND o.observed_at<=p_cutoff
    AND o.id IN (SELECT first_id FROM boundaries UNION SELECT last_id FROM boundaries)
  ORDER BY o.id LIMIT greatest(1,least(p_limit,1000));
$$;
REVOKE ALL ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.read_opt_case_observations(timestamptz,bigint,integer) TO service_role;

ANALYZE public.opt_case_observations;
