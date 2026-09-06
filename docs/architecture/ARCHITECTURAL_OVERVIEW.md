# Internal architecture overview

This is the current, code-backed system shape as of 2026-07-25.

## Applications

| Application | Runtime | Responsibility |
|-------------|---------|----------------|
| `apps/web` | Next.js on Vercel | Public site, authenticated dashboard, lightweight APIs, Stripe webhooks, email orchestration, and extension-facing APIs |
| `apps/api` | NestJS container on Render | Long-running OCR and USCIS queue workers plus resume/OCR APIs |
| `apps/extension` | Manifest V3 Chrome extension | Job capture, job-scoped resume generation handoff, safe form filling, and Guided Autopilot |

## Data and infrastructure

- **Supabase PostgreSQL:** product records, billing evidence, email queue,
  extension artifacts, quotas, and analytics-supporting views.
- **Supabase Auth:** web sessions and the extension OAuth handoff.
- **AWS S3:** document and generated-resume object storage. The app does not use
  Supabase Storage for the document vault.
- **AWS Textract:** OCR for uploaded resumes/documents.
- **Redis + Bull:** durable OCR and USCIS background jobs in `apps/api`.
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
