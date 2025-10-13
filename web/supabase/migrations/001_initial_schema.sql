-- TrackMyOPT Database Schema
-- Run this SQL in your Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles table: Extended user information
-- One profile per authenticated user
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  timezone text default 'America/New_York',
  is_stem_eligible boolean default false,
  created_at timestamptz default now()
);

-- OPT Status table: Core OPT timeline tracking
-- Stores all critical dates for OPT period calculations
create table if not exists opt_status (
  user_id uuid primary key references auth.users(id) on delete cascade,
  program_end_date date not null,
  dso_recommendation_date date,
  opt_ead_end_date date not null,
  opt_start_date date not null,
  stem_start_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Employment Spans table: Track employment history during OPT
-- Users can have multiple employment records
create table if not exists employment_spans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  employer_name text,
  start_date date not null,
  end_date date,
  created_at timestamptz default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Improve query performance for common lookups
create index if not exists idx_employment_spans_user_id 
  on employment_spans(user_id);

create index if not exists idx_employment_spans_dates 
  on employment_spans(user_id, start_date, end_date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table opt_status enable row level security;
alter table employment_spans enable row level security;

-- Drop existing policies if they exist (for re-running this migration)
drop policy if exists "profiles self" on profiles;
drop policy if exists "opt_status self" on opt_status;
drop policy if exists "employment_spans self" on employment_spans;

-- Profiles: Users can only access their own profile
create policy "profiles self" 
  on profiles
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- OPT Status: Users can only access their own OPT status
create policy "opt_status self" 
  on opt_status
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- Employment Spans: Users can only access their own employment records
create policy "employment_spans self" 
  on employment_spans
  for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update opt_status.updated_at
drop trigger if exists update_opt_status_updated_at on opt_status;
create trigger update_opt_status_updated_at
  before update on opt_status
  for each row
  execute function update_updated_at_column();

-- Function to automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- COMMENTS
-- ============================================================================

comment on table profiles is 'Extended user profile information';
comment on table opt_status is 'OPT timeline tracking with all critical dates';
comment on table employment_spans is 'Employment history during OPT period';

comment on column profiles.timezone is 'User timezone for accurate countdown calculations';
comment on column profiles.is_stem_eligible is 'Whether user is eligible for STEM OPT extension';
comment on column opt_status.program_end_date is 'Academic program completion date';
comment on column opt_status.dso_recommendation_date is 'Date DSO recommended OPT';
comment on column opt_status.opt_ead_end_date is 'OPT Employment Authorization Document expiration';
comment on column opt_status.opt_start_date is 'OPT period start date';
comment on column opt_status.stem_start_date is 'STEM extension start date (if applicable)';
comment on column employment_spans.end_date is 'NULL means currently employed';

