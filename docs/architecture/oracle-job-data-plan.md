# Oracle 26ai job-data layer (staged, Supabase remains default)

Status: cutover-preparation foundation. No production read/write path has been
switched and no Supabase table has been changed. Oracle schema/user setup is
operator-managed; this repository does not execute Oracle DDL automatically.
The four external job-board schedules remain paused during validation.

The operator bootstrap is prepared in
`apps/api/sql/oracle/bootstrap-job-app-user.sql`. It has not been executed in
this environment because no Oracle SQL console/connection is available to the
agent, and using Render's `DB_PASSWORD` would mean using the ADMIN account.

## Diagnosis and current boundary

Render's `DATABASE_URL` and `DB_PASSWORD` are not used by the job layer. The
latter is an Oracle ADMIN credential and is deliberately not used. The API now
has a lazy, dedicated-user `oracledb` adapter selected only when
`JOB_DATA_STORE=oracle`; Supabase remains the default and there is no automatic
fallback. The adapter is covered by driver-mocked tests and is not selected in
the current production configuration.

The Render timeout is therefore a Supabase timeout, not an Oracle error. The
failure stack resolves to two operations in `JobBoardService`:

* `markSourceAuditFailed` reads the latest `ingestion_audit_log` row for a
  source and scheduler run (`source_id`, `scheduler_run_id`, `status =
  'started'`, ordered by `run_at`, limit 1).
* `complete` calls the `complete_ats_ingestion` Supabase RPC.

Both are audit/control-plane operations and remain in Supabase. Moving job
rows to Oracle will not fix those timeouts by itself; they need a separate,
measured Supabase audit-path investigation.

## Exact job schema currently in Supabase

`public.jobs` has 27 ordinal slots (26 populated columns; ordinal 14 is an
unused gap):

| Column | Type / constraint |
| --- | --- |
| `id` | `uuid`, primary key, generated UUID |
| `source_id` | `uuid`, required, FK to `ats_sources` (`RESTRICT`) |
| `source_ats` | `text`, required, allow-list check |
| `board_token` | `text`, required |
| `external_job_id` | `text`, required |
| `title` | `text`, required |
| `company_name` | `text`, required |
| `location` | `text` |
| `department` | `text` |
| `description` | `text` |
| `job_url` | `text` |
| `posted_at` | `timestamptz` |
| `updated_at` | `timestamptz`, required, default `now()` |
| `opt_eligible` | `boolean` |
| `stem_opt_eligible` | `boolean` |
| `cpt_eligible` | `boolean` |
| `h1b_sponsor_status` | `text` |
| `created_at` | `timestamptz`, required, default `now()` |
| `first_seen_at` | `timestamptz`, required, default `now()` |
| `last_confirmed_at` | `timestamptz`, required, default `now()` |
| `listing_status` | `text`, required, default `open`, check `open/stale/removed` |
| `employer_board_name` | `text` |
| `source_trust_tier` | `text`, required, default `verified_ats` |
| `employer_match_id` | `uuid`, FK to `employer_matches` (`SET NULL`) |
| `missing_since_at` | `timestamptz` |
| `removed_at` | `timestamptz` |

The implementation audit observed 10,902 verified/open rows at that point in
time; counts are expected to change as ingestion runs.

Oracle's design-only DDL is in `apps/api/sql/oracle/jobs-schema.sql`. Oracle
uses `VARCHAR2`, `CLOB`, `TIMESTAMP WITH TIME ZONE`, and `NUMBER(1)` for
portable boolean flags. No cross-database foreign keys are attempted; source
and match IDs remain opaque identifiers.

## Supabase job operations to move or keep

| Operation | Current path | Initial Oracle plan |
| --- | --- | --- |
| Create/update jobs | `JobBoardService.persistSourceJobs`: chunked `jobs.upsert` on `(source_ats, board_token, external_job_id)` | Move job-row upsert behind `JobDataStore`; retain source/audit reservation in Supabase |
| Existing-job diff | `jobs.select(id, external_job_id, listing_status)` with pagination by `source_id` | Oracle keyed read; keep complete-feed reconciliation |
| Stale/removed lifecycle | `jobs.update` for missing IDs | Oracle updates; never delete tracked application history |
| Job search | `apps/web/app/api/job-board/jobs/route.ts`: verified/open filters, joins, order, 50-row range | Server API/repository boundary in both modes; user auth and tracker filters remain Supabase |
| Initial dashboard page | `apps/web/app/dashboard/career/jobs/page.tsx`: first 50-row page | Calls the server API boundary; no direct browser/database access |
| Detail description | `/api/job-board/jobs/[id]/description` | Calls the server API boundary; selected store owns the read |
| Resume scoring | current-page job description read and deterministic score | Keep resume/profile data in Supabase; score the page returned by the selected job store |
| Employer match | `EmployerMatchService`: source jobs read, `employer_matches` upsert, job link update, sponsor-candidate RPC | Keep evidence/match tables and RPC in Supabase; pass job IDs/company values across a controlled service boundary |
| Visa signals | `JobVisaSignalService`: source jobs read, signal delete/insert/upsert, sponsor reads | Posting signals use Oracle `job_visa_signals` when Oracle is selected; employer matches and H-1B sponsors remain Supabase and are composed server-side |
| User tracker | `job_applications` reads/writes in dashboard actions and extension routes | Never move; it is user/account data in Supabase and stores copied job metadata/URL |

