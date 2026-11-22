-- Cases enrolled by a signed-in user of a partner product,
-- checked by the same USCIS client, pacing and quota as TrackMyOPT cases.
-- Partner users have no TrackMyOPT account: the partner sends an opaque user reference,
-- never a name or email. Service role only; nothing here is visible to TrackMyOPT users.
BEGIN;

CREATE TABLE public.partner_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('partner1')),
  partner_user_ref text NOT NULL CHECK (partner_user_ref ~ '^[A-Za-z0-9_-]{8,128}$'),
  receipt_number text NOT NULL CHECK (receipt_number ~ '^[A-Z]{3}[0-9]{10}$'),
  -- Same digest as uscis_api_audit.receipt_number_hash (receipts are ASCII only).
  receipt_hash text GENERATED ALWAYS AS (encode(sha256(receipt_number::bytea), 'hex')) STORED,
  form_type text,
  current_status text,
  status_description text,
  received_date text,
  uscis_modified_date text,
  status_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  status_changed_at timestamptz,
  last_checked_at timestamptz,
  next_check_at timestamptz NOT NULL DEFAULT now(),
  consecutive_failures integer NOT NULL DEFAULT 0,
  last_error_code integer,
  -- A status change the partner has not acknowledged yet (retried by the cron).
  notify_pending boolean NOT NULL DEFAULT false,
  notify_previous_status text,
  notify_attempts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, partner_user_ref, receipt_number)
);
CREATE INDEX partner_cases_due ON public.partner_cases (next_check_at);
CREATE INDEX partner_cases_notify ON public.partner_cases (notify_attempts) WHERE notify_pending;
CREATE INDEX partner_cases_receipt_hash ON public.partner_cases (receipt_hash);
ALTER TABLE public.partner_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_cases FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.partner_cases FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_cases TO service_role;
CREATE POLICY partner_cases_service_role ON public.partner_cases
  FOR ALL TO service_role USING (true) WITH CHECK (true);
COMMENT ON TABLE public.partner_cases IS
  'USCIS cases enrolled by signed-in users of a partner product. Opaque user reference only; service role only.';

CREATE FUNCTION public.touch_partner_cases_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.touch_partner_cases_updated_at() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER touch_partner_cases_updated_at
  BEFORE UPDATE ON public.partner_cases
  FOR EACH ROW EXECUTE FUNCTION public.touch_partner_cases_updated_at();

-- The audit guard now also accepts a lookup for a receipt that a partner enrolled.
-- Partner lookups carry no TrackMyOPT user (user_id NULL) and call_site 'partner:<source>'.
CREATE OR REPLACE FUNCTION public.guard_uscis_audit_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE enrolled_case uuid;
BEGIN
  IF NEW.allowed AND NEW.user_id IS NOT NULL THEN
    SELECT c.id INTO enrolled_case FROM public.case_status c
    WHERE c.user_id = NEW.user_id
      AND encode(sha256(convert_to(upper(trim(c.receipt_number)), 'UTF8')), 'hex') = NEW.receipt_number_hash
    LIMIT 1 FOR KEY SHARE;
  ELSIF NEW.allowed AND NEW.user_id IS NULL AND NEW.call_site LIKE 'partner:%' THEN
    SELECT p.id INTO enrolled_case FROM public.partner_cases p
    WHERE p.source = substr(NEW.call_site, 9)
      AND p.receipt_hash = NEW.receipt_number_hash
    LIMIT 1 FOR KEY SHARE;
  END IF;
  INSERT INTO public.uscis_operational_daily(day, lookups_allowed, lookups_blocked)
  VALUES ((now() AT TIME ZONE 'UTC')::date,
          CASE WHEN enrolled_case IS NOT NULL THEN 1 ELSE 0 END,
          CASE WHEN enrolled_case IS NULL THEN 1 ELSE 0 END)
  ON CONFLICT (day) DO UPDATE SET
    lookups_allowed = public.uscis_operational_daily.lookups_allowed + EXCLUDED.lookups_allowed,
    lookups_blocked = public.uscis_operational_daily.lookups_blocked + EXCLUDED.lookups_blocked;
  -- Rejected/deleted enrollment attempts retain only the counts above.
  IF enrolled_case IS NULL THEN RETURN NULL; END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_uscis_audit_retention() FROM PUBLIC, anon, authenticated;

-- When the last partner enrollment of a receipt is removed, drop its partner audit rows,
-- as purge_removed_case_data does for TrackMyOPT cases.
CREATE FUNCTION public.purge_removed_partner_case()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.partner_cases p
    WHERE p.source = OLD.source AND p.receipt_hash = OLD.receipt_hash
  ) THEN
    DELETE FROM public.uscis_api_audit a
    WHERE a.user_id IS NULL
      AND a.call_site = 'partner:' || OLD.source
      AND a.receipt_number_hash = OLD.receipt_hash;
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.purge_removed_partner_case() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER purge_removed_partner_case
  AFTER DELETE ON public.partner_cases
  FOR EACH ROW EXECUTE FUNCTION public.purge_removed_partner_case();

COMMIT;
