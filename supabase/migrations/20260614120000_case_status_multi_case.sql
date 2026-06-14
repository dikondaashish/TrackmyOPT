-- Multi-case tracking: one user can track multiple USCIS receipts.

ALTER TABLE public.case_status
  DROP CONSTRAINT IF EXISTS unique_user_case;

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS is_primary boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS label text;

-- Existing rows (one per user) become the primary case.
UPDATE public.case_status SET is_primary = true WHERE is_primary = false;

CREATE UNIQUE INDEX IF NOT EXISTS case_status_user_receipt_unique
  ON public.case_status (user_id, receipt_number);

CREATE UNIQUE INDEX IF NOT EXISTS case_status_one_primary_per_user
  ON public.case_status (user_id)
  WHERE is_primary = true;

COMMENT ON COLUMN public.case_status.is_primary IS
  'Primary case shown on dashboard summary; at most one per user.';
COMMENT ON COLUMN public.case_status.label IS
  'Optional user label, e.g. OPT EAD or STEM extension.';
