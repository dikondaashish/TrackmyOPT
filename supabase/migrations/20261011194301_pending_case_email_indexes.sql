-- Cover deletion/cap joins without changing the applied campaign migration.
BEGIN;
CREATE INDEX pending_case_email_case_idx ON public.pending_case_email_sequences(case_id);
CREATE INDEX pending_case_email_first_idx ON public.pending_case_email_sequences(first_message_id);
CREATE INDEX pending_case_email_followup_idx ON public.pending_case_email_sequences(followup_message_id);
COMMIT;
