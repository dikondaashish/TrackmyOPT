-- Product-email opt-out only. NULL means no preference has been recorded;
-- it is not evidence of marketing consent. Audience selection must establish consent.
-- Preserve every existing reminder setting and email address.
ALTER TABLE public.email_preferences
  ADD COLUMN IF NOT EXISTS marketing_emails boolean;

COMMENT ON COLUMN public.email_preferences.marketing_emails IS
  'Product email preference: false opts out; NULL is unknown, not consent. Separate from OPT/STEM reminder settings.';
