# Issue: the migrations folder cannot rebuild the database from empty

Status: open, not started. Found 2026-10-10 during the repository cleanup.
Production is **not** affected and must not be changed as part of this work.

## Problem

`supabase db reset` (or any replay of `supabase/migrations/` into an empty
database) fails today, for two independent reasons. Both were verified by reading
the files, not by running a replay.

1. **Core tables are not created by any migration.** `profiles`, `documents`,
   `email_queue`, `email_preferences`, `payment_transactions`, `opt_status`,
   `employment_spans`, `case_status` and `document_passcodes` exist in production
   but no file under `supabase/migrations/` creates them. They come from the
   legacy snapshot in `supabase/schema/`, which was applied by hand.
2. **A migration runs before the tables it targets exist.**
   `20260322_enforce_core_rls.sql` creates policies on `public.saved_resumes` and
   `public.h1b_sponsors`. Those tables are created later, by
   `20260709140000_create_saved_resumes_table.sql` and
   `20260709150000_create_h1b_sponsors_and_filings.sql`. Its
   `ALTER TABLE IF EXISTS` lines are harmless, but the `CREATE POLICY` statements
   only catch `duplicate_object`, so a missing table raises an error.

Related, and a reason this is risky to "just fix": production records its
migrations under different versions than the local filenames (only 13 of 102
match; see `supabase/production-history.json`), so the CLI cannot be used to
reconcile the two.

## Why it matters

- A new developer, a CI job, or a disaster-recovery rebuild cannot create a
  working database from the repository alone.
- Migrations cannot be rehearsed by replaying the folder, so the safe workflow in
  `docs/ops/SUPABASE_MIGRATIONS.md` has to rehearse on a copy of the production
  schema instead.

## Hard constraints

- Do not run anything that writes to production, and do not use
  `supabase db push` or `supabase migration repair` against it.
- Do not edit the SQL of a migration production has already applied without a
  reviewed plan; renaming or adding local files is safe, rewriting history is not.
- Do not change `supabase/production-history.json` except to refresh it from a
  read-only `list_migrations`.

## Suggested approach (to be reviewed before any work)

1. Take a **schema-only dump of production** (read-only) and commit it as a
   baseline, for example `supabase/baseline/<date>_schema.sql`, together with the
   production version it corresponds to.
2. Make the replay start from that baseline, then apply only migrations newer than
   it. The older files stay in the repository for history but are not replayed.
3. Fix ordering inside the post-baseline set, if any problem remains, by adding a
   new, guarded migration rather than rewriting an applied one.
4. Add a CI job that starts an empty Postgres, loads the baseline, applies the
   remaining migrations in order, and fails on any error.
5. Add a read-only drift check that compares the replayed schema with a fresh
   production schema dump, so the two cannot silently diverge again.

## Done when

- A fresh database built only from the repository matches production's schema.
- The CI replay job passes on `main` and on pull requests.
- `docs/ops/SUPABASE_MIGRATIONS.md` and the "Known limits" note in
  `supabase/README.md` are updated to describe the new baseline workflow.
