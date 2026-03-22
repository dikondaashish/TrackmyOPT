-- Create Extension Uninstall Feedback table
create table if not exists extension_uninstall_feedback (
    id uuid not null default gen_random_uuid(),
    reasons jsonb not null default '[]'::jsonb,
    sub_options jsonb not null default '[]'::jsonb,
    follow_up_answers jsonb not null default '{}'::jsonb,
    additional_feedback text not null default '',
    ip_address text,
    user_agent text,
    submitted_at timestamptz not null default now(),
    created_at timestamptz not null default now(),

    primary key (id)
);

-- No RLS needed — this is an anonymous feedback table written via service role key
alter table extension_uninstall_feedback enable row level security;

-- Index on submitted_at for time-based queries
create index if not exists extension_uninstall_feedback_submitted_at_idx
    on extension_uninstall_feedback(submitted_at desc);
