-- Migration: create_contact_submissions_table
-- Contact form storage + allow email_queue rows without auth user (public contact auto-reply)

CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.contact_submissions IS 'Inbound messages from /contact and related flows';

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
  ON public.contact_submissions (created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

GRANT ALL ON public.contact_submissions TO service_role;

-- Contact auto-reply may not have a logged-in user
ALTER TABLE public.email_queue ALTER COLUMN user_id DROP NOT NULL;
