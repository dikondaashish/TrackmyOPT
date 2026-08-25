-- Track the start of the current uninterrupted Dedicated membership period.
-- This timestamp is preserved across webhook resyncs while the plan remains
-- Dedicated, and reset when the member leaves Dedicated.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS dedicated_started_at timestamptz;

UPDATE public.profiles
SET dedicated_started_at = COALESCE(premium_purchased_at, now())
WHERE lower(COALESCE(plan_tier, '')) = 'dedicated'
  AND dedicated_started_at IS NULL;

CREATE OR REPLACE FUNCTION public.track_dedicated_membership_start()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF lower(COALESCE(NEW.plan_tier, '')) <> 'dedicated' THEN
    NEW.dedicated_started_at := NULL;
  ELSIF TG_OP = 'INSERT'
    OR lower(COALESCE(OLD.plan_tier, '')) <> 'dedicated'
    OR OLD.dedicated_started_at IS NULL THEN
    NEW.dedicated_started_at := now();
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.track_dedicated_membership_start() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.track_dedicated_membership_start() FROM anon;
REVOKE ALL ON FUNCTION public.track_dedicated_membership_start() FROM authenticated;

DROP TRIGGER IF EXISTS track_dedicated_membership_start ON public.profiles;
CREATE TRIGGER track_dedicated_membership_start
BEFORE INSERT OR UPDATE OF plan_tier ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.track_dedicated_membership_start();

COMMENT ON COLUMN public.profiles.dedicated_started_at IS
  'Start of the current uninterrupted Dedicated membership period; used for the 7-day attorney-consultation wait.';

COMMENT ON COLUMN public.profiles.pro_free_trial_consumed IS
  'Legacy-named flag: true once this account has used or previously held a Pro trial/paid introductory offer.';
