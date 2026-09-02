-- Preserve who enabled an ATS source and why. Service-role ingestion is the
-- only writer; RLS remains enabled and no browser role is granted access.
ALTER TABLE public.ats_sources
  ADD COLUMN IF NOT EXISTS enabled_at timestamptz,
  ADD COLUMN IF NOT EXISTS enabled_by text,
  ADD COLUMN IF NOT EXISTS activation_reason text;

UPDATE public.ats_sources
SET
  enabled_at = CASE
    WHEN enabled THEN COALESCE(enabled_at, updated_at, created_at, now())
    ELSE enabled_at
  END,
  enabled_by = COALESCE(NULLIF(enabled_by, ''), 'unknown'),
  activation_reason = COALESCE(NULLIF(activation_reason, ''), 'unknown');

ALTER TABLE public.ats_sources
  ALTER COLUMN enabled_by SET DEFAULT 'unknown',
  ALTER COLUMN activation_reason SET DEFAULT 'unknown';

CREATE OR REPLACE FUNCTION public.record_ats_source_activation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.enabled AND (
    TG_OP = 'INSERT'
    OR (TG_OP = 'UPDATE' AND NOT COALESCE(OLD.enabled, false))
  ) THEN
    NEW.enabled_at := COALESCE(NEW.enabled_at, now());
    NEW.enabled_by := COALESCE(NULLIF(NEW.enabled_by, ''), 'unknown');
    NEW.activation_reason := COALESCE(NULLIF(NEW.activation_reason, ''), 'unknown');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ats_sources_activation_audit ON public.ats_sources;
CREATE TRIGGER ats_sources_activation_audit
  BEFORE INSERT OR UPDATE OF enabled ON public.ats_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.record_ats_source_activation();

COMMENT ON COLUMN public.ats_sources.enabled_at IS
  'Timestamp when this source most recently transitioned to enabled.';
COMMENT ON COLUMN public.ats_sources.enabled_by IS
  'Actor responsible for enabling the source, or unknown for legacy rows.';
COMMENT ON COLUMN public.ats_sources.activation_reason IS
  'Reason/provenance for enabling the source, or unknown for legacy rows.';
