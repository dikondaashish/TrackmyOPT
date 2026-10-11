# TrackMyOPT documentation

This directory contains current operating references and work that is still
pending. Completed implementation plans and duplicate completion reports were
removed after the 2026-07-25 code/documentation audit.

Start with
[pending-implementation-plan.md](./pending-implementation-plan.md) for the
ordered backlog and the audit disposition.

## Architecture

| Document | Purpose |
|----------|---------|
| [ARCHITECTURAL_OVERVIEW.md](./architecture/ARCHITECTURAL_OVERVIEW.md) | Current system and data flows |
| [DIRECTORY_DEEP_DIVE.md](./architecture/DIRECTORY_DEEP_DIVE.md) | Current monorepo map |
| [oracle-shadow-sync.md](./architecture/oracle-shadow-sync.md), [oracle-cutover-runbook.md](./architecture/oracle-cutover-runbook.md) | Oracle job-data shadow sync and cutover |

## Features

Operating references for shipped features, in [`features/`](./features/):
official processing data maintenance, the H-1B filings secondary project, and
the university resource pack.

## Plans

Active plans live in [`plans/`](./plans/) (`growth-recovery-2026-10.md`). The master backlog stays at the docs root in
[pending-implementation-plan.md](./pending-implementation-plan.md).

## Operations

| Document | Purpose |
|----------|---------|
| [CRON_SETUP.md](./ops/CRON_SETUP.md) | Scheduler registration and safe invocation |
| [SUPABASE_MIGRATIONS.md](./ops/SUPABASE_MIGRATIONS.md) | Safe migration workflow (local and production histories differ) |
| [CORS_POLICY.md](./ops/CORS_POLICY.md) | Web/extension CORS policy |
| [EMAIL_TEMPLATES.md](./ops/EMAIL_TEMPLATES.md) | Current email catalog |
| [EMAIL_ROADMAP.md](./ops/EMAIL_ROADMAP.md) | Remaining email work only |
| [GITHUB_CHECKS.md](./ops/GITHUB_CHECKS.md) | Required CI checks and branch protection |

## Compliance and billing

| Document | Purpose |
|----------|---------|
| [LEGAL_BILLING_COMPLIANCE_QA.md](./compliance/LEGAL_BILLING_COMPLIANCE_QA.md) | Pending manual/counsel QA |
| [USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md](./compliance/USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md) | Pending USCIS agreement review |
| [evidence-log.md](./compliance/evidence-log.md) | Immutable USCIS remediation evidence |
| [stripe-test-billing-validation.md](./compliance/stripe-test-billing-validation.md) | No-live-charge Stripe validation |
| [ats-ingestion-platform-review.md](./compliance/ats-ingestion-platform-review.md) | Legal gate for enabling job-board sources |
| [EXTENSION_PRIVACY_RELEASE_REVIEW.md](./compliance/EXTENSION_PRIVACY_RELEASE_REVIEW.md) | Extension privacy release checklist |
| [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) | Third-party licence decisions |

## Product measurement

Dashboard configurations live in [`analytics/`](./analytics/). Public-claim evidence is in [marketing-claims-evidence.md](./marketing/marketing-claims-evidence.md).

PostHog event definitions live with code in
[`apps/web/lib/posthog/event-taxonomy.md`](../apps/web/lib/posthog/event-taxonomy.md).
Outstanding PostHog operations are in the pending implementation plan.

## Growth assets and pending campaigns

| Document | Purpose |
|----------|---------|
| [community-engagement-playbook.md](./marketing/community-engagement-playbook.md) | Community execution templates |
| [email-sequences-playbook.md](./marketing/email-sequences-playbook.md) | Prepared marketing email copy; provider/opt-out required before use |
| [paid-ads-playbook.md](./marketing/paid-ads-playbook.md) | Paid campaign plan |
| [ENTITY-OPTIMIZATION-SETUP.md](./seo/ENTITY-OPTIMIZATION-SETUP.md) | Pending entity/profile work |
| [GOOGLE-SEARCH-CONSOLE-SETUP.md](./seo/GOOGLE-SEARCH-CONSOLE-SETUP.md) | Search Console setup and monitoring |
| [INDEXNOW-SETUP.md](./seo/INDEXNOW-SETUP.md) | IndexNow operating reference |

## Documentation rules

- Do not create a new phase report for completed work; use git history.
- File layout: runbooks in `ops/`, operating references in `features/`, plans in `plans/`. Delete reports once the work ships.
- Add real pending work to `pending-implementation-plan.md`.
- Keep evidence logs and operational runbooks even after supporting code ships.
- Remove a temporary plan once every remaining action has been completed or
  moved to the master backlog.
