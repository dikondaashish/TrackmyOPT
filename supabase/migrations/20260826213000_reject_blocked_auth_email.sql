-- Enforce deleted-account email blocks inside Auth so every signup surface is
-- protected, including direct calls that bypass the web client.
create or replace function public.reject_blocked_auth_email()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if new.email is not null and exists (
    select 1
    from public.blocked_emails as blocked
    where lower(blocked.email) = lower(new.email)
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'This email cannot be used to create an account';
  end if;

  return new;
end;
$$;

revoke all on function public.reject_blocked_auth_email() from public, anon, authenticated;
grant execute on function public.reject_blocked_auth_email() to service_role;

drop trigger if exists reject_blocked_auth_email on auth.users;
create trigger reject_blocked_auth_email
before insert on auth.users
for each row
execute function public.reject_blocked_auth_email();
