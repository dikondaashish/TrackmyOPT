-- Defense-in-depth for insurance_eligibility_checks INSERT (security audit H-1).
--
-- The API route (app/api/insurance-eligibility/route.ts) uses the service-role
-- client and is the real enforcement point; it now derives user_id from the
-- verified session only. This migration hardens the RLS policy so that any
-- direct anon/authenticated PostgREST insert cannot attribute a check to
-- another user either. Anonymous lead-gen inserts (user_id IS NULL) remain
-- allowed; service_role continues to bypass RLS.

DROP POLICY IF EXISTS "Anyone can insert eligibility checks"
  ON public.insurance_eligibility_checks;

CREATE POLICY "Anyone can insert eligibility checks"
  ON public.insurance_eligibility_checks
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
