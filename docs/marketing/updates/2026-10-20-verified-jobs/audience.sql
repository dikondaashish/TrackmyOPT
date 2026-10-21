-- Verified Jobs personal outreach: audience and merge fields.
-- Read-only. Run with a server role; never export the result into Git.
-- One row per eligible recipient with the fields used by email.txt / email.html.

with base as (
  select
    u.id as user_id,
    lower(u.email) as email,
    u.raw_user_meta_data as meta,
    p.first_name as profile_first_name,
    p.major_name,
    os.opt_ead_end_date,
    os.stem_ead_end_date
  from auth.users u
  left join public.profiles p on p.user_id = u.id
  left join public.opt_status os on os.user_id = u.id
  where u.email_confirmed_at is not null
    and u.deleted_at is null
    and coalesce(u.is_anonymous, false) = false
    and not exists (
      select 1 from public.email_preferences ep
      where ep.user_id = u.id and ep.marketing_emails = false
    )
    and not exists (
      select 1 from public.blocked_emails b
      where lower(b.email) = lower(u.email) and b.deleted_at is null
    )
),
named as (
  select
    b.*,
    trim(coalesce(
      nullif(trim(b.profile_first_name), ''),
      nullif(trim(b.meta->>'first_name'), ''),
      nullif(trim(b.meta->>'firstName'), ''),
      nullif(split_part(trim(b.meta->>'full_name'), ' ', 1), ''),
      nullif(split_part(trim(b.meta->>'fullName'), ' ', 1), ''),
      nullif(split_part(trim(b.meta->>'name'), ' ', 1), '')
    )) as raw_name,
    -- STEM EAD end wins when it is later than the initial OPT end.
    greatest(b.opt_ead_end_date, b.stem_ead_end_date) as work_end_date,
    exists (select 1 from public.resumes r where r.user_id = b.user_id) as has_resume
  from base b
),
fields as (
  select
    n.user_id,
    n.email,
    case
      -- Skip handles, initials, and anything with digits or an @.
      when n.raw_name is null or length(n.raw_name) < 2 or n.raw_name ~ '[0-9@_.]' then 'there'
      when n.raw_name = lower(n.raw_name) or n.raw_name = upper(n.raw_name) then initcap(n.raw_name)
      else n.raw_name
    end as first_name,
    n.major_name,
    n.work_end_date,
    (n.work_end_date - current_date) as days_left,
    n.has_resume,
    case
      when n.major_name ~* 'data|analytic|statistic' then 'data'
      when n.major_name ~* 'computer|software|information (systems|technology)|cyber' then 'engineering'
      when n.major_name ~* 'business admin|management|supply chain|mba' then 'operations'
      else null
    end as role_param,
    case
      when n.major_name ~* 'electrical' then 'electrical engineer'
      when n.major_name ~* 'mechanical' then 'mechanical engineer'
      when n.major_name ~* 'civil' then 'civil engineer'
      when n.major_name ~* 'finance|accounting|econom' then 'analyst'
      else null
    end as query_param
  from named n
)
select
  f.user_id,
  f.email,
  f.first_name,
  case
    -- Under 30 days, a countdown opener reads as alarming; use the major or general line.
    when f.days_left between 30 and 270 then 'runway'
    when f.role_param is not null or f.query_param is not null then 'major'
    else 'general'
  end as segment,
  to_char(f.work_end_date, 'FMMonth FMDD, YYYY') as work_end_label,
  f.days_left,
  f.major_name,
  case f.role_param
    when 'data' then 'data and analytics'
    when 'engineering' then 'software and IT'
    when 'operations' then 'operations and business'
    else f.query_param
  end as role_label,
  f.has_resume,
  'https://www.trackmyopt.com/dashboard/career/jobs?experience=entry'
    || coalesce('&role=' || f.role_param, '')
    || coalesce('&searchScope=title&query=' || replace(f.query_param, ' ', '+'), '')
    || '&utm_source=outreach&utm_medium=email&utm_campaign=verified_jobs_2026_10'
    as jobs_url
from fields f
order by segment, f.email;
