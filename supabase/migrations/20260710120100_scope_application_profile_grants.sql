-- Scope down application_profile grants (audit lesson: Supabase default
-- privileges auto-grant ALL to anon/authenticated on new tables). Intended:
--   anon          -> nothing (RLS already blocks it; remove the grant too)
--   authenticated -> SELECT/INSERT/UPDATE/DELETE (own row via RLS)
--   service_role  -> unchanged (full)

REVOKE ALL ON public.application_profile FROM anon;
REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.application_profile FROM authenticated;
