# Pending-case monitoring email experiment

Implemented October 11, 2026. The migration was applied and recorded in the correct production project; permission and no-backfill checks passed. At setup, zero accounts had `marketing_emails=true`, so consent collection is required for an audience. Prospective enrollment only; no historical backfill or bulk send.

## Behavior

- A real, successful saved-case check enrolls a Free account once. Mock development lookups do not enroll. Unknown/failed lookups, final decisions, and action-required notices are excluded.
- Approximately 24 hours later (hourly cron at minute 45), the first email describes Pro monitoring and conditional OPT/STEM community estimates. Candidates expire after 72 hours; the last successful case check must also be within 72 hours with no subsequent failed check.
- A signed message link opens a short page. GET, HEAD, previews, and raw clicks do not record engagement. The recipient must sign in as the message owner and deliberately press **See my monitoring options**. The first such eligible POST starts the follow-up clock; repeat visits do not reset it.
- One follow-up becomes due 24 hours later, with a 72-hour expiry. It reassures about the service and says monitoring cannot speed up USCIS. The existing monitoring pricing modal defaults to monthly billing and keeps the explicit recurring-payment consent.
- Recheck confirmed account, current Free plan, introductory eligibility, explicit `marketing_emails=true`, suppression list, current owned case, and payments before reservation and again immediately before SMTP. A linked Stripe customer with subscription history is conservatively excluded; billing outages stop sending. A completed or paid recovery checkout is excluded too.
- Stop on purchase, final/action-required status, case removal, account deletion, unsubscribe, stale/failed checks, or loss of eligibility. No preferences are backfilled. NULL marketing preference is not consent. The optional Product emails checkbox in Notifications and beside a verified pending Free case persists this choice independently of case alerts and reminders; it starts unchecked and never opts users in automatically.
- An atomic database cap permits **at most two reservations per account across first email, follow-up and checkout recovery**. Existing recovery records count. Failed/ambiguous sends count conservatively; cancelled-before-send records do not. Unique first/follow-up kinds prevent repeated sends. This is a lifetime cap for this experiment, not a reset every week.
- 80% deterministic treatment / 20% holdout by account UUID. Holdout receives neither new pending-case email; ordinary eligible checkout recovery remains common to both groups. All other marketing programs are outside this experiment.

The price comes from the commercial constants: $0.99 for seven days for eligible accounts, then $4.99/month or $49.99/year if annual billing is selected. Both emails include renewal/cancellation information, a product-offer label, postal address, support reply address, and a signed unsubscribe link. No receipt number, status description, or predicted date is included in email content or campaign analytics.

## Provider approval and activation

