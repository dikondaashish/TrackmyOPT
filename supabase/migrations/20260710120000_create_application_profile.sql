-- application_profile: optional, user-provided data for job-application autofill
-- (LinkedIn Easy Apply + ATS prefill in the Chrome extension).
--
-- INVARIANT: this table NEVER stores work-authorization, visa/sponsorship, EEO,
-- or demographic data. Those are answered by the user directly on each
-- application and must never be persisted here.

CREATE TABLE IF NOT EXISTS public.application_profile (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone            text,
  city             text,
  state            text,
  years_experience smallint CHECK (years_experience >= 0 AND years_experience <= 80),
  linkedin_url     text,
  portfolio_url    text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.application_profile IS
  'User-provided autofill data (contact + location + experience). NEVER stores work-authorization, visa, EEO, or demographic data.';

ALTER TABLE public.application_profile ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage their own application_profile"
    ON public.application_profile
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DROP TRIGGER IF EXISTS trg_application_profile_updated_at ON public.application_profile;
CREATE TRIGGER trg_application_profile_updated_at
  BEFORE UPDATE ON public.application_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scoped grants (RLS is the gate; anon gets nothing).
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_profile TO authenticated;
GRANT ALL ON public.application_profile TO service_role;
