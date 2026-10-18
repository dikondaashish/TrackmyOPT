-- Allow payload_version 2 for private_application_answers.
--
-- The single default job-portal login (PR #34) bumped the API's payload
-- version to 2, but the original CHECK only accepted 1, so every save failed
-- with "Could not save private answers". Version 1 rows stay valid: the API
-- still decrypts and migrates them.

ALTER TABLE public.private_application_answers
  DROP CONSTRAINT IF EXISTS private_application_answers_payload_version_check;

ALTER TABLE public.private_application_answers
  ADD CONSTRAINT private_application_answers_payload_version_check
  CHECK (payload_version IN (1, 2));
