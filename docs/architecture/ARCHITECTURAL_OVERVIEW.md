# Internal architecture overview

This is the current, code-backed system shape as of 2026-10-10.

## Applications

| Application | Runtime | Responsibility |
|-------------|---------|----------------|
| `apps/web` | Next.js on Vercel | Public site, authenticated dashboard, lightweight APIs, Stripe webhooks, email orchestration, and extension-facing APIs |
| `apps/api` | NestJS container on Render | Long-running OCR, USCIS, and job-board ingestion queue workers; resume/OCR APIs; document-security (LaTeX compile and file scan) endpoints |
| `apps/extension` | Manifest V3 Chrome extension | Job capture, job-scoped resume generation handoff, safe form filling, and Guided Autopilot |

## Data and infrastructure

- **Supabase PostgreSQL:** product records, billing evidence, email queue,
  extension artifacts, quotas, and analytics-supporting views.
- **Supabase Auth:** web sessions and the extension OAuth handoff.
- **AWS S3:** document and generated-resume object storage. The app does not use
  Supabase Storage for the document vault.
- **AWS Textract:** OCR for uploaded resumes/documents.
- **Redis + Bull:** durable OCR, USCIS, and job-board ingestion background jobs in
  `apps/api`.
- **Oracle Database (job store):** the only store for job-board records and
  their visa evidence since 2026-09-07. `JOB_DATA_STORE` must be `oracle` or
  unset; there is no Supabase fallback. The historical
  [cutover runbook](oracle-cutover-runbook.md) records the migration.
- **Upstash Redis:** selected web rate limits and short-lived resume handoff
  state.
- **Google Gemini:** resume, screening-answer, and cover-letter generation.
- **Stripe:** subscriptions, trials, portal, payment events, and receipts.
- **PostHog:** consent-gated product analytics and server-side operational
  events.

## Main data flows

### Web authentication

The browser authenticates with Supabase. Server Components and API routes call
`auth.getUser()` before user-owned reads/writes. Service-role clients are
server-only and routes derive ownership from the verified user, not request
body IDs.

### Resume and autofill

1. A user selects or uploads a resume and a job description.
2. Web routes extract/repair content, generate with Gemini, compile the PDF, and
   create a hash-bound autofill snapshot.
3. The extension receives only the active user/job artifact through the
   background worker.
4. It fills eligible empty controls, optionally attaches the matching resume
   and cover letter, and stops before final submission.

### OCR

The web layer uploads to S3 and the Nest API queues OCR work. Bull workers call
Textract and persist status/results for polling. Some web resume routes remain;
future migration is measurement-driven, not an assumed rewrite.

### USCIS case checks

The Vercel cron calls the authenticated web route, which dispatches to the Nest
USCIS worker. Only enrolled premium cases are queued for automatic checks; free
cases retain manual refresh. Sequential/neighbor scanning is disabled.

### Job board ingestion

`apps/api/src/job-board/` ingests jobs from authorized ATS sources.

1. The Vercel cron `/api/cron/job-board-ingestion-dispatch` dispatches the
   daily scheduled runs (`job-board-hour-*`, Mon–Fri 14:00 and 21:00, Sat–Sun
   21:00 New York) once `JOB_BOARD_SCHEDULE_ENABLED=true`.
   `.github/workflows/job-board-ingestion.yml` is a manual
   (`workflow_dispatch`) workflow that runs
   `scripts/operations/trigger-job-board-ingestion.mjs`. It wakes the Render API
   and supervises a run identified by `job-board-manual-*` or `job-board-hour-*`.
   With `monitor_only` set, it only watches an existing run and never
   dispatches.
2. `JobBoardController` (`/job-board/...`) queues enabled sources on the Bull
   queues `job-board` and `job-board-slow`; `JobBoardProcessor` and
   `SlowJobBoardProcessor` process them.
3. A scheduler run ledger (`scheduler-run-ledger.ts`, persisted by
   `supabase-scheduler-run-store.ts`) claims each run ID so a repeated trigger is
   suppressed rather than queued twice. `ingestion-run-status.ts` proves
   completion against the selected sources' latest audits, not queue depth.
4. `ats-platform.registry.ts` identifies the supported ATS platforms, and
   `ats-scrapers.runner.ts` runs the Python adapter
   `scripts/job-board/fetch_ats_jobs.py` with bounded time and output.
5. Employer matching, visa-signal, and company-discovery services enrich the
   results.
6. Records are persisted through the `JobDataStore` contract.
   `job-data-store.provider.ts` always constructs `OracleJobDataStore`; any
   `JOB_DATA_STORE` other than `oracle` (or unset) fails boot. Source
   authorization, audits, employer matches, and H-1B sponsor history remain
   in Supabase.

The web side of the job board (filters, resume matching, server job store) is in
`apps/web/lib/job-board/`.

### Document security

`apps/api/src/document-security/` exposes two bearer-token-protected endpoints:

- `POST /builds/sync` compiles LaTeX to PDF (`pdflatex` or `xelatex`); it
  requires `LATEX_COMPILER_TOKEN` and returns 503 when unconfigured or the
  compiler is unavailable.
- `POST /scan` checks an upload (10 MB limit): a magic-byte/type check that
  rejects executables and archives, then `clamscan` when it is on `PATH`. It
  requires `MALWARE_SCAN_TOKEN`.

### Billing and email

Stripe webhooks update Supabase entitlements and billing evidence. New billing
mail uses `email_queue` plus the shared SMTP transport. Some older reminder and
OTP paths still send directly and are listed in the pending plan.

## Security invariants

- Row-level security and server-side ownership checks protect user records.
- CORS allows configured web origins and explicit extension IDs; it does not
  trust arbitrary extension origins for session APIs.
- Secrets stay in server environment variables.
- Sensitive job-application answers are session-only and never AI-generated.
- The extension never auto-submits and never overwrites existing answers/files.
- Analytics contain enums/counts, not resume, question, answer, or cover-letter
  content.

See [the pending implementation plan](../pending-implementation-plan.md) for
remaining work.
