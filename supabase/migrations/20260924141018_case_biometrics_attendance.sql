-- Attendance reported by the case owner, not a USCIS event or adjudication.
alter table public.case_status
  add column if not exists biometrics_attended_date date,
  add column if not exists biometrics_confirmed_at timestamptz;
alter table public.case_status add constraint case_biometrics_confirmation_pair
  check ((biometrics_attended_date is null) = (biometrics_confirmed_at is null));
comment on column public.case_status.biometrics_attended_date is
  'User-reported appointment attendance. Never infer USCIS receipt, processing, or approval.';
