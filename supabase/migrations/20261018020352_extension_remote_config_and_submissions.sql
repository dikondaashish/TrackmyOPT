-- Extension remote configuration (admin-published data, never code) and the
-- minimal evidence metadata for application submissions confirmed by the
-- extension. Additive only: no existing table or policy changes.

-- 1. Versioned, declarative extension configuration.
create table public.extension_remote_configs (
    id uuid primary key default gen_random_uuid(),
    version text not null unique
        check (version ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}\.[0-9]{1,3}$'),
    schema_version smallint not null check (schema_version = 1),
    config jsonb not null
        check (jsonb_typeof(config) = 'object' and pg_column_size(config) <= 65536),
    status text not null default 'inactive' check (status in ('active', 'inactive')),
    notes text check (notes is null or char_length(notes) <= 500),
    created_by text not null check (char_length(created_by) between 1 and 120),
    created_at timestamptz not null default now(),
    activated_at timestamptz
);

comment on table public.extension_remote_configs is
    'Declarative extension config (kill switches, detector modes, label phrases). Validated by apps/extension/src/platform-config/remote-config.ts before insert and again in the extension. Service role only.';

-- At most one active version; activation and rollback switch it atomically.
create unique index extension_remote_configs_one_active
    on public.extension_remote_configs (status)
    where status = 'active';

alter table public.extension_remote_configs enable row level security;
-- No policies: only the service role (server routes) reads or writes.
revoke all on table public.extension_remote_configs from anon, authenticated;

create function public.activate_extension_remote_config(p_version text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
    if not exists (
        select 1 from public.extension_remote_configs where version = p_version
    ) then
        raise exception 'Unknown extension config version' using errcode = 'P0002';
    end if;
    update public.extension_remote_configs
        set status = 'inactive'
        where status = 'active' and version <> p_version;
    update public.extension_remote_configs
        set status = 'active', activated_at = now()
        where version = p_version;
end;
$$;

revoke execute on function public.activate_extension_remote_config(text) from public, anon, authenticated;
grant execute on function public.activate_extension_remote_config(text) to service_role;

-- 2. Submission evidence: which attempt confirmed an application, and how.
-- Stores no URLs, response bodies, form values, or applicant answers.
create table public.job_application_submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users (id) on delete cascade,
    application_id uuid not null references public.job_applications (id) on delete cascade,
    attempt_id text not null check (attempt_id ~ '^[A-Za-z0-9_-]{16,64}$'),
    confirmation_source text not null check (confirmation_source in ('automatic', 'manual')),
    evidence_kind text not null check (evidence_kind in ('network', 'page', 'manual')),
    platform text not null check (platform in (
        'workday', 'greenhouse', 'lever', 'smartrecruiters', 'ashby', 'linkedin', 'generic'
    )),
    detector text not null check (detector in ('workday_network', 'page_confirmation', 'manual')),
    network_verdict text check (network_verdict is null or network_verdict in (
        'success', 'application_error', 'http_error', 'redirected', 'unexpected_status',
        'malformed', 'unreadable', 'oversize', 'timeout', 'network_error'
    )),
    http_status smallint check (http_status is null or http_status between 0 and 599),
    rule_version text not null check (rule_version ~ '^[A-Za-z0-9._-]{1,40}$'),
    confirmed_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint job_application_submissions_attempt_unique unique (user_id, attempt_id),
    constraint job_application_submissions_evidence_shape check (
        (evidence_kind = 'network' and detector = 'workday_network' and confirmation_source = 'automatic')
        or (evidence_kind = 'page' and detector = 'page_confirmation' and confirmation_source = 'automatic')
        or (evidence_kind = 'manual' and detector = 'manual' and confirmation_source = 'manual')
    )
);

create index job_application_submissions_application_idx
    on public.job_application_submissions (application_id);

alter table public.job_application_submissions enable row level security;

-- Applicants may read their own evidence; only server routes write it.
create policy "Users can read their own application submissions"
    on public.job_application_submissions
    for select
    to authenticated
    using ((select auth.uid()) = user_id);

revoke insert, update, delete on table public.job_application_submissions from anon, authenticated;
