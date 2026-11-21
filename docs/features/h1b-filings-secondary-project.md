# Secondary H-1B filings project (retired)

## Retirement (2026-11-21)

The web app no longer reads this Supabase project. Sponsor profiles and the
`/api/cron/filings-health` probe use only the Oracle copy through the API
service. The Supabase fallback, `lib/supabase/filings.ts`, and the
`H1B_FILINGS_STORE` switch were removed; Sentry showed no Oracle filings
failures in the 90 days before removal, so the fallback was never used.

Before deleting the project (`piozuntknzemmqwpivrk`):

1. Wait for this change to deploy and for `/api/cron/filings-health` to return
   200 from Oracle.
2. Remove `SUPABASE_FILINGS_URL`, `SUPABASE_FILINGS_SERVICE_ROLE_KEY`, and
   `H1B_FILINGS_STORE` from Vercel production.
3. Keep the 2026-09-02 gzip JSONL export (below). After deletion, Oracle
   `TRACKMYOPT_JOB_APP.H1B_FILINGS` is the only live copy.

The offline loaders in `apps/web/scripts/data/` (`enrich-sponsors.ts`,
`populate_db.py`, `process_lca_2025.py`, `process_state_lca.py`,
`update_company_websites.py`, `update_sponsor_locations.py`) and the
Supabase-to-Oracle tools in `apps/api/scripts/` still target this project.
Point them at Oracle before the next DOL data load; they will not run once the
project is deleted.

The sections below are the historical record.

The static `h1b_filings` reference table is replicated to the free Supabase
project `piozuntknzemmqwpivrk` in `us-east-1`. The primary project continues to
own `h1b_sponsors`; no cross-project foreign key is used.

## Access

- URL: `https://piozuntknzemmqwpivrk.supabase.co`
- Runtime access is server-only through `SUPABASE_FILINGS_URL` and
  `SUPABASE_FILINGS_SERVICE_ROLE_KEY`.
- These variables must never be prefixed with `NEXT_PUBLIC_`.
- RLS is enabled on `public.h1b_filings`; anon/authenticated table privileges
  are revoked and only `service_role` has data access.

## Schema and verification

The secondary table mirrors all 98 columns from the primary table and has the
primary key plus indexes on `case_number`, `received_date`, `sponsor_id`, and
`employer_name`. The `filing_intelligence_agg` view performs the filing-only
aggregation used by `enrich-sponsors.ts`.

The migration is resumable and writes a gzip JSONL rollback export. It uses
keyset pagination and 500-row upserts; `H1B_FILINGS_START_ID` can resume a
transiently interrupted run.

## Cutover safety

Keep the primary `h1b_filings` table until the secondary read path has passed a
48-hour production observation. Retain the export for rollback. The primary
table has not been dropped.

The `/api/cron/filings-health` endpoint performs a daily one-row probe. Schedule
it on cron-job.org with `Authorization: Bearer $CRON_SECRET`; non-2xx responses
are intentionally returned for cron alerting when the secondary project is
paused or unavailable.

## Initial copy evidence (2026-09-02)

- Source and target row counts: **233,575 / 233,575**.
- Target schema: **98 columns**; aggregate view rows: **23,573**.
- A deterministic 20-row field-by-field comparison had **0 mismatches**. The
  canonical SHA-256 of the ordered sample hashes is
  `7dbb5939d3ae526df7cacd97bed6b0785a7cd5ceb4aeb943265060acf0bd1ecc`.
- The retained gzip JSONL rollback export has SHA-256
  `672e8157fb4cb42fd878b622179d1d458902a5a47d160179268160a9ba77b77c`.
- Target table physical size after import: **239,525,888 bytes** (the repeatable
  upsert passes left reclaimable heap space; a maintenance vacuum/repack can be
  scheduled before cutover without touching the primary).

The sponsor API now projects the 86 fields consumed by the profile, LCA table,
filing modal, analytics, and its predicates/order. A 500-row sample payload
fell from 1,520,019 bytes with all fields to 1,323,971 bytes (12.90% less).

## Oracle copy (2026-10-14)

`h1b_filings` is also copied to the Oracle Autonomous Database
(`TRACKMYOPT_JOB_APP.H1B_FILINGS`, schema in
`apps/api/sql/oracle/h1b-filings-schema.sql`). The 2026-10-13 copy verified
233,575 / 233,575 rows with 0 missing, 0 extra, and 0 mismatched sampled rows
(`apps/api/scripts/oracle-h1b-filings-backfill.ts --verify`).

- Reads: with `H1B_FILINGS_STORE=oracle` on Vercel, the sponsor profile calls
  the API service's `GET /sponsor-data/filings` (API-key guarded), which runs
  the same sponsor-id / employer-name / case-insensitive-name lookup in Oracle.
  Vercel cannot reach Oracle directly because of the database access list.
- Fallback: while `SUPABASE_FILINGS_*` is still configured, an Oracle failure
  is reported to Sentry and the request is served from this Supabase project.
  Remove those variables only when this project is retired.
- Health: `/api/cron/filings-health` probes Oracle through
  `GET /sponsor-data/filings/health` when Oracle is selected (which also keeps
  the Always Free database active) and still probes this project while it is
  configured.
- Parity: `apps/api/scripts/oracle-h1b-filings-parity.ts` compares the Oracle
  and Supabase lookups for a sponsor sample (300 sponsors / 2,140 filings
  matched exactly before cutover).
