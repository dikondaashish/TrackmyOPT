# TrackMyOPT documentation

This directory contains current operating references and work that is still
pending. Completed implementation plans and duplicate completion reports were
removed after the 2026-07-25 code/documentation audit.

Start with
[PENDING-IMPLEMENTATION-PLAN.md](./PENDING-IMPLEMENTATION-PLAN.md) for the
ordered backlog and the audit disposition.

## Architecture

| Document | Purpose |
|----------|---------|
| [ARCHITECTURAL_OVERVIEW.md](./architecture/ARCHITECTURAL_OVERVIEW.md) | Current system and data flows |
| [DIRECTORY_DEEP_DIVE.md](./architecture/DIRECTORY_DEEP_DIVE.md) | Current monorepo map |
| [DATABASE_INVENTORY.md](./architecture/DATABASE_INVENTORY.md) | Migration-backed public schema inventory |

## Operations

| Document | Purpose |
|----------|---------|
| [CRON_SETUP.md](./ops/CRON_SETUP.md) | Scheduler registration and safe invocation |
| [CORS_POLICY.md](./ops/CORS_POLICY.md) | Web/extension CORS policy |
| [EMAIL_TEMPLATES.md](./ops/EMAIL_TEMPLATES.md) | Current email catalog |
| [EMAIL_ROADMAP.md](./ops/EMAIL_ROADMAP.md) | Remaining email work only |

## Compliance and billing

| Document | Purpose |
|----------|---------|
| [LEGAL_BILLING_COMPLIANCE_QA.md](./compliance/LEGAL_BILLING_COMPLIANCE_QA.md) | Pending manual/counsel QA |
| [USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md](./compliance/USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md) | Pending USCIS agreement review |
| [evidence-log.md](./compliance/evidence-log.md) | Immutable USCIS remediation evidence |
| [stripe-test-billing-validation.md](./compliance/stripe-test-billing-validation.md) | No-live-charge Stripe validation |

## Product measurement

| Document | Purpose |
|----------|---------|
| [freemium-conversion-metrics.md](./marketing/freemium-conversion-metrics.md) | Day 1/7/30 measurement only |

PostHog event definitions live with code in
[`apps/web/lib/posthog/EVENT_TAXONOMY.md`](../apps/web/lib/posthog/EVENT_TAXONOMY.md).
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
- Add real pending work to `PENDING-IMPLEMENTATION-PLAN.md`.
- Keep evidence logs and operational runbooks even after supporting code ships.
- Remove a temporary plan once every remaining action has been completed or
  moved to the master backlog.
