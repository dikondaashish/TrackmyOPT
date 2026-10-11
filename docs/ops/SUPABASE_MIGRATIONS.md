# Supabase migrations: safe workflow

Last verified 2026-10-10 against the production project
`deknauqkqqzwuvopqott` (read-only).

## Why this needs care

The files in `supabase/migrations/` and production's recorded history are **two
different lists**:

- Production records each migration under the timestamp assigned **when it was
  applied** (through the Supabase dashboard or MCP `apply_migration`), not under
  the local filename.
- Of the 102 local files, only 13 share a version with production, 47 more match
  by name under a different version, and 39 are not tracked in production's
  history at all (the earliest ones predate history tracking).
- The full mapping is in [`supabase/production-history.json`](../../supabase/production-history.json).

Consequences:

- `supabase db push`, `supabase db reset --linked` and
  `supabase migration repair` against production are **not safe**. The CLI sees
  almost every local file as "not applied" and would try to run them again.
  Do not use them on production.
- `supabase db reset` against a **local** database cannot rebuild the whole schema
  from this folder alone: the core tables are not created by any migration, and
  `20260322_enforce_core_rls.sql` runs before the migrations that create the tables
  it adds policies to (see "Known limits of replaying this folder" in
  [`supabase/README.md`](../../supabase/README.md)). Use it only on a database that
  already has the production schema.

## Adding a migration

1. **Create the file** as `supabase/migrations/<YYYYMMDDHHMMSS>_<snake_case>.sql`
   using the current UTC time. It must be newer than production's latest version
   (see `latestVersion` in `production-history.json`).
2. **Write it to be safe to apply once, on a live database:**
   - Prefer additive changes (`add column ... if not exists`, `create table if
     not exists`, `create or replace function`).
   - Enable row level security on every new table and write the policies in the
     same migration.
   - A destructive change (drop, rename, type change, `not null` on existing
     data) ships as its own later migration, after the code that used the old
     shape has been deployed and confirmed unused.
   - No secrets and no real user data.
3. **Check it:** `node scripts/operations/check-migrations.mjs` (also runs in CI).
   It fails on duplicate versions, malformed names, and new files that are not
   newer than production.
4. **Rehearse it** on a throwaway copy of the production schema (a Supabase
   development branch, which can incur cost so confirm that first, or a local
   database restored from a schema dump). Do not rehearse by replaying this folder
   from empty; that does not work today.
5. **Apply to production** with MCP `apply_migration` or the dashboard SQL editor,
   using the same SQL as the file. Then run the Supabase security and performance
   advisors and fix anything the change introduced.
6. **Record what production assigned:**
   - run `list_migrations` and note the new version;
   - rename the local file to `<production version>_<name>.sql`;
   - add `{ "version": ..., "name": ... }` to `applied` in
     `supabase/production-history.json` and update `latestVersion`;
   - commit. The check now confirms the file matches production.

## Rules

- Never edit or rename a migration that has been applied. Fix forward with a new
  migration.
- Never reuse a version number.
- There is no automatic rollback. Before a risky change confirm a backup or
  point-in-time restore is available for the project, and write the corrective
  migration first.
- Never paste or commit connection strings or service-role keys.

## Refreshing the production snapshot

If production changes outside this workflow, run `list_migrations` for the
project, replace `applied` and `latestVersion` in `supabase/production-history.json`,
and leave `localFiles` as it is. `localFiles` is the frozen list of files that
existed when the snapshot was taken; only files not in it are treated as new.
