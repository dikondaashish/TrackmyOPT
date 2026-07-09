# TrackMyOPT documentation

Single source for project documentation. Application code lives under `apps/`; database schema under `supabase/`.

## Architecture

| Doc | Description |
|-----|-------------|
| [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) | System overview |
| [ARCHITECTURAL_OVERVIEW.md](./architecture/ARCHITECTURAL_OVERVIEW.md) | High-level design |
| [DIRECTORY_DEEP_DIVE.md](./architecture/DIRECTORY_DEEP_DIVE.md) | Folder-by-folder map |
| [DATABASE_INVENTORY.md](./architecture/DATABASE_INVENTORY.md) | Tables and relationships |
| [BACKEND_IMPLEMENTATION.md](./architecture/BACKEND_IMPLEMENTATION.md) | Nest API + background jobs |

## Operations

| Doc | Description |
|-----|-------------|
| [CRON_SETUP.md](./ops/CRON_SETUP.md) | Cron jobs — Vercel (case status only) + cron-job.org |
| [CORS_POLICY.md](./ops/CORS_POLICY.md) | CORS rules for web + extension |
| [EMAIL_TEMPLATES.md](./ops/EMAIL_TEMPLATES.md) | Transactional email catalog |
| [EMAIL_ROADMAP.md](./ops/EMAIL_ROADMAP.md) | Planned email work |

## Compliance & billing

| Doc | Description |
|-----|-------------|
| [BILLING_COMPLIANCE_QA.md](./compliance/BILLING_COMPLIANCE_QA.md) | Billing/refund QA checklist |
| [LEGAL_BILLING_COMPLIANCE_QA.md](./compliance/LEGAL_BILLING_COMPLIANCE_QA.md) | Legal pages + billing copy |
| [PAYMENT_FLOW_AUDIT.md](./compliance/PAYMENT_FLOW_AUDIT.md) | Stripe payment flow audit |
| [stripe-test-billing-validation.md](./compliance/stripe-test-billing-validation.md) | Test-mode billing validation |

## PostHog analytics

| Doc | Description |
|-----|-------------|
| [POSTHOG-PHASE-5-CLOSURE.md](./posthog/POSTHOG-PHASE-5-CLOSURE.md) | Current instrumentation closure |
| [POSTHOG-COMPREHENSIVE-AUDIT-AND-ROADMAP.md](./posthog/POSTHOG-COMPREHENSIVE-AUDIT-AND-ROADMAP.md) | Full audit + roadmap |

See [`apps/web/lib/posthog/EVENT_TAXONOMY.md`](../apps/web/lib/posthog/EVENT_TAXONOMY.md) for event definitions (lives with code).

## Marketing & SEO

- [`marketing/`](./marketing/) — campaigns, messaging
- [`seo/`](./seo/) — technical SEO playbooks

## Archive

Completed phase reports and one-off remediation plans: [`archive/`](./archive/)
