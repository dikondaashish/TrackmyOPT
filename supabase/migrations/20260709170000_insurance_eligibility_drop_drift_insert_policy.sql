-- Remove schema-drift INSERT policy on insurance_eligibility_checks (audit H-1).
--
-- Production carried a second, untracked permissive INSERT policy
-- ("Authenticated users can insert eligibility checks") with
-- WITH CHECK (auth.uid() IS NOT NULL). Because Postgres OR-combines permissive
-- policies, it let any authenticated user insert a row with ANY user_id via
-- direct PostgREST, defeating the hardened policy added in
-- 20260709160000_insurance_eligibility_insert_check.sql.
--
-- Dropping it leaves the single hardened INSERT policy as the only rule:
--   anon          -> user_id IS NULL only
--   authenticated -> user_id IS NULL or auth.uid() = user_id
--   service_role  -> bypasses RLS

DROP POLICY IF EXISTS "Authenticated users can insert eligibility checks"
  ON public.insurance_eligibility_checks;
