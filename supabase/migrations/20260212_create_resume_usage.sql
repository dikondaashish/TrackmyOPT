-- Create Resume Generations Table to track usage
create table if not exists resume_generations (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    generation_type text not null check (generation_type in ('generate', 'regenerate')),
    created_at timestamptz not null default now(),
    
    primary key (id)
);

-- Enable RLS
alter table resume_generations enable row level security;

-- Create Indexes
create index if not exists resume_generations_user_id_created_at_idx on resume_generations(user_id, created_at);

-- RLS Policies
create policy "Users can view their own resume generations"
    on resume_generations for select
    using (auth.uid() = user_id);

create policy "Users can insert their own resume generations"
    on resume_generations for insert
    with check (auth.uid() = user_id);

-- No update/delete policies needed for strict usage tracking (immutable log)
