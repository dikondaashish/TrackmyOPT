-- Prospective deletion safeguards. No historical bulk purge/backfill.
-- Quarantined neighbor-scan evidence is deliberately excluded.
BEGIN;

CREATE TABLE public.uscis_operational_daily (
  day date PRIMARY KEY,
  lookups_allowed bigint NOT NULL DEFAULT 0,
  lookups_blocked bigint NOT NULL DEFAULT 0,
  checks_succeeded bigint NOT NULL DEFAULT 0,
  checks_failed bigint NOT NULL DEFAULT 0
);
ALTER TABLE public.uscis_operational_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uscis_operational_daily FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.uscis_operational_daily FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.uscis_operational_daily TO service_role;
COMMENT ON TABLE public.uscis_operational_daily IS
  'Content-free UTC daily service counts; no user, receipt, status, decision date, or event-level identifiers. No historical backfill.';

ALTER TABLE public.uscis_check_log ADD COLUMN case_id uuid
  REFERENCES public.case_status(id) ON DELETE CASCADE;
CREATE INDEX idx_uscis_check_log_case_id ON public.uscis_check_log(case_id);
CREATE INDEX idx_uscis_api_audit_user_receipt
  ON public.uscis_api_audit(user_id, receipt_number_hash);

-- All API writers (including old deployments and delayed workers) use these
-- triggers. Row locks serialize writes with deletion of the exact enrollment.
CREATE FUNCTION public.guard_uscis_audit_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE enrolled_case uuid;
BEGIN
  IF NEW.allowed THEN
    SELECT c.id INTO enrolled_case FROM public.case_status c
    WHERE c.user_id = NEW.user_id
      AND encode(sha256(convert_to(upper(trim(c.receipt_number)), 'UTF8')), 'hex') = NEW.receipt_number_hash
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
CREATE TRIGGER guard_uscis_audit_retention
  BEFORE INSERT ON public.uscis_api_audit
  FOR EACH ROW EXECUTE FUNCTION public.guard_uscis_audit_retention();

CREATE FUNCTION public.guard_uscis_check_log_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE enrolled_case uuid;
BEGIN
  SELECT c.id INTO enrolled_case FROM public.case_status c
  WHERE c.id = NEW.case_id
    AND upper(trim(c.receipt_number)) = upper(trim(NEW.receipt_number))
  FOR KEY SHARE;
  INSERT INTO public.uscis_operational_daily(day, checks_succeeded, checks_failed)
  VALUES ((now() AT TIME ZONE 'UTC')::date,
          CASE WHEN NEW.success THEN 1 ELSE 0 END,
          CASE WHEN NEW.success THEN 0 ELSE 1 END)
  ON CONFLICT (day) DO UPDATE SET
    checks_succeeded = public.uscis_operational_daily.checks_succeeded + EXCLUDED.checks_succeeded,
    checks_failed = public.uscis_operational_daily.checks_failed + EXCLUDED.checks_failed;
  -- Legacy writers lacking an exact case id also retain counts only.
  IF enrolled_case IS NULL THEN RETURN NULL; END IF;
  NEW.receipt_number := upper(trim(NEW.receipt_number));
  NEW.error_message := NULL; -- never copy upstream/applicant text into diagnostics
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_uscis_check_log_retention() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_uscis_check_log_retention
  BEFORE INSERT ON public.uscis_check_log
  FOR EACH ROW EXECUTE FUNCTION public.guard_uscis_check_log_retention();

CREATE FUNCTION public.guard_case_email_retention()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.email_type = 'case_status_change' THEN
    PERFORM c.id FROM public.case_status c
    WHERE c.user_id = NEW.user_id
      AND upper(trim(c.receipt_number)) = upper(trim(NEW.email_data->>'receipt_number'))
    FOR KEY SHARE;
    IF NOT FOUND THEN RETURN NULL; END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.guard_case_email_retention() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER guard_case_email_retention
  BEFORE INSERT OR UPDATE ON public.email_queue
  FOR EACH ROW EXECUTE FUNCTION public.guard_case_email_retention();

CREATE FUNCTION public.purge_removed_case_data()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE receipt text := upper(trim(OLD.receipt_number));
BEGIN
  -- Serialize simultaneous removals of a shared receipt, without deleting
  -- another user's enrollment. Trigger statements see the committed removal.
  PERFORM pg_advisory_xact_lock(hashtextextended(receipt, 0));
  IF NOT EXISTS (SELECT 1 FROM public.case_status c
                 WHERE c.user_id = OLD.user_id AND upper(trim(c.receipt_number)) = receipt) THEN
    DELETE FROM public.uscis_api_audit
      WHERE user_id = OLD.user_id
        AND receipt_number_hash = encode(sha256(convert_to(receipt, 'UTF8')), 'hex');
    DELETE FROM public.email_queue
      WHERE user_id = OLD.user_id AND email_type = 'case_status_change'
        AND upper(trim(email_data->>'receipt_number')) = receipt;
  END IF;
  DELETE FROM public.uscis_check_log WHERE case_id = OLD.id;
  IF NOT EXISTS (SELECT 1 FROM public.case_status c WHERE upper(trim(c.receipt_number)) = receipt) THEN
    DELETE FROM public.uscis_check_log
      WHERE case_id IS NULL AND upper(trim(receipt_number)) = receipt;
    DELETE FROM public.uscis_case_cache
      WHERE upper(trim(receipt_number)) = receipt AND NOT quarantined;
  END IF;
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.purge_removed_case_data() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER purge_removed_case_data
  AFTER DELETE ON public.case_status
  FOR EACH ROW EXECUTE FUNCTION public.purge_removed_case_data();

CREATE FUNCTION public.purge_deleted_account_identifiers()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.uscis_api_audit WHERE user_id = OLD.id;
  DELETE FROM public.blocked_emails
    WHERE lower(email) = lower(OLD.email) AND reason = 'account_deleted';
  DELETE FROM public.policy_notice_email_events
    WHERE user_id = OLD.id OR lower(email) = lower(OLD.email);
  RETURN OLD;
END $$;
REVOKE ALL ON FUNCTION public.purge_deleted_account_identifiers() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER purge_deleted_account_identifiers
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.purge_deleted_account_identifiers();

COMMIT;
