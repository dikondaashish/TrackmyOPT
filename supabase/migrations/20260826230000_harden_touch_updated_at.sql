-- The trigger function only needs built-in PostgreSQL functions. Pinning its
-- search_path prevents any caller-controlled schema from influencing name
-- resolution when it runs on an update.
ALTER FUNCTION public._touch_updated_at() SET search_path = pg_catalog;
