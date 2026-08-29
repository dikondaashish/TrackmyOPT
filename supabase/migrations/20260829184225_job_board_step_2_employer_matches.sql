-- Step 2: explicit, source-anchored employer identity matches. This is the
-- only allowed path from a discovered job to a canonical H-1B sponsor.
CREATE TABLE public.employer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES public.ats_sources (id) ON DELETE RESTRICT,
  job_source_company_name text NOT NULL,
  normalized_source_company_name text NOT NULL,
  canonical_h1b_sponsor_id text REFERENCES public.h1b_sponsors (id) ON DELETE RESTRICT,
  match_method text NOT NULL CHECK (match_method IN ('exact', 'alias', 'reviewed')),
  confidence numeric(4,3) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  review_status text NOT NULL CHECK (
    review_status IN ('auto', 'pending_review', 'confirmed', 'rejected')
  ),
  review_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employer_matches_source_name_key
    UNIQUE (source_id, normalized_source_company_name),
  CONSTRAINT employer_matches_resolution_state_check CHECK (
    (review_status IN ('auto', 'confirmed') AND canonical_h1b_sponsor_id IS NOT NULL)
    OR (review_status IN ('pending_review', 'rejected') AND canonical_h1b_sponsor_id IS NULL)
  )
);

ALTER TABLE public.jobs
  ADD COLUMN employer_match_id uuid
    REFERENCES public.employer_matches (id) ON DELETE SET NULL;

CREATE INDEX employer_matches_canonical_h1b_sponsor_id_idx
  ON public.employer_matches (canonical_h1b_sponsor_id)
  WHERE canonical_h1b_sponsor_id IS NOT NULL;
CREATE INDEX jobs_employer_match_id_idx
  ON public.jobs (employer_match_id)
  WHERE employer_match_id IS NOT NULL;

ALTER TABLE public.employer_matches ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER employer_matches_set_updated_at
  BEFORE UPDATE ON public.employer_matches
  FOR EACH ROW EXECUTE FUNCTION public.job_board_set_updated_at();

-- A job can only point to a match produced for its own authorized board. This
-- prevents a raw company string from being used to attach another employer.
CREATE OR REPLACE FUNCTION public.assert_job_employer_match_identity()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  configured_match public.employer_matches;
BEGIN
  IF NEW.employer_match_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO configured_match
  FROM public.employer_matches
  WHERE id = NEW.employer_match_id;

  IF NOT FOUND OR configured_match.source_id <> NEW.source_id THEN
    RAISE EXCEPTION 'Job employer match must belong to the same ATS source';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER jobs_assert_employer_match_identity
  BEFORE INSERT OR UPDATE OF source_id, employer_match_id ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.assert_job_employer_match_identity();

-- Candidate lookup is deliberately separate from jobs and returns all legal
-- entities sharing a normalized name. Ambiguity therefore becomes a review
-- task instead of a silent source-to-sponsor assignment.
CREATE OR REPLACE FUNCTION public.normalize_employer_match_name(
  value text,
  remove_entity_suffix boolean DEFAULT false
)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(regexp_replace(
    CASE WHEN remove_entity_suffix THEN
      regexp_replace(lower(coalesce(value, '')),
        '\m(incorporated|inc|llc|ltd|limited|corp|corporation|company|co|lp|llp|pllc)\M\.?', ' ', 'g')
    ELSE lower(coalesce(value, ''))
    END,
    '[^a-z0-9]+', ' ', 'g'
  ));
$$;

CREATE OR REPLACE FUNCTION public.find_h1b_sponsor_match_candidates(company_name text)
RETURNS TABLE (
  id text,
  name text,
  normalized_name text,
  collision_key text
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
    sponsor.id,
    sponsor.name,
    public.normalize_employer_match_name(sponsor.name, false),
    public.normalize_employer_match_name(sponsor.name, true)
  FROM public.h1b_sponsors AS sponsor
  WHERE public.normalize_employer_match_name(sponsor.name, false)
      = public.normalize_employer_match_name(company_name, false)
     OR public.normalize_employer_match_name(sponsor.name, true)
      = public.normalize_employer_match_name(company_name, true);
$$;

REVOKE ALL ON FUNCTION public.find_h1b_sponsor_match_candidates(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_h1b_sponsor_match_candidates(text) TO service_role;
