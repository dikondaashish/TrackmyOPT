# Secondary H-1B filings project

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
