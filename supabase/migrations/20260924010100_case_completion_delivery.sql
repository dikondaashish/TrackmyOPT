-- Generated with the Supabase CLI, then ordered after the already-published
-- 20260924010000_case_notices migration (which was future-dated).
-- Additive completion of case scheduling, journey tasks, and opt-in digests.
alter table public.opt_status add column if not exists stem_ead_end_date date;
alter table public.case_notices add column if not exists source_key text;
create unique index if not exists case_notices_source_key
  on public.case_notices(user_id, case_id, source_key) where source_key is not null;

create table public.case_check_jobs (
  job_id text primary key,
  case_id uuid not null references public.case_status(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  scheduled_for timestamptz not null,
  state text not null check (state in ('scheduling','queued','running','succeeded','failed','cancelled')),
  attempted_at timestamptz,
  completed_at timestamptz,
  error_code text,
  created_at timestamptz not null default now()
);
create index case_check_jobs_case_schedule on public.case_check_jobs(case_id, scheduled_for desc);
alter table public.case_check_jobs enable row level security;
alter table public.case_check_jobs force row level security;
revoke all on public.case_check_jobs from anon, authenticated;
grant all on public.case_check_jobs to service_role;

create table public.case_worker_runs (
  id uuid primary key default gen_random_uuid(),
  worker text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  outcome text not null default 'running' check (outcome in ('running','succeeded','failed')),
  http_status integer,
  counts jsonb not null default '{}'
);
create index case_worker_runs_recent on public.case_worker_runs(worker, started_at desc);
alter table public.case_worker_runs enable row level security;
alter table public.case_worker_runs force row level security;
revoke all on public.case_worker_runs from anon, authenticated;
grant all on public.case_worker_runs to service_role;

create table public.case_digest_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  last_digest_week date,
  updated_at timestamptz not null default now()
);
alter table public.case_digest_preferences enable row level security;
alter table public.case_digest_preferences force row level security;
revoke all on public.case_digest_preferences from anon, authenticated;
grant all on public.case_digest_preferences to service_role;

create table public.case_digest_deliveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  state text not null check(state in ('sending','sent','failed','cancelled')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  primary key(user_id, week_start)
);
alter table public.case_digest_deliveries enable row level security;
alter table public.case_digest_deliveries force row level security;
revoke all on public.case_digest_deliveries from anon, authenticated;
grant all on public.case_digest_deliveries to service_role;
