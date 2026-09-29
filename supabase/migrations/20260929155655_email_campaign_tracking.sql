-- Campaign configuration contains no recipient data; events contain no IP/UA.
CREATE TABLE public.email_campaigns (
  id text PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  subject text NOT NULL,
  tracked_links jsonb NOT NULL CHECK (jsonb_typeof(tracked_links) = 'object'),
  content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.email_campaign_events (
  message_id uuid NOT NULL REFERENCES public.email_queue(id) ON DELETE CASCADE,
  campaign_id text NOT NULL REFERENCES public.email_campaigns(id),
  event_type text NOT NULL CHECK (event_type IN ('open', 'click')),
  link_key text NOT NULL,
  known_automated boolean NOT NULL DEFAULT false,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, event_type, link_key, known_automated),
  CHECK ((event_type = 'open' AND link_key = '') OR
    (event_type = 'click' AND link_key ~ '^[a-z0-9][a-z0-9_-]{0,39}$'))
);
CREATE INDEX email_campaign_events_campaign_idx
  ON public.email_campaign_events(campaign_id, event_type, known_automated);

-- Reserve each normalized email address once, including incomplete SMTP sends.
-- An ambiguous SMTP outcome must be reviewed instead of automatically resent.
CREATE UNIQUE INDEX email_queue_campaign_recipient_unique
  ON public.email_queue ((email_data->>'campaign_id'), lower(btrim(email_address)))
  WHERE email_type = 'service_announcement' AND email_data->>'campaign_id' IS NOT NULL;

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_campaigns, public.email_campaign_events FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.email_campaigns TO service_role;
GRANT SELECT, INSERT ON public.email_campaign_events TO service_role;

CREATE FUNCTION public.record_email_campaign_event(
  p_message_id uuid, p_event_type text, p_link_key text, p_known_automated boolean
) RETURNS boolean
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE
  campaign text;
  links jsonb;
BEGIN
  SELECT q.email_data->>'campaign_id', c.tracked_links INTO campaign, links
  FROM public.email_queue q
  JOIN public.email_campaigns c ON c.id = q.email_data->>'campaign_id'
  WHERE q.id = p_message_id AND q.email_type = 'service_announcement'
    AND q.status IN ('sent', 'campaign_sending', 'campaign_unknown');
  IF campaign IS NULL THEN RETURN false; END IF;
  IF NOT ((p_event_type = 'open' AND p_link_key = '') OR
    (p_event_type = 'click' AND links ? p_link_key)) THEN RETURN false; END IF;

  INSERT INTO public.email_campaign_events(message_id, campaign_id, event_type, link_key, known_automated)
  VALUES (p_message_id, campaign, p_event_type, p_link_key, p_known_automated)
  ON CONFLICT DO NOTHING;

  IF NOT p_known_automated THEN
    IF p_event_type = 'open' THEN
      UPDATE public.email_queue SET opened_at = now() AT TIME ZONE 'UTC'
        WHERE id = p_message_id AND opened_at IS NULL;
    ELSE
      UPDATE public.email_queue SET clicked_at = now() AT TIME ZONE 'UTC'
        WHERE id = p_message_id AND clicked_at IS NULL;
    END IF;
  END IF;
  RETURN true;
END $$;

CREATE FUNCTION public.get_email_campaign_metrics(p_campaign_id text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path = '' AS $$
  WITH messages AS (
    SELECT q.id, q.status FROM public.email_queue q
    WHERE q.email_type = 'service_announcement' AND q.email_data->>'campaign_id' = p_campaign_id
  ), events AS (
    SELECT e.* FROM public.email_campaign_events e
    JOIN messages m ON m.id = e.message_id AND m.status IN ('sent', 'campaign_sending', 'campaign_unknown')
    WHERE e.campaign_id = p_campaign_id
  )
  SELECT jsonb_build_object(
    'campaignId', c.id, 'subject', c.subject,
    'sent', (SELECT count(*) FROM messages WHERE status = 'sent'),
    'failed', (SELECT count(*) FROM messages WHERE status = 'failed'),
    'needsReview', (SELECT count(*) FROM messages WHERE status NOT IN ('sent', 'failed') OR status IS NULL),
    'observedOpens', (SELECT count(DISTINCT message_id) FROM events WHERE event_type = 'open' AND NOT known_automated),
    'recordedClickers', (SELECT count(DISTINCT message_id) FROM events WHERE event_type = 'click' AND NOT known_automated),
    'knownAutomatedRequests', (SELECT count(*) FROM events WHERE known_automated),
    'links', COALESCE((SELECT jsonb_agg(jsonb_build_object(
      'key', l.key, 'url', l.value,
      'clickers', (SELECT count(DISTINCT e.message_id) FROM events e WHERE e.event_type = 'click' AND e.link_key = l.key AND NOT e.known_automated),
      'knownAutomatedClickers', (SELECT count(DISTINCT e.message_id) FROM events e WHERE e.event_type = 'click' AND e.link_key = l.key AND e.known_automated)
    ) ORDER BY l.key) FROM jsonb_each_text(c.tracked_links) l), '[]'::jsonb)
  ) FROM public.email_campaigns c WHERE c.id = p_campaign_id;
$$;

REVOKE ALL ON FUNCTION public.record_email_campaign_event(uuid, text, text, boolean) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_email_campaign_metrics(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_email_campaign_event(uuid, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_email_campaign_metrics(text) TO service_role;
