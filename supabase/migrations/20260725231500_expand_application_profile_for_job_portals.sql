-- Dedicated Chrome-extension job-portal prefill profile.
--
-- These are ordinary contact/address fields, kept separate from the user's
-- TrackMyOPT account profile. Sensitive/private answers remain encrypted in
-- private_application_answers and are intentionally not added here.

ALTER TABLE public.application_profile
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS application_email text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS street_address text,
  ADD COLUMN IF NOT EXISTS zip_code text,
  ADD COLUMN IF NOT EXISTS county_district text,
  ADD COLUMN IF NOT EXISTS github_url text;

COMMENT ON TABLE public.application_profile IS
  'Dedicated Chrome-extension job-portal prefill profile. Ordinary contact/address fields only; sensitive answers are stored separately as encrypted ciphertext.';

