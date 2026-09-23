-- Additive case-linked organizer. No existing applicant records are changed.
CREATE TABLE IF NOT EXISTS public.case_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.case_status(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.documents(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  kind text NOT NULL CHECK (kind IN ('receipt','rfe','noid','approval','dso','other')),
  due_date date,
  deadline_confirmed_at timestamptz,
  completed_at timestamptz,
  email_reminder boolean NOT NULL DEFAULT false,
  reminder_state text NOT NULL DEFAULT 'off' CHECK (reminder_state IN ('off','pending','sending','sent','failed','cancelled')),
  reminder_sent_at timestamptz,
  reminder_started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (due_date IS NULL OR deadline_confirmed_at IS NOT NULL),
  CHECK (NOT email_reminder OR due_date IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS case_notices_owner_idx ON public.case_notices(user_id, case_id);
CREATE INDEX IF NOT EXISTS case_notices_due_idx ON public.case_notices(due_date) WHERE reminder_state = 'pending';
ALTER TABLE public.case_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_notices FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.case_notices FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.case_notices TO authenticated;
GRANT ALL ON public.case_notices TO service_role;
CREATE POLICY case_notices_read_own ON public.case_notices FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()) AND EXISTS (
    SELECT 1 FROM public.case_status c WHERE c.id = case_id AND c.user_id = (SELECT auth.uid())
  ));
COMMENT ON TABLE public.case_notices IS 'User-confirmed case notices/deadlines. API verifies case and document ownership. Reminder sent means SMTP acceptance, not inbox delivery.';
