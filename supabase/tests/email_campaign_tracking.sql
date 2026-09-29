-- Synthetic fixtures only; the entire verification is rolled back. No email is sent.
BEGIN;
SET LOCAL ROLE service_role;
DO $$
DECLARE
  campaign text := 'tracking-test-' || replace(gen_random_uuid()::text, '-', '');
  first_message uuid := gen_random_uuid();
  second_message uuid := gen_random_uuid();
  metrics jsonb;
BEGIN
  INSERT INTO public.email_campaigns(id, subject, tracked_links, content_hash)
    VALUES (campaign, 'Synthetic tracking test',
      '{"pro_intro":"https://www.trackmyopt.com/pricing","free_dashboard":"https://www.trackmyopt.com/dashboard"}', repeat('a',64));
  INSERT INTO public.email_queue(id, email_address, email_type, email_subject, email_data, status)
    VALUES (first_message, 'tracking-test@example.invalid', 'service_announcement', 'Synthetic test', jsonb_build_object('campaign_id', campaign), 'sent'),
      (second_message, 'tracking-test-2@example.invalid', 'service_announcement', 'Synthetic test', jsonb_build_object('campaign_id', campaign), 'campaign_unknown');
  BEGIN
    INSERT INTO public.email_queue(email_address, email_type, email_subject, email_data, status)
      VALUES (' TRACKING-TEST@example.invalid ', 'service_announcement', 'Synthetic duplicate', jsonb_build_object('campaign_id', campaign), 'campaign_sending');
    RAISE EXCEPTION 'Expected a unique campaign recipient reservation';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  PERFORM public.record_email_campaign_event(first_message, 'open', '', true);
  IF (SELECT opened_at IS NOT NULL FROM public.email_queue WHERE id = first_message) THEN
    RAISE EXCEPTION 'Known automation must not mark the queue opened';
  END IF;
  PERFORM public.record_email_campaign_event(first_message, 'open', '', false);
  PERFORM public.record_email_campaign_event(first_message, 'open', '', false);
  PERFORM public.record_email_campaign_event(first_message, 'click', 'pro_intro', true);
  PERFORM public.record_email_campaign_event(first_message, 'click', 'pro_intro', false);
  PERFORM public.record_email_campaign_event(first_message, 'click', 'pro_intro', false);
  PERFORM public.record_email_campaign_event(first_message, 'click', 'free_dashboard', false);
  PERFORM public.record_email_campaign_event(second_message, 'click', 'free_dashboard', false);
  IF public.record_email_campaign_event(first_message, 'click', 'unknown_link', false) OR
    public.record_email_campaign_event(gen_random_uuid(), 'open', '', false) THEN
    RAISE EXCEPTION 'Unknown messages/links must not record events';
  END IF;

  metrics := public.get_email_campaign_metrics(campaign);
  IF NOT metrics @> '{"sent":1,"observedOpens":1,"recordedClickers":2,"knownAutomatedRequests":2,"needsReview":1}' OR
    NOT (metrics->'links') @> '[{"key":"pro_intro","clickers":1,"knownAutomatedClickers":1},{"key":"free_dashboard","clickers":2,"knownAutomatedClickers":0}]' THEN
    RAISE EXCEPTION 'Incorrect deduplicated campaign metrics: %', metrics;
  END IF;
  IF NOT (SELECT opened_at IS NOT NULL AND clicked_at IS NOT NULL FROM public.email_queue WHERE id = first_message) THEN
    RAISE EXCEPTION 'Human-unknown events must populate first event timestamps';
  END IF;
  IF has_table_privilege('anon','public.email_campaign_events','SELECT') OR
    has_table_privilege('authenticated','public.email_campaigns','SELECT') OR
    has_function_privilege('anon','public.record_email_campaign_event(uuid,text,text,boolean)','EXECUTE') OR
    has_function_privilege('authenticated','public.get_email_campaign_metrics(text)','EXECUTE') THEN
    RAISE EXCEPTION 'Campaign data/functions exposed to client roles';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_class WHERE oid IN ('public.email_campaigns'::regclass,'public.email_campaign_events'::regclass) AND NOT relrowsecurity) THEN
    RAISE EXCEPTION 'Campaign RLS must be enabled';
  END IF;
  RAISE NOTICE 'Campaign metrics, deduplication, normalized reservations and client restrictions verified';
END $$;
SELECT NOT public.record_email_campaign_event(gen_random_uuid(), 'open', '', false) AS unknown_message_rejected,
  public.get_email_campaign_metrics('nonexistent-test-campaign') IS NULL AS service_report_access_verified;
ROLLBACK;
