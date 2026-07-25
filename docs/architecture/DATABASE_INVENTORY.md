# Supabase `public` schema inventory

**Migration-backed snapshot:** 2026-07-25
**Expected objects:** 44 base tables + 6 views = 50 public objects.

The count combines the 35 tables/6 views in the checked-in generated types with
nine applied table-creation migrations that are not yet in that type snapshot.
Regenerating the types from production is a pending task.

Do not drop an object because its name looks old. Confirm production usage,
foreign keys, policies, functions, exports, and retention requirements first.

## Base tables

### Account, profile, and compliance

`application_profile`, `blocked_emails`, `billing_consent_events`,
`policy_consents`, `policy_notice_email_events`, `policy_versions`, `profiles`,
`user_sessions`

### Immigration and USCIS

`case_status`, `employment_spans`, `opt_status`, `push_subscriptions`,
`uscis_api_audit`, `uscis_case_cache`, `uscis_check_log`

### Documents, OCR, and resume generation

`ai_generation_daily_usage`, `ai_generation_item_usage`,
`document_passcodes`, `document_reminders`, `documents`, `export_otps`,
`ocr_jobs`, `passcode_otps`, `resume_drafts`, `resume_generations`, `resumes`,
`saved_resumes`, `screening_answers`

### Jobs and extension

`extension_feedback`, `extension_uninstall_feedback`, `job_applications`,
`job_followups`, `job_interviews`, `job_stages`

### Billing, email, leads, and growth

`contact_submissions`, `email_preferences`, `email_queue`,
`insurance_eligibility_checks`, `notification_settings`,
`partnership_inquiries`, `payment_transactions`, `referrals`

### Sponsor data

`h1b_filings`, `h1b_sponsors`

## Views

| View | Purpose |
|------|---------|
| `document_expiry_overview` | Per-user document expiry reporting |
| `email_delivery_stats` | Recent email delivery metrics |
| `premium_stats` | Premium/free aggregates |
| `revenue_stats` | Payment aggregates |
| `sponsor_intelligence_agg` | H-1B sponsor enrichment |
| `user_activity_summary` | Cross-feature activity summary |

## Security notes

- User-owned tables require RLS/ownership checks; several sensitive tables also
  use FORCE RLS.
- Public lead inserts are routed through server APIs; anon/authenticated direct
  INSERT grants were revoked.
- Legacy security-definer account/billing functions are service-role-only.
- Referral/sponsor mutation RPCs are not executable by anon/authenticated
  roles.
- `auth.*`, `storage.*`, `realtime.*`, and other Supabase-managed schemas are
  outside this inventory and must not be treated as application junk.

## Regenerate TypeScript types

After production migrations:

```bash
pnpm --filter web exec supabase gen types typescript \
  --project-id deknauqkqqzwuvopqott > apps/web/types/supabase.ts
```

Review the generated diff before committing. The expected newly typed tables
include:

`application_profile`, `billing_consent_events`, `extension_feedback`,
`policy_notice_email_events`, `saved_resumes`, `screening_answers`,
`uscis_api_audit`, `ai_generation_daily_usage`, and
`ai_generation_item_usage`.
