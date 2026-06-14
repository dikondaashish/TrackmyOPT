-- Shared USCIS case cache for nearby-case cohort analysis (MyCasesHub-style).
-- Stores any receipt we have ever scanned so cohorts render instantly and the
-- dataset grows over time. Not user-owned: locked to service role only.

CREATE TABLE IF NOT EXISTS public.uscis_case_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number text NOT NULL UNIQUE,
  prefix text NOT NULL,
  serial bigint NOT NULL,
  current_status text,
  case_type text,
  received_date text,
  status_date text,
  is_valid boolean NOT NULL DEFAULT true,
  last_scanned_at timestamptz NOT NULL DEFAULT now(),
  scan_attempts integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uscis_case_cache_prefix_serial
  ON public.uscis_case_cache (prefix, serial);

CREATE INDEX IF NOT EXISTS idx_uscis_case_cache_last_scanned
  ON public.uscis_case_cache (last_scanned_at);

-- Lock down: this is aggregate data accessed only via service-role API routes.
ALTER TABLE public.uscis_case_cache ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.uscis_case_cache TO service_role;

COMMENT ON TABLE public.uscis_case_cache IS
  'Shared cache of scanned USCIS receipts for nearby-case cohort analysis. Service-role only.';
COMMENT ON COLUMN public.uscis_case_cache.serial IS
  'Numeric portion of the receipt number for fast range queries.';
COMMENT ON COLUMN public.uscis_case_cache.is_valid IS
  'False when USCIS returns 404/invalid for this receipt (cached to avoid rescans).';
