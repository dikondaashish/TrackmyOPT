-- Priority-date alerts for Visa Bulletin readers.
--
-- A reader leaves an email, an employment-based category, a chargeability
-- country and (optionally) a priority date on a Visa Bulletin blog post. After
-- they confirm by email (double opt-in), /api/cron/visa-bulletin-alerts sends
-- one email when each new monthly bulletin is added to the site.
--
-- Only the server (service_role) reads or writes this table. Unsubscribing
-- deletes the row, and unconfirmed rows are deleted after 7 days by the cron.
-- No account, receipt number or document is stored.

CREATE TABLE IF NOT EXISTS public.visa_bulletin_alert_subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text NOT NULL
                        CHECK (email = lower(email) AND char_length(email) BETWEEN 3 AND 320),
  category              text NOT NULL
                        CHECK (category IN ('eb1', 'eb2', 'eb3', 'eb3_other', 'eb5')),
  chargeability         text NOT NULL
                        CHECK (chargeability IN ('row', 'india', 'china')),
  priority_date         date
                        CHECK (priority_date BETWEEN DATE '1990-01-01' AND DATE '2100-01-01'),
  -- Set when the reader clicks the confirmation link; only confirmed rows get alerts.
  confirmed_at          timestamptz,
  confirmation_sent_at  timestamptz,
  -- Bulletin month (YYYY-MM) of the last alert sent, so each month goes out once.
  last_bulletin_sent    text CHECK (last_bulletin_sent ~ '^[0-9]{4}-[0-9]{2}$'),
  source_page           text CHECK (char_length(source_page) <= 200),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, category, chargeability)
);

CREATE INDEX IF NOT EXISTS visa_bulletin_alert_subscriptions_due_idx
  ON public.visa_bulletin_alert_subscriptions (last_bulletin_sent)
  WHERE confirmed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS visa_bulletin_alert_subscriptions_pending_idx
  ON public.visa_bulletin_alert_subscriptions (created_at)
  WHERE confirmed_at IS NULL;

COMMENT ON TABLE public.visa_bulletin_alert_subscriptions IS
  'Double opt-in Visa Bulletin priority-date email alerts. Server-only; unsubscribing deletes the row.';

DROP TRIGGER IF EXISTS trg_visa_bulletin_alert_subscriptions_updated_at
  ON public.visa_bulletin_alert_subscriptions;
CREATE TRIGGER trg_visa_bulletin_alert_subscriptions_updated_at
  BEFORE UPDATE ON public.visa_bulletin_alert_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.visa_bulletin_alert_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_bulletin_alert_subscriptions FORCE ROW LEVEL SECURITY;

-- No policies: anon and authenticated have no access; service_role bypasses RLS.
REVOKE ALL ON public.visa_bulletin_alert_subscriptions FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.visa_bulletin_alert_subscriptions TO service_role;
