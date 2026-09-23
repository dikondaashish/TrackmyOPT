-- Keep initial OPT and STEM recommendations separate. No backfill: the
-- initial OPT date cannot be used to infer a STEM recommendation.
-- Version matches the migration applied to TrackmyOPT via Supabase MCP.
ALTER TABLE public.opt_status
  ADD COLUMN IF NOT EXISTS stem_dso_recommendation_date date;
COMMENT ON COLUMN public.opt_status.stem_dso_recommendation_date IS
  'Date the DSO entered the STEM OPT recommendation in SEVIS; distinct from initial OPT';
