-- Prospective, private experiment state. No historical enrollment or sends.
BEGIN;
CREATE TABLE public.pending_case_email_sequences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.case_status(id) ON DELETE SET NULL,
  first_verified_at timestamptz NOT NULL,
  arm text NOT NULL CHECK (arm IN ('treatment', 'holdout')),
  first_message_id uuid REFERENCES public.email_queue(id) ON DELETE SET NULL,
  engaged_at timestamptz,
  unsubscribed_at timestamptz,
  followup_message_id uuid REFERENCES public.email_queue(id) ON DELETE SET NULL
);
CREATE INDEX pending_case_email_due_idx ON public.pending_case_email_sequences(first_verified_at);
ALTER TABLE public.pending_case_email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_case_email_sequences FORCE ROW LEVEL SECURITY;
REVOKE ALL ON public.pending_case_email_sequences FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.pending_case_email_sequences TO service_role;

-- Count preference withdrawals as a guardrail, regardless of which offer caused it.
CREATE FUNCTION public.record_case_promotion_optout()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.marketing_emails IS FALSE AND OLD.marketing_emails IS DISTINCT FROM false THEN
    UPDATE public.pending_case_email_sequences SET unsubscribed_at=COALESCE(unsubscribed_at,now()) WHERE user_id=NEW.user_id;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.record_case_promotion_optout() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER record_case_promotion_optout AFTER UPDATE OF marketing_emails ON public.email_preferences
FOR EACH ROW EXECUTE FUNCTION public.record_case_promotion_optout();

-- Conservative allowlist. Unknown statuses and action-required notices are excluded.
CREATE FUNCTION public.is_pending_case_email_status(p_status text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = '' AS $$
  SELECT COALESCE(
    p_status ~* '(case was received|case is being actively reviewed|case is being processed|case is under review|case remains pending|fingerprints were taken|fingerprints.*applied|case was transferred|response.*evidence.*received)'
    AND p_status !~* '(approved|denied|rejected|withdraw|closed|terminated|revoked|produced|delivered|scheduled|notice of intent|request for|invalid|unable|failed|error|unknown|will be fetched)',
    false);
$$;
REVOKE ALL ON FUNCTION public.is_pending_case_email_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_pending_case_email_status(text) TO service_role;

CREATE FUNCTION public.record_pending_case_email_sequence(p_user_id uuid, p_case_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE checked timestamptz;
BEGIN
  SELECT c.last_checked_at INTO checked FROM public.case_status c
  WHERE c.id=p_case_id AND c.user_id=p_user_id
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=p_user_id AND p.premium_status IS FALSE AND COALESCE(p.plan_tier,'free')='free')
    AND c.last_check_failed_at IS NULL AND c.last_checked_at <= now() AND c.last_checked_at > now()-interval '5 minutes'
    AND public.is_pending_case_email_status(c.current_status)
  FOR KEY SHARE;
  IF checked IS NULL THEN RETURN; END IF;
  INSERT INTO public.pending_case_email_sequences(user_id,case_id,first_verified_at,arm)
  VALUES(p_user_id,p_case_id,checked,
    CASE WHEN get_byte(sha256(convert_to(p_user_id::text,'UTF8')),0)%5=0 THEN 'holdout' ELSE 'treatment' END)
  ON CONFLICT(user_id) DO NOTHING;
END $$;

-- Shared lock/cap also covers the legacy checkout-recovery insertion path.
-- Ambiguous and failed reservations count conservatively; cancelled-before-send rows do not.
CREATE FUNCTION public.guard_case_promotion_cap()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF NEW.email_type IN ('pending_case_first','pending_case_followup','checkout_recovery') THEN
    IF NEW.user_id IS NULL THEN RETURN NULL; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended('case-promotion:'||NEW.user_id::text,0));
    IF (SELECT count(*) FROM public.email_queue q WHERE q.user_id=NEW.user_id
        AND q.email_type IN ('pending_case_first','pending_case_followup','checkout_recovery')
        AND q.status IS DISTINCT FROM 'cancelled') >= 2 THEN RETURN NULL; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER guard_case_promotion_cap BEFORE INSERT ON public.email_queue
FOR EACH ROW EXECUTE FUNCTION public.guard_case_promotion_cap();
CREATE UNIQUE INDEX email_queue_pending_case_kind_unique ON public.email_queue(user_id,email_type)
WHERE email_type IN ('pending_case_first','pending_case_followup');

