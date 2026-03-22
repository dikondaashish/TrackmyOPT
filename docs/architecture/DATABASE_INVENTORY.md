# Supabase `public` schema — Table Editor inventory (34 objects)

This matches what you see under **public** in the Table Editor: **28 base tables** + **6 views** = **34**.

**Do not drop** any of these in production without a deliberate data-migration plan. None are redundant “junk” tables—they either back the app, analytics, or H-1B data pipelines.

---

## Base tables (28)

| Table | Role | Used in app / backend |
|-------|------|------------------------|
| `blocked_emails` | Block re-registration after delete | `api/auth/check-blocked`, `auth/callback`, `api/auth/delete-account` |
| `case_status` | USCIS case tracking | Web API, `apps/api` USCIS processor/service |
| `document_passcodes` | Vault passcode | Document passcode APIs |
| `document_reminders` | Expiry reminders | Cron, `lib/notifications/reminders` |
| `documents` | Document metadata | Document APIs, rate-limit, export |
| `email_preferences` | Reminder prefs | Email prefs API, document reminder cron |
| `email_queue` | Sent email log | Crons, case-status notify, admin bulk |
| `employment_spans` | OPT employment history | Employment APIs, `/api/me`, export |
| `export_otps` | Data export OTP | Export OTP + export-zip routes |
| `extension_uninstall_feedback` | Chrome ext feedback | `api/extension/uninstall-feedback` |
| `h1b_filings` | LCA filing rows (large dataset) | H-1B sponsor detail page, scripts |
| `h1b_sponsors` | Sponsor directory | H-1B pages, enrich script |
| `insurance_eligibility_checks` | Insurance tool analytics | Insurance API, health finder page |
| `job_applications` | Job tracker applications | Job tracker actions, extension, usage API |
| `job_followups` | Follow-ups | Job tracker actions |
| `job_interviews` | Interviews | Job tracker actions |
| `job_stages` | Custom Kanban stages | Job tracker actions |
| `notification_settings` | Case/doc notification emails | Notification email API, delete-account |
| `opt_status` | OPT dates / timeline | Many APIs, tool-email (enrollment), calculator |
| `passcode_otps` | Passcode change OTP | Passcode OTP routes |
| `payment_transactions` | Stripe payments | Premium webhook, checkout, applyStripe |
| `policy_consents` | Policy acceptance | Policy consent API, delete-account |
| `policy_versions` | Current policy versions | Policy consent API |
| `profiles` | User profile + billing fields | Widespread |
| `referrals` | Referral codes + metrics | Referral routes, auth callback |
| `resume_generations` | Resume AI usage counts | `lib/usage-limit` |
| `resumes` | Resume storage | `apps/api` resume service |
| `user_sessions` | Extension / session tracking | Sessions API, extension ping |

---

## Views (6) — not all queried from Next.js

These appear in the Table Editor alongside tables. They are **reporting/analytics** layers (mostly `SECURITY INVOKER`), not duplicate “extra tables.”

| View | Purpose | App code |
|------|---------|----------|
| `premium_stats` | Aggregate premium vs free users | SQL / admin / service_role (see `007_grants.sql`) |
| `email_delivery_stats` | Email metrics (last 30 days) | Admin / analytics |
| `revenue_stats` | Payment aggregates | Admin / analytics |
| `document_expiry_overview` | Per-user document expiry buckets | Optional dashboards; RLS-friendly |
| `user_activity_summary` | Cross-feature activity summary | Optional dashboards; RLS-friendly |
| `sponsor_intelligence_agg` | Sponsor intel for LCA enrichment | Used by `get_sponsor_intelligence` RPC + `scripts/data/enrich-sponsors.ts` |

---

## Foreign “schemas” (not part of the 34)

Supabase also manages **`auth.*`**, **`storage.*`**, **`realtime.*`**, etc. Those are platform tables—**do not remove** them; they are required by Supabase Auth, Storage, and Realtime.

---

## Regenerating TypeScript types

After schema changes:

```bash
# From repo root, if using Supabase CLI linked to the project:
pnpm --filter web exec supabase gen types typescript --project-id <id> > apps/web/types/supabase.ts
```

Or use Cursor **Supabase MCP** → `generate_typescript_types` (already done in this project previously).

---

## Summary

- **34 objects** = **28 tables** + **6 views** — all accounted for.
- **Nothing to remove** unless you are intentionally deprecating a product feature and have migrated data off first.
