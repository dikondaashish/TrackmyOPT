-- Scope down anon/authenticated grants on insurance_eligibility_checks (audit H-1).
--
-- The table carried an out-of-band blanket GRANT ALL to anon + authenticated.
-- Only INSERT (direct client insert from the insurance-finder page) and SELECT
-- (RLS-scoped own-row reads) are actually used. UPDATE/DELETE have no RLS policy
-- for these roles (already denied) and TRUNCATE/TRIGGER/REFERENCES are not
-- exposed via PostgREST. Revoking them so RLS is not the sole gate.

REVOKE UPDATE, DELETE, TRUNCATE, TRIGGER, REFERENCES
  ON public.insurance_eligibility_checks FROM anon, authenticated;