CREATE FUNCTION public.reserve_case_promotion(
  p_user_id uuid, p_kind text, p_message_id uuid, p_subject text, p_email text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE s public.pending_case_email_sequences; reserved uuid;
BEGIN
  IF p_kind NOT IN ('pending_case_first','pending_case_followup','checkout_recovery') THEN RETURN NULL; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('case-promotion:'||p_user_id::text,0));
  PERFORM u.id FROM auth.users u JOIN public.profiles p ON p.user_id=u.id
  JOIN public.email_preferences e ON e.user_id=u.id
  WHERE u.id=p_user_id AND lower(trim(u.email))=lower(trim(p_email))
    AND u.email_confirmed_at IS NOT NULL AND u.deleted_at IS NULL
    AND p.premium_status IS FALSE AND COALESCE(p.plan_tier,'free')='free'
    AND p.pro_free_trial_consumed IS NOT TRUE AND e.marketing_emails IS TRUE
    AND NOT EXISTS(SELECT 1 FROM public.payment_transactions t WHERE t.user_id=u.id AND t.status='succeeded')
    AND NOT EXISTS(SELECT 1 FROM public.blocked_emails b WHERE lower(trim(b.email))=lower(trim(u.email)))
  FOR KEY SHARE OF u;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO s FROM public.pending_case_email_sequences WHERE user_id=p_user_id FOR UPDATE;
  IF p_kind <> 'checkout_recovery' OR s.user_id IS NOT NULL THEN
    IF s.case_id IS NULL THEN RETURN NULL; END IF;
    PERFORM c.id FROM public.case_status c WHERE c.id=s.case_id AND c.user_id=p_user_id
      AND c.last_check_failed_at IS NULL AND c.last_checked_at<=now() AND c.last_checked_at>now()-interval '72 hours'
      AND public.is_pending_case_email_status(c.current_status) FOR KEY SHARE;
    IF NOT FOUND THEN RETURN NULL; END IF;
  END IF;
  IF p_kind='pending_case_first' AND (s.arm<>'treatment' OR s.first_message_id IS NOT NULL
      OR s.first_verified_at>now()-interval '24 hours' OR s.first_verified_at<now()-interval '72 hours') THEN RETURN NULL; END IF;
  IF p_kind='pending_case_followup' AND (s.arm<>'treatment' OR s.followup_message_id IS NOT NULL
      OR s.engaged_at IS NULL OR s.engaged_at>now()-interval '24 hours'
      OR s.engaged_at<now()-interval '72 hours'
      OR NOT EXISTS(SELECT 1 FROM public.email_queue q WHERE q.id=s.first_message_id AND q.status='sent')) THEN RETURN NULL; END IF;
  IF EXISTS(SELECT 1 FROM public.email_queue q WHERE q.user_id=p_user_id AND q.email_type=p_kind) THEN RETURN NULL; END IF;
  INSERT INTO public.email_queue(id,user_id,email_address,email_type,email_subject,email_data,status)
  VALUES(p_message_id,p_user_id,lower(trim(p_email)),p_kind,p_subject,
    jsonb_build_object('experiment','pending_case_v1'),'campaign_sending') RETURNING id INTO reserved;
  IF reserved IS NULL THEN RETURN NULL; END IF;
  IF p_kind='pending_case_first' THEN
    UPDATE public.pending_case_email_sequences SET first_message_id=reserved WHERE user_id=p_user_id;
  ELSIF p_kind='pending_case_followup' THEN
    UPDATE public.pending_case_email_sequences SET followup_message_id=reserved WHERE user_id=p_user_id;
  END IF;
  RETURN reserved;
END $$;

CREATE FUNCTION public.engage_pending_case_offer(p_user_id uuid,p_message_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.pending_case_email_sequences s SET engaged_at=COALESCE(s.engaged_at,now())
  WHERE s.user_id=p_user_id AND s.first_message_id=p_message_id AND s.case_id IS NOT NULL AND s.engaged_at IS NULL
    AND EXISTS(SELECT 1 FROM public.email_queue q WHERE q.id=p_message_id AND q.user_id=p_user_id
      AND q.email_type='pending_case_first' AND q.status='sent');
  RETURN FOUND;
END $$;
CREATE FUNCTION public.list_due_case_promotions()
RETURNS TABLE(user_id uuid,kind text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT s.user_id, CASE WHEN s.first_message_id IS NULL THEN 'pending_case_first' ELSE 'pending_case_followup' END
  FROM public.pending_case_email_sequences s
  JOIN public.case_status c ON c.id=s.case_id AND c.user_id=s.user_id
  JOIN public.profiles p ON p.user_id=s.user_id
  JOIN public.email_preferences e ON e.user_id=s.user_id
  JOIN auth.users u ON u.id=s.user_id
  WHERE s.arm='treatment' AND p.premium_status IS FALSE AND COALESCE(p.plan_tier,'free')='free'
    AND p.pro_free_trial_consumed IS NOT TRUE AND e.marketing_emails IS TRUE
    AND u.email_confirmed_at IS NOT NULL AND u.deleted_at IS NULL
    AND c.last_check_failed_at IS NULL AND c.last_checked_at<=now() AND c.last_checked_at>now()-interval '72 hours'
    AND public.is_pending_case_email_status(c.current_status)
    AND NOT EXISTS(SELECT 1 FROM public.payment_transactions t WHERE t.user_id=s.user_id AND t.status='succeeded')
    AND NOT EXISTS(SELECT 1 FROM public.blocked_emails b WHERE lower(trim(b.email))=lower(trim(u.email)))
    AND ((s.first_message_id IS NULL AND s.first_verified_at BETWEEN now()-interval '72 hours' AND now()-interval '24 hours')
      OR (s.followup_message_id IS NULL AND s.engaged_at BETWEEN now()-interval '72 hours' AND now()-interval '24 hours'
        AND EXISTS(SELECT 1 FROM public.email_queue q WHERE q.id=s.first_message_id AND q.status='sent')))
    AND (SELECT count(*) FROM public.email_queue q WHERE q.user_id=s.user_id
      AND q.email_type IN ('pending_case_first','pending_case_followup','checkout_recovery')
      AND q.status IS DISTINCT FROM 'cancelled')<2
  ORDER BY COALESCE(s.engaged_at,s.first_verified_at),s.user_id LIMIT 100;
$$;
REVOKE ALL ON FUNCTION public.record_pending_case_email_sequence(uuid,uuid),
  public.guard_case_promotion_cap(), public.reserve_case_promotion(uuid,text,uuid,text,text),
  public.engage_pending_case_offer(uuid,uuid),public.list_due_case_promotions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_pending_case_email_sequence(uuid,uuid),
  public.reserve_case_promotion(uuid,text,uuid,text,text),
  public.engage_pending_case_offer(uuid,uuid),public.list_due_case_promotions() TO service_role;
COMMIT;
