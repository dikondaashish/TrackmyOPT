-- Public lead data must pass through durably rate-limited server routes.
-- service_role continues to insert through those routes and bypasses RLS.

DROP POLICY IF EXISTS "Anyone can insert contact submissions"
  ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can insert partnership inquiries"
  ON public.partnership_inquiries;
DROP POLICY IF EXISTS "Anyone can insert eligibility checks"
  ON public.insurance_eligibility_checks;

REVOKE INSERT ON public.contact_submissions FROM anon, authenticated;
REVOKE INSERT ON public.partnership_inquiries FROM anon, authenticated;
REVOKE INSERT ON public.insurance_eligibility_checks FROM anon, authenticated;
