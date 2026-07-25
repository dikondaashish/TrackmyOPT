-- Optional saved answers for sensitive job-application questions.
--
-- Only the authenticated server API can read or write this table. The payload
-- is AES-256-GCM ciphertext produced with a server-only, purpose-specific key.
-- The browser extension receives decrypted answers only after authenticating,
-- then requires explicit per-application review before any field is filled.

CREATE TABLE IF NOT EXISTS public.private_application_answers (
  user_id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_payload  text NOT NULL CHECK (char_length(encrypted_payload) <= 12000),
  payload_version    smallint NOT NULL DEFAULT 1 CHECK (payload_version = 1),
  consented_at       timestamptz NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.private_application_answers IS
  'Encrypted, optional job-application answers. Server API only; never sent to AI or analytics.';
COMMENT ON COLUMN public.private_application_answers.encrypted_payload IS
  'AES-256-GCM ciphertext. Plaintext sensitive answers must never be stored in this table.';

ALTER TABLE public.private_application_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_application_answers FORCE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_private_application_answers_updated_at
  ON public.private_application_answers;
CREATE TRIGGER trg_private_application_answers_updated_at
  BEFORE UPDATE ON public.private_application_answers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

REVOKE ALL ON public.private_application_answers FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.private_application_answers TO service_role;
