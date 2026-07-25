-- Restrict legacy SECURITY DEFINER functions to their intended server/trigger
-- callers. PostgreSQL grants EXECUTE to PUBLIC by default, so an explicit
-- service_role grant without an earlier revoke is not sufficient.

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.handle_new_user() SET search_path TO pg_catalog, public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role';
  END IF;

  IF to_regprocedure(
    'public.upgrade_user_to_premium(uuid,text,text)'
  ) IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.upgrade_user_to_premium(uuid, text, text) SET search_path TO pg_catalog, public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.upgrade_user_to_premium(uuid, text, text) FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.upgrade_user_to_premium(uuid, text, text) TO service_role';
  END IF;

  IF to_regprocedure(
    'public.get_premium_users_for_daily_email()'
  ) IS NOT NULL THEN
    EXECUTE 'ALTER FUNCTION public.get_premium_users_for_daily_email() SET search_path TO pg_catalog, public';
    EXECUTE 'REVOKE ALL ON FUNCTION public.get_premium_users_for_daily_email() FROM PUBLIC, anon, authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.get_premium_users_for_daily_email() TO service_role';
  END IF;
END;
$$;
