# Controlled Supabase → Oracle job shadow sync

This is a manual, bounded validation tool. It is not imported by Nest, not an
HTTP route, and not a scheduler task. `JOB_DATA_STORE` must remain `supabase`.
The command reads one explicitly selected verified/open source from Supabase
and writes only the selected job rows to the Oracle `JOBS` table.

## Safety gates

The command refuses to run unless all three options are present:

* `--source-id <UUID>`
* `--limit <integer>` (required, 1–100; there is no default and no `all` mode)
* `--write`

The first run should use `--limit 5` or `--limit 10`. `--verify-idempotence`
is separate and is never enabled automatically; when supplied, the exact
batch is submitted twice to exercise Oracle's existing MERGE identity key.

The process also refuses to run when `JOB_DATA_STORE` is anything other than
the default/production value `supabase`. It reads Oracle credentials only from
the dedicated `ORACLE_JOB_DB_*` variables. Credentials, connection strings,
SQL, and job descriptions are not logged.

## Data flow

1. Run Oracle `healthCheck()` first. If it fails, Supabase is not queried.
2. Read an explicit 26-column projection from `public.jobs` for the requested
   source, filtered to `listing_status = 'open'` and
   `source_trust_tier = 'verified_ats'`, ordered by `id`, with bounded ranges.
3. Validate source identity, lifecycle values, required fields, and dates.
4. Call the existing `OracleJobDataStore.upsertJobs()` once for the batch.
5. Call `getJob(id)` for every selected row and compare all shared fields.
6. If explicitly requested, repeat the same upsert and read-back. Never call
   `reconcileSource()` because a partial batch must not mark other jobs stale.
7. Close the Oracle pool in all success and failure paths.

The result reports selected/submitted/verified counts, optional second-pass
read-back counts, mismatches, and whether the idempotence pass succeeded. The
adapter's `upsertJobs()` contract returns `void`, so the tool does not claim an
insert-versus-update breakdown.

## First-run command (not executed automatically)

Run from an environment that is authorized to reach Oracle, with the existing
server-only variables injected by the operator:

```sh
JOB_DATA_STORE=supabase \
pnpm --filter api exec ts-node scripts/oracle-job-shadow-sync.ts \
  --source-id <SOURCE_UUID> \
  --limit 5 \
  --write
```

Do not place Oracle credentials in this document or in a browser-visible
environment variable. The command performs no Supabase writes, deletes, RPCs,
reconciliation, scheduler changes, or production-store switching.