The complete current call-site inventory is in the implementation review above:
`JobBoardService`, `EmployerMatchService`, `JobVisaSignalService`, the jobs
API route, dashboard page, description route, tracker actions, and extension
application route. There is no job-to-user foreign key; user rows reference a
job URL/copy in `job_applications`.

## Oracle compatibility and driver decision

The backend has no ORM and no PostgreSQL wire client: it uses Supabase REST
and PostgreSQL RPC semantics. Oracle SQL must therefore be explicit; Postgres
`.range()` becomes `OFFSET ... FETCH`, Postgres `ilike` becomes a deliberate
case-normalization strategy, and PostgREST nested joins do not exist. The
first Oracle adapter should use the official `oracledb` Node driver in Thin
mode, with a bounded pool and call timeout. Thick mode/wallet handling is not
needed for the current TLS setup unless Oracle requires it for the chosen
connection string.

The official `oracledb` package is loaded lazily by the `OracleJobDataStore` in
`apps/api/src/job-board/oracle-job-data-store.ts`. The adapter accepts only the
dedicated Oracle configuration and is covered by driver-mocked CRUD/query
tests. `JobBoardModule` registers a factory that constructs it only for an
explicit `JOB_DATA_STORE=oracle`; the current default remains Supabase.
Once the dedicated user and schema exist, the real probe is
`pnpm --filter api exec ts-node scripts/oracle-job-store-smoke.ts`; it writes
only a clearly named sentinel row to the shadow database and never touches
Supabase.

## Security and feature flag

`JOB_DATA_STORE` is validated as `supabase` (default) or `oracle`. Dedicated
Oracle variables are reserved for a future server-only connection:

* `ORACLE_JOB_DB_CONNECT_STRING`
* `ORACLE_JOB_DB_USER`
* `ORACLE_JOB_DB_PASSWORD`
* `ORACLE_JOB_DB_POOL_MAX` (bounded to 10, default 4)

`DATABASE_URL` and `DB_PASSWORD` are intentionally ignored by the job layer.
If `JOB_DATA_STORE=oracle` is set before the adapter is enabled, the Nest job
service fails fast with a clear message rather than silently writing to
Supabase. The browser never receives Oracle credentials or a direct Oracle
connection.

## Staged migration and shadow-validation plan

1. Run the operator bootstrap with a generated secret, execute the design-only
   DDL as the dedicated user, and revoke `CREATE TABLE` afterward. Do not use
   `ADMIN` from the application. Apply `job-evidence-schema.sql` before an
   Oracle-mode ingestion can persist posting visa signals.
2. Keep `JOB_DATA_STORE=supabase`; after provisioning the user, run a
   controlled shadow batch through the Oracle adapter that writes
   the same normalized rows to Oracle in a non-authoritative transaction.
3. Compare counts, keys, lifecycle statuses, representative descriptions, and
   the real search/filter/pagination queries against Supabase. Test duplicate
   upserts, retries, zero-job feeds, stale/removed transitions, and a restart.
4. Expose Oracle only through authenticated Nest/Vercel API calls. Keep
   `ats_sources`, ingestion audits, employer matches, H-1B sponsors/filings,
   and all user/application tables in Supabase. Compose Oracle posting
   signals with those Supabase evidence records by stable job/employer IDs.
5. Enable Oracle reads for an internal cohort only after shadow parity and
   latency/error thresholds pass. Roll back with the flag to `supabase` without
   changing data or user records.
6. Only a separately approved cutover could make Oracle authoritative for job
   rows. No production switch is part of this foundation.

## Risks and rollback

* **Identity drift:** IDs are text and no cross-database FK can enforce source
  ownership. Validate source IDs before writes and keep Supabase audit logs.
* **Search differences:** Oracle `LIKE`/`INSTR` and pagination can differ from
  Postgres `ILIKE`/PostgREST joins. Shadow-test every current filter before any
  read switch.
* **Evidence consistency:** employer matches and sponsors remain in Supabase
  while posting visa signals are local to Oracle when Oracle is selected. The
  composed read must tolerate a missing/stale evidence row or a temporarily
  unavailable evidence store without changing the job row itself.
* **TLS/credential errors:** use a dedicated user, server-only env vars,
  bounded connect/call timeouts, and health checks; never log credentials.
* **Capacity:** descriptions are CLOBs; size and index growth must be measured
  before enabling high-volume sources.

Rollback is a configuration change back to `JOB_DATA_STORE=supabase` plus
disabling the Oracle adapter. Because Supabase remains unchanged and no user
tables move, this does not require a destructive rollback or data deletion.
