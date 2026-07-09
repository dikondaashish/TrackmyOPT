-- Create saved_resumes, which is referenced by the RLS policy in
-- 20260322_enforce_core_rls.sql but was never created (neither in this repo's
-- migrations nor in the live DB). Its absence meant the policy there was a
-- no-op and a clean migration replay would reference a missing table.
--
-- Note: h1b_sponsors and h1b_filings are ALSO referenced by RLS/views but were
-- created out-of-band directly on the live DB (they exist there already), so
-- they are intentionally NOT re-created here — doing so would be dead/duplicate
-- DDL. If you need a reproducible history for them, add a separate migration
-- mirroring apps/web/types/supabase.ts, but do not re-run it against the
-- current live project.

CREATE TABLE IF NOT EXISTS public.saved_resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 20260322_enforce_core_rls.sql used `ALTER TABLE IF EXISTS`, which was a
-- no-op for saved_resumes at the time (table didn't exist yet). Enable RLS and
-- create the user-owned policy it expected.
ALTER TABLE public.saved_resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can fully manage their own saved_resumes"
  ON public.saved_resumes;

CREATE POLICY "Users can fully manage their own saved_resumes"
  ON public.saved_resumes
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
