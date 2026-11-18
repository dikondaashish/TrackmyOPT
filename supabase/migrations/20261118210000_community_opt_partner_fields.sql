-- Both partners (opt-tracker.com and opt-pulse) approved using every field
-- their feeds expose (Nov 18, 2026). Store the ones the estimates can use:
--   rfe_date, noid_date, biometrics_requested_date  (OPT Pulse)
--   reported_at                                     (OPT Tracker created_at)
-- Nullable columns without defaults: metadata-only, no table rewrite. They are
-- deliberately not part of the snapshot trigger's compared columns, so adding
-- them does not snapshot every existing row on the next import.
ALTER TABLE public.community_opt_timelines
  ADD COLUMN IF NOT EXISTS rfe_date date,
  ADD COLUMN IF NOT EXISTS noid_date date,
  ADD COLUMN IF NOT EXISTS biometrics_requested_date date,
  ADD COLUMN IF NOT EXISTS reported_at timestamptz;

COMMENT ON COLUMN public.community_opt_timelines.rfe_date IS
  'Partner-reported Request for Evidence date (OPT Pulse rfie_date).';
COMMENT ON COLUMN public.community_opt_timelines.noid_date IS
  'Partner-reported Notice of Intent to Deny date (OPT Pulse noid_date).';
COMMENT ON COLUMN public.community_opt_timelines.biometrics_requested_date IS
  'Partner-reported biometrics request date; biometrics_date stays the completion date.';
COMMENT ON COLUMN public.community_opt_timelines.reported_at IS
  'When the applicant first reported the case to the partner (OPT Tracker created_at).';
