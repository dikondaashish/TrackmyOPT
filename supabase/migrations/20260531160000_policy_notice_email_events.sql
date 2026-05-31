-- Policy update notice email audit (service-role inserts only)

CREATE TABLE IF NOT EXISTS public.policy_notice_email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  notice_type TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider_message_id TEXT,
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT policy_notice_email_events_status_check
    CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  CONSTRAINT policy_notice_email_events_email_notice_unique UNIQUE (email, notice_type)
);

CREATE INDEX IF NOT EXISTS idx_policy_notice_email_events_notice_type_status
  ON public.policy_notice_email_events(notice_type, status);

CREATE INDEX IF NOT EXISTS idx_policy_notice_email_events_user_id
  ON public.policy_notice_email_events(user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.policy_notice_email_events ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.policy_notice_email_events IS
  'Audit log for legal/policy update transactional emails (idempotent by email + notice_type).';