The owner explicitly instructed use of the existing Zoho/ZeptoMail account on October 11 and reports written permission from founder Vembu for this campaign. Keep that approval privately with the provider account; no approval document or credentials belong in Git. This recorded owner exception is the basis for using the existing account despite [Zoho's general published promotional-email restriction](https://www.zoho.com/cpaas/help/sending-bulk-emails.html).

The applied migrations are `supabase/migrations/20261011190558_pending_case_email_sequence.sql` and the small foreign-key index follow-up `supabase/migrations/20261011194301_pending_case_email_indexes.sql`. Apply only these reviewed files to TrackMyOPT project `deknauqkqqzwuvopqott` through the dashboard or an authorized migration tool. Follow [migration operations](SUPABASE_MIGRATIONS.md); never bulk replay the historical folder against production. Record the exact applied version in `supabase/production-history.json`.

The two Vercel Production enable flags and the Render API enrollment flag were configured on October 11. Render was saved without an early deploy; the new code and flags take effect on the main release. Deployment health is verified separately during delivery. After the migrations and successful production deployment:

| Setting | Where | Value/purpose |
| --- | --- | --- |
| `PENDING_CASE_EMAILS_ENABLED` | Vercel Production and Render TrackmyOPT API | `true` enables prospective enrollment; on web also permits cron sends and engagement |
| `CAMPAIGN_MARKETING_PROVIDER_APPROVED` | Vercel Production | `true`, based on the owner's written-provider-approval statement |
| Existing `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` | Vercel Production | Reuse the existing approved account and verified `@trackmyopt.com` sender |
| Optional complete `CAMPAIGN_SMTP_*` / `CAMPAIGN_FROM_EMAIL` | Vercel Production | Override only when all campaign credentials are configured; partial overrides fail closed |
| Existing `EMAIL_LINK_SIGNING_SECRET` or `ADMIN_SECRET` | Vercel Production | Server-only signatures with different purposes for monitoring and unsubscribe |
| Existing `CRON_SECRET`, live Stripe key, Supabase service key, durable Upstash limiter | Vercel Production | Authenticated cron, billing, database, and engagement protection |

A missing enable flag defaults off. Do not enable before the migration exists. Non-sensitive flags do not require changing SMTP credentials or customer marketing preferences. Production cron sends via one SMTP attempt per reservation, with a 100-candidate batch and a 240-second loop budget.

To pause new enrollment/sends, disable `PENDING_CASE_EMAILS_ENABLED` in both deployments. Never roll back by deleting campaign records: they enforce the cap and support unsubscribe. Keep the schema and existing unsubscribe endpoint. Never automatically retry `campaign_sending` or `campaign_unknown`; review SMTP acceptance and the current recipient manually. While enabled, old pending recovery messages are held instead of replayed by the transactional retry cron.

## Measurement

Use the existing paid Pro dashboard and Stripe reconciliation. `source=pending_case_email` now propagates through offer, checkout and verified paid-start attribution. Client offer/click events remain analytics-consent observed; server send/engagement events are operational markers. Neither implies all visitors were measured. New events have no historical backfill.

- `pending_case_promotion_sent`: SMTP accepted and the sent result persisted; `experiment=pending_case_v1`, `step=first|followup`. Acceptance is not proof of inbox delivery or reading.
- `pending_case_offer_engaged`: first eligible signed-in deliberate visit to the first message's offer. No open pixel or redirect-click metric qualifies the follow-up.
- `pro_paid_intro_started`: existing live Stripe-verified paid USD 0.99 Pro start. Reconcile Checkout/invoice/payment status, refunds and customer history before reporting revenue.
- `pending_case_email_sequences.unsubscribed_at`: first marketing-preference withdrawal in an enrolled account, including preference changes outside these emails. This is a guardrail, not proof which email caused an unsubscribe.

Compare all enrolled treatment versus holdout accounts, including nonsenders, over equally matured seven-day windows from `first_verified_at`; don't compare only clickers with all control users. Join verified billing outcomes privately by account, deduplicate sessions/invoices, and publish aggregate counts/rates only. Small samples are exploratory, not proof of uplift. Include daily consistency against two starts/day and 14/complete UTC week, opt-outs, support complaints, refunds, cancellation requests and matured first-renewal cohorts. Do not judge immature renewals as failures or count this attribution as incremental lift without the holdout comparison.

Read-only operational aggregate (no applicant data):

```sql
SELECT s.arm, count(*) AS enrolled,
  count(*) FILTER (WHERE q.status='sent') AS first_accepted,
  count(*) FILTER (WHERE s.engaged_at IS NOT NULL) AS engaged,
  count(*) FILTER (WHERE f.status='sent') AS followup_accepted,
  count(*) FILTER (WHERE s.unsubscribed_at IS NOT NULL) AS preference_withdrawals
FROM public.pending_case_email_sequences s
LEFT JOIN public.email_queue q ON q.id=s.first_message_id
LEFT JOIN public.email_queue f ON f.id=s.followup_message_id
GROUP BY s.arm;
```

## Validation and limitations

`node scripts/operations/test-pending-case-email-sequence.mjs` uses disposable Docker PostgreSQL 17 with synthetic affected-schema fixtures. It checks ownership, real grants/forced RLS, pending/action/failure boundaries, timer windows, deterministic holdout, duplicate sends, case/account deletion, and simultaneous workers competing with legacy checkout recovery. It never connects to production. Web unit tests cover provider approval, Stripe/database outages, revocation after reservation, purpose-bound tokens, ambiguous SMTP outcomes, signed-in ownership, scanner/page-load inactivity, unsubscribe and deliberate UI engagement. Playwright checks the real landing route and mobile overflow with a mocked verification endpoint.

The cron deliberately processes recipients sequentially to limit SMTP pressure and respect its time budget. React Doctor reports that intentional await-in-loop warning and the existing pricing-modal complexity warning. The changed React components score 91/100, with no regression from the earlier 90/100 check.

Unexpected errors use static privacy-safe messages through existing [Sentry](SENTRY.md) paths, including partial cron failures and worker enrollment failure. Expected ineligibility/invalid links/auth/rate limits are separate. No new paid monitoring, sampling or consent changes.

Local validation passed: 2,009 web tests, 333 API unit tests, API E2E, new Playwright flow checks, repository type checks, web/API lint, web/API builds, migration safety checks, and the synthetic PostgreSQL boundary/concurrency suite. Full required GitHub CI and production deployments remain release gates. GitGuardian incident 38110568 flagged the SMTP options test’s literal `synthetic` username/password; it was classified narrowly as a test credential. No working credentials were committed and no scanner or branch protection was disabled.

SMTP and database completion are separate. A crash or persistence failure after acceptance leaves a held reservation; it is deliberately not resent. A recipient can change eligibility after the final read while SMTP is in flight; the system cannot retract an accepted message. A successful send does not guarantee inbox delivery, USCIS availability, an estimate, or an immigration outcome.
