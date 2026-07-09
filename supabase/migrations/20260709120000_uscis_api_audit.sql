-- Audit log for every USCIS Case Status API lookup attempt (allowed and blocked).
-- Receipt numbers are stored hashed only — never raw.

CREATE TABLE IF NOT EXISTS public.uscis_api_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  receipt_number_hash text NOT NULL,
  allowed boolean NOT NULL,
  reason text NOT NULL,
  call_site text NOT NULL,
  called_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uscis_api_audit_called_at
  ON public.uscis_api_audit (called_at DESC);

CREATE INDEX IF NOT EXISTS idx_uscis_api_audit_user_id
  ON public.uscis_api_audit (user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE public.uscis_api_audit ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.uscis_api_audit TO service_role;

COMMENT ON TABLE public.uscis_api_audit IS
  'USCIS API compliance audit: enrollment guard decisions before each lookup.';
