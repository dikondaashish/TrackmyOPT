-- Manual or auto-detected USCIS Premium Processing start date (I-765 PP).

ALTER TABLE public.case_status
  ADD COLUMN IF NOT EXISTS pp_start_date date;

COMMENT ON COLUMN public.case_status.pp_start_date IS
  'Date USCIS Premium Processing started; used for 15-business-day countdown.';
