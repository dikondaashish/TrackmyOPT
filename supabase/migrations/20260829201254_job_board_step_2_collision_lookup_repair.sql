-- Repair the original collision-key regex escaping. The first Step 2 migration
-- is otherwise unchanged; this only restores its intended ambiguity lookup.
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

NOTIFY pgrst, 'reload schema';
