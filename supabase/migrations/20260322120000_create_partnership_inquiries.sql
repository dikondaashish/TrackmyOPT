-- Migration: 20260322_create_partnership_inquiries
-- Description: Stores lead gen from the /partnerships form

CREATE TABLE IF NOT EXISTS public.partnership_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  university TEXT NOT NULL,
  role TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.partnership_inquiries IS 'Inbound institutional partnership requests from the B2B landing page';

CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_created_at
  ON public.partnership_inquiries (created_at DESC);

ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert partnership inquiries"
  ON public.partnership_inquiries FOR INSERT
  WITH CHECK (true);

GRANT ALL ON public.partnership_inquiries TO service_role;
