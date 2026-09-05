# Oracle job-store cutover runbook

Status: preparation only. Production currently uses `JOB_DATA_STORE=supabase`;
the ingestion schedules remain paused. This runbook does not authorize a
cutover, backfill, deployment, or production write.

## Boundaries

- Supabase project 1 remains the source of truth for authentication, users,
  profiles, resumes, OPT/employment, applications, interviews, follow-ups,
  ATS source authorization, and ingestion audits.
- Supabase project 2 remains the source of truth for H-1B filings and sponsor
  intelligence.
- Oracle contains only job records and Oracle-side posting signals keyed by
  the stable `job_id`. The
  current validation corpus contains 2,284 Oracle-side visa signals across
  2,162 jobs, matching Supabase.
- `employer_matches` and sponsor rows remain in Supabase and are composed by
  `employer_match_id`; no cross-database foreign key is attempted.

## Implemented preparation

The Nest `JOB_DATA_STORE` provider defaults to Supabase and selects Oracle only
for an explicit `JOB_DATA_STORE=oracle`. Missing Oracle configuration fails
closed, with no fallback. `JobBoardService` now persists job records through
the selected store while source authorization, audits, source health, employer
matching, and sponsor lookup remain Supabase operations.

The API exposes an authenticated server-to-server `GET /job-board/jobs` and
`GET /job-board/jobs/:id` boundary. Web job-board reads (listing, detail, and
tracker validation) use this boundary in both modes, so the browser and web
routes never select a database directly. User tracker, resume, and account
data continues to be read/written through Supabase. Supabase remains the
default store selected by the API provider until cutover.

Bounded, resumable tooling is present in
`apps/api/scripts/oracle-job-backfill.ts`. It requires `--write`, `--limit`
(1–1000), and `--checkpoint`; it reads Supabase, upserts Oracle, verifies
read-back rows, records a checksum, and never reconciles or deletes. It is not
run by the application or scheduler.

`job-store-parity.ts` provides an opt-in, non-user-facing comparison helper for
counts, identities, canonical fields, pages, and details. It does not log
descriptions or credentials.

## Cutover prerequisites

1. Apply and verify the Oracle `JOBS` schema, indexes, and least-privileged
   application user. Apply `job-evidence-schema.sql` only after the evidence
   decision is approved.
2. Apply `job-search-schema.sql` as ADMIN. It creates the derived
   `ADMIN.TRACKMYOPT_JOB_SEARCH` table, keeps the lower-cased source CLOB for
   exact checks, and builds the Oracle Text CONTEXT index on the normalized
   accelerator CLOB. The application user receives DML only; it receives no
   DDL privileges.
3. Run Oracle health and connectivity checks from the Render network.
4. Verify all enabled sources have valid board identity and complete source
   metadata in Supabase.
5. Run the backfill in bounded batches with a durable checkpoint. For each
   batch, record source/job counts, checksum, sample read-back, and failures;
   retry failures without reconciling missing jobs.
6. Compare representative pages and details with `compareJobStorePage` and
   `compareJobStoreDetail`, including listing status and timestamps. Compare
   evidence composition separately through Supabase employer matches and the
   approved Oracle posting-signal store.
7. Prove idempotent reruns on an already-copied batch.
8. Confirm the paused cron-job.org schedules and Vercel cron declaration are
   understood. No scheduler is resumed as part of this preparation.
9. Obtain explicit approval to set `JOB_DATA_STORE=oracle` in Render and the
   server-side web configuration, then deploy with the normal CI gate.

## Cutover sequence (approval required)

1. Freeze source changes and record the last successful Supabase ingestion
   audit. Keep all four schedulers paused.
2. Complete and verify the final bounded backfill and parity sample.
3. Set `JOB_DATA_STORE=oracle` only in the approved production environments;
   keep all Supabase account/evidence/source variables present.
4. Deploy API and web. Run health, list, detail, filter, pagination, tracker,
   resume-score, and evidence smoke checks.
5. Resume one scheduler only, observe a full hour, and compare counts,
   timestamps, failures, and audit/source health. Resume remaining schedules
   only after the first hour is clean.

## Rollback sequence

1. Pause schedulers and stop starting new ingestion work.
2. Set `JOB_DATA_STORE=supabase` and redeploy the last known-good build.
3. Verify job listing/detail/tracker and source/audit health against Supabase.
4. Leave Oracle rows intact for diagnosis; do not delete or reconcile them as
   part of rollback.
5. Preserve the backfill checkpoint and parity reports for a later retry.

## Current blockers before cutover

- The Oracle Text index must be present and valid in the target database. The
  current validation has a valid CONTEXT index and exact result counts, but
  multi-term literal verification still needs performance sign-off before a
  production flag change.
- User-specific tracker filters are composed from Supabase application rows by
  the web boundary. They need authenticated parity checks after a backfill.
- Resume ranking, employer composition, and all authenticated tracker paths
  still need final production-like parity checks; the default provider remains
  Supabase while those checks are pending.
- Scheduler state is external to the repository. Confirm cron-job.org pause
  state and reconcile its schedules with the Vercel declaration before any
  resume.
