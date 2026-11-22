-- Synthetic fixture for 20261122171112_partner_cases.sql, applied after the case
-- retention migration it amends. No production data or connection.
-- APPLY MIGRATION HERE
CREATE FUNCTION public.test_assert(ok boolean, message text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN IF ok IS DISTINCT FROM true THEN RAISE EXCEPTION '%', message; END IF; END $$;
CREATE FUNCTION public.test_hash(receipt text) RETURNS text LANGUAGE sql AS
  $$ SELECT encode(sha256(convert_to(receipt, 'UTF8')), 'hex') $$;

-- Grants and RLS: partner data is service-role only.
SELECT public.test_assert(NOT has_table_privilege('authenticated', 'public.partner_cases', 'SELECT'), 'users can read partner cases');
SELECT public.test_assert(NOT has_table_privilege('anon', 'public.partner_cases', 'SELECT'), 'anon can read partner cases');
SELECT public.test_assert((SELECT relforcerowsecurity FROM pg_class WHERE oid = 'public.partner_cases'::regclass), 'partner RLS not forced');

-- Validation.
DO $$ BEGIN
  INSERT INTO public.partner_cases(source, partner_user_ref, receipt_number) VALUES ('other', 'user-ref-0001', 'IOE0000000009');
  RAISE EXCEPTION 'unknown source accepted';
EXCEPTION WHEN check_violation THEN NULL; END $$;
DO $$ BEGIN
  INSERT INTO public.partner_cases(source, partner_user_ref, receipt_number) VALUES ('partner1', 'a@b.com', 'IOE0000000009');
  RAISE EXCEPTION 'email-like user reference accepted';
EXCEPTION WHEN check_violation THEN NULL; END $$;
DO $$ BEGIN
  INSERT INTO public.partner_cases(source, partner_user_ref, receipt_number) VALUES ('partner1', 'user-ref-0001', 'ioe0000000009');
  RAISE EXCEPTION 'unnormalized receipt accepted';
EXCEPTION WHEN check_violation THEN NULL; END $$;

INSERT INTO public.partner_cases(id, source, partner_user_ref, receipt_number) VALUES
 ('20000000-0000-0000-0000-000000000001', 'partner1', 'user-ref-0001', 'IOE0000000007'),
 ('20000000-0000-0000-0000-000000000002', 'partner1', 'user-ref-0002', 'IOE0000000007'),
 ('20000000-0000-0000-0000-000000000003', 'partner1', 'user-ref-0002', 'IOE0000000008');
SELECT public.test_assert((SELECT receipt_hash = public.test_hash('IOE0000000007') FROM public.partner_cases WHERE id = '20000000-0000-0000-0000-000000000001'), 'receipt hash differs from audit hash');

-- Audit guard: partner lookups for enrolled receipts are kept, others are dropped.
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES (NULL, public.test_hash('IOE0000000007'), true, 'enrolled', 'partner:partner1');
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES (NULL, public.test_hash('IOE0000000099'), true, 'enrolled', 'partner:partner1');
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES (NULL, public.test_hash('IOE0000000007'), true, 'enrolled', 'case-status/check');
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES (NULL, public.test_hash('IOE0000000007'), true, 'enrolled', 'partner:othersource');
-- TrackMyOPT lookups still behave as before.
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES ('10000000-0000-0000-0000-000000000002', public.test_hash('IOE0000000003'), true, 'enrolled', 'case-status/check');
INSERT INTO public.uscis_api_audit(user_id, receipt_number_hash, allowed, reason, call_site)
VALUES ('10000000-0000-0000-0000-000000000002', public.test_hash('IOE0000000007'), true, 'enrolled', 'case-status/check');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE call_site = 'partner:partner1') = 1, 'partner audit guard wrong');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE user_id IS NULL AND call_site <> 'partner:partner1') = 0, 'non-partner anonymous lookup kept');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE user_id = '10000000-0000-0000-0000-000000000002') = 1, 'TrackMyOPT audit guard changed');

-- Removing one of two enrollments keeps the audit row; removing the last drops it.
DELETE FROM public.partner_cases WHERE id = '20000000-0000-0000-0000-000000000001';
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE call_site = 'partner:partner1') = 1, 'shared receipt audit purged early');
DELETE FROM public.partner_cases WHERE id = '20000000-0000-0000-0000-000000000002';
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE call_site = 'partner:partner1') = 0, 'partner audit kept after removal');
SELECT public.test_assert((SELECT count(*) FROM public.uscis_api_audit WHERE user_id = '10000000-0000-0000-0000-000000000002') = 1, 'partner purge touched TrackMyOPT audit');

-- updated_at moves on update.
UPDATE public.partner_cases SET updated_at = now() - interval '1 day' WHERE id = '20000000-0000-0000-0000-000000000003';
SELECT public.test_assert((SELECT updated_at > now() - interval '1 minute' FROM public.partner_cases WHERE id = '20000000-0000-0000-0000-000000000003'), 'updated_at not touched');
