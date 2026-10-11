# Case data deletion and retention

Implementation dated 2026-10-11. Migration version 20261011180407 was applied
and verified on TrackMyOPT production: all five triggers, private metrics RLS,
function restrictions, and the case-log cascade were present; the 4,139
quarantined rows remained intact. Historical orphan counts remained 171 lookup
logs and 67 audit rows. Code/CI/deployment evidence is reported with the release pull request. This is a technical retention specification,
not counsel's certification of the USCIS agreement or every applicable law.

## Ordinary case removal and account deletion

| Data | Behavior |
| --- | --- |
| Owned case receipt, status, USCIS history, and change log | Delete the enrollment row. Its notices and scheduled-job records cascade under the existing foreign keys. |
| New lookup diagnostics | Attach to the exact case; delete with that case. Do not retain upstream free text. |
| Enrollment audit | Delete that user's matching receipt hash on case removal; delete all their audit rows on account deletion. A receipt hash and user ID are personal data, not anonymization. |
| Case status email records | Delete the user's matching receipt records. Reject late inserts/updates once the enrollment is absent. |
| Shared historical receipt logs and ordinary cache | Delete when the last enrollment for that receipt is removed. Preserve another user's separately authorized case and new diagnostics. |
| New Redis check jobs | Remove on success or final failure. Workers revalidate enrollment and discard results if the exact case was deleted. |
| Inactive legacy Redis jobs for removed enrollments | The existing daily case-check cron sweeps them before queueing work, including when no cases remain. Active legacy jobs may remain until the next successful daily sweep. Cleanup failures are errors, not silent success. |
| Vault/OCR objects | Delete owned S3 keys before deleting their database pointers. Check batch errors and retain pointers on failure so a retry can finish cleanup. |
| Ordinary deletion email block | Do not create it; remove an existing block with reason `account_deleted`. Other fraud/security blocks are unaffected. |
| Daily service counts | Keep only UTC day and allowed/blocked/success/failure totals. No receipts, users, status text, decision dates, nationality, or event-level identifiers. No historical backfill. |

The database triggers protect direct SQL/Auth deletion and alternate callers;
the shared account cleanup helper also covers the web endpoint and admin script.
Case-trigger cleanup is transactional: a database failure rolls back the case
removal. The multi-provider account workflow is not one distributed transaction:
Stripe cancellation or S3 deletion can succeed before a later step fails.
The endpoint returns an error, retains retry pointers where possible, and does
not report Auth deletion as complete until it succeeds.

Retained operational totals are service reliability counts, **not** a dataset
of departed applicants' approval dates. Do not build an anonymized USCIS
prediction archive without reviewing the actual API agreement. Existing
partner community timelines are a separate source and were not changed.

## Exceptions and limits

- The 4,139 quarantined neighbor-scan cache rows and the
  [existing evidence log](evidence-log.md) remain protected. They are excluded
  from ordinary cache cleanup and product reads. Counsel must decide their
  disposition; quarantine is not permission for indefinite reuse or retention.
- This migration does not bulk-delete historical orphan records, old deletion
  email blocks, or provider artifacts. Review and execute any historical purge
  separately, with a specific scope and the evidence exception respected. The
  [guarded historical purge](../../supabase/operations/purge_historical_orphan_case_records.sql)
  additionally excludes historical diagnostics whose receipt is quarantined.
  It fails without an explicit approval flag and is not run by the release.
- Existing local billing/consent rows follow their current account-deletion
  behavior. Stripe may retain necessary payment, tax, dispute and fraud records
  under its own obligations. This change introduces no applicant archive and
  no arbitrary new billing retention period.
- Database backups, S3 object versions/replicas, provider logs, delivered email,
  PostHog/Sentry records, and other processors have separate retention controls.
  The source change does not certify their erasure. In-flight uploads can create
  an orphan object; bucket lifecycle/inventory reconciliation needs separate
  verification. An SMTP message already accepted cannot be recalled.
- A delivery-time enrollment check narrows notification races; it cannot make
  an external SMTP send and database deletion one atomic operation.
- A successful cron/deployment has not yet proved the next daily Redis sweep
  ran. Monitor its runtime result and escalate a missed/failed sweep.
- The existing privacy promise remains a reasonable period, typically within
  30 days, subject to backups/legal holds. This is our policy, not a universal
  USCIS statutory deadline.

## Release and verification

1. Rehearse the migration on disposable PostgreSQL:
   `node scripts/operations/test-case-data-retention.mjs`. The fixture covers
   affected tables/grants/triggers only, not a full production schema replay.
2. Check production metadata and project `deknauqkqqzwuvopqott`. Apply only
   `20261011180407_case_data_retention.sql` before the new code. Do not use
   `supabase db push` against production's divergent migration history.
3. Record the same version/name in the production migration ledger and
   `supabase/production-history.json`. Check new table grants/RLS, locked
   function search paths, installed triggers, and quarantine count using only
   metadata/aggregate queries. Do not delete a customer to test.
4. Deliver through the required PR checks to main and verify exact Vercel and
   Render deployment commits. Tests cover shared ownership, stale writes,
   partial failure, rollback, privacy-safe monitoring, and concurrent deletion.
5. If the migration fails before commit, its transaction rolls back. For an
   operational regression, fix forward: do not restore the raw-data logging
   paths, drop the quarantine, or run a bulk purge as a rollback. The migration
   has no existing-data backfill or destructive table/column change.

## Legal review still required

The [API agreement checklist](USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md) remains
unchecked until actual agreement/approval-email review. Do not interpret a
public case status page as blanket storage, resale, or prediction rights.

Sources reviewed on 2026-10-11:

- [USCIS production affidavit requirements](https://developer.uscis.gov/get-started/production-access/affidavit)
  address retention policies and a permanent deletion path/timeframe.
- [FTC data minimization guidance](https://www.ftc.gov/business-guidance/resources/protecting-personal-information-guide-business)
  supports keeping only necessary information for a defined purpose.
- [TrackMyOPT privacy policy](https://www.trackmyopt.com/privacy)
  describes our existing deletion, backup and legal-hold promises.
