# Supabase migration reconciliation

Verified 2026-09-22 America/New_York (2026-09-23 UTC), using the reconnected Supabase MCP.

## Target and completed work

- Main TrackmyOPT project: `deknauqkqqzwuvopqott`, ACTIVE_HEALTHY.
- Separate H1B Filings project: `piozuntknzemmqwpivrk`, ACTIVE_HEALTHY. No schema changes made there.
- STEM migration `20260922140251_add_stem_dso_recommendation_date` is recorded as applied. Both initial OPT and STEM recommendation fields are nullable DATE columns; ownership RLS remains enabled.
- `generated_resume_artifacts` already exists, including the job identity, artifact JSON/PDF, hashes, expiration, owner foreign key, validation constraints, lookup indexes and update trigger. RLS is enabled and forced; anonymous/authenticated roles have no direct table grants. The service role retains access. No duplicate table migration was needed.
- Confirmed application/private-answer tables have RLS enabled. Also inspected quota RPCs and permissions, Dedicated membership/auth triggers, consultation policy, ATS activation audit, scheduler deferred-dispatch constraint, filing categories, tracker ownership policy, offer/archive columns, and daily reminder dedup index.

## Applied repair

Migration `20260923023837_restore_job_source_integrity_triggers` restores two missing protections from the original job-board migration:

1. `jobs_assert_source_identity` and its function reject jobs whose ATS type/board token do not match the configured source.
2. `jobs_set_updated_at` maintains the timestamp on job updates using the existing timestamp function.

The source guard uses an empty search path, qualified relations, invoker security and service-only execution grants. The original employer-match guard is unchanged. No existing rows, quotas, policies or ingestion RPCs were replaced. The CLI-created local migration filename was aligned with the actual MCP-applied version.

Post-apply SQL verified the recorded migration, enabled trigger definitions, function permissions, zero existing job/source identity mismatches, and zero public base tables without RLS. This is catalog/data-consistency verification, not an end-to-end ingestion test; no user records were changed for testing.

## History drift and limits

Before this repair there were 93 local migration files and 81 remote history entries. After normalizing timestamp prefixes, 39 local filenames had no matching remote migration name. Many corresponding schema objects were already present, and newer changes supersede some older definitions. This is not a list of 39 unapplied schema migrations.

Do not blindly run the old files or mark them all applied. Some restore permissive policies, replace newer RPCs, rewrite policy versions, or delete duplicate queue entries. Duplicate local timestamp prefixes also need deliberate history cleanup before a blanket CLI push. History bookkeeping was not rewritten in this task; exact whole-schema replay equivalence has not been established.

## Remaining checks

- Security advisor reports no ERROR findings, 21 INFO RLS-without-policy findings (including intentionally server-only tables), and one WARN: leaked-password protection is disabled. Review [Supabase password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Auth settings were not changed.
- Deploy reviewed web/backend changes and rebuild/publish the extension separately. The database state does not prove these application changes are live.
- With an authorized test account, verify STEM save/reload across dashboard and extension, reminder scheduling/delivery, and generated-resume restoration after reopening the same job. No production email was sent or application submitted during this reconciliation.
