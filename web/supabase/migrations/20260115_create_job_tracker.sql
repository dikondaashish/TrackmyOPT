-- Create Job Applications Table
create table job_applications (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    company_name text not null,
    role_title text not null,
    location text,
    job_url text,
    status text not null default 'Wishlist', -- Wishlist, Applied, Recruiter Screen, Interviewing, Final Round, Offer, Rejected
    applied_at date,
    next_follow_up_at date,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    
    primary key (id)
);

-- Enable RLS
alter table job_applications enable row level security;

-- Create Indexes
create index job_applications_user_id_idx on job_applications(user_id);
create index job_applications_status_idx on job_applications(status);

-- Create Job Interviews Table
create table job_interviews (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    job_application_id uuid not null references job_applications(id) on delete cascade,
    round_name text not null, -- e.g. "Recruiter Screen", "Technical 1"
    interview_at timestamptz not null,
    meeting_link text,
    notes text,
    created_at timestamptz not null default now(),
    
    primary key (id)
);

-- Enable RLS
alter table job_interviews enable row level security;
create index job_interviews_app_id_idx on job_interviews(job_application_id);

-- Create Job Follow-ups Table
create table job_followups (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    job_application_id uuid not null references job_applications(id) on delete cascade,
    followup_at date not null,
    followup_type text not null, -- Email, LinkedIn, Phone
    notes text,
    status text not null default 'pending', -- pending, done
    created_at timestamptz not null default now(),
    
    primary key (id)
);

-- Enable RLS
alter table job_followups enable row level security;
create index job_followups_app_id_idx on job_followups(job_application_id);
create index job_followups_date_idx on job_followups(followup_at);

-- RLS Policies (Users can only access their own data)

-- Job Applications
create policy "Users can view their own job applications"
    on job_applications for select
    using (auth.uid() = user_id);

create policy "Users can insert their own job applications"
    on job_applications for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own job applications"
    on job_applications for update
    using (auth.uid() = user_id);

create policy "Users can delete their own job applications"
    on job_applications for delete
    using (auth.uid() = user_id);

-- Job Interviews
create policy "Users can view their own interviews"
    on job_interviews for select
    using (auth.uid() = user_id);

create policy "Users can insert their own interviews"
    on job_interviews for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own interviews"
    on job_interviews for update
    using (auth.uid() = user_id);

create policy "Users can delete their own interviews"
    on job_interviews for delete
    using (auth.uid() = user_id);

-- Job Follow-ups
create policy "Users can view their own followups"
    on job_followups for select
    using (auth.uid() = user_id);

create policy "Users can insert their own followups"
    on job_followups for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own followups"
    on job_followups for update
    using (auth.uid() = user_id);

create policy "Users can delete their own followups"
    on job_followups for delete
    using (auth.uid() = user_id);
