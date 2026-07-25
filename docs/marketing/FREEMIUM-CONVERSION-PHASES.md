# Freemium conversion — pending measurement only

The implementation and Day 0 deployment are complete. PR #24 was merged at
`1f4224d`; production was Ready; four Vercel crons were registered; public and
authenticated pricing/checkout smoke tests passed. The completed build phases
were removed from this document.

## Recorded Day 0 state

- Dedicated is unavailable for new purchase.
- PricingModal defaults Pro to annual billing.
- Pricing/checkout copy shows the 7-day Pro trial where eligible.
- Cancelled checkout returns to the annual modal.
- Success countdown lands on `/dashboard/case-status`.
- Trial-specific success was verified by source/tests, not by creating a real
  Stripe trial subscription.
- Day 0 PostHog baseline: USCIS/case-status exceptions **0 events / 0 people**.
- Day 0 DAU baseline: **55.9/day**.
- Stripe active + trialing baseline: **13**.

Do not create live charges or a real subscription for measurement.

## Day 1 — after 2026-07-26 14:00 UTC

- [ ] Query free profiles joined to `case_status`; free users'
  `last_checked_at` must not move in the overnight window.
- [ ] Confirm premium cases refreshed in that window.
- [ ] Confirm `/uscis/check-all` or cron/API logs report `skippedFree > 0` and
  the queued premium count is plausible.
- [ ] Compare case-status/USCIS `$exception` volume with the Day 0 0/0
  baseline.
- [ ] If errors spike, propose a rate limit on manual refresh. Do not revert the
  premium-only automatic gate.

## Event health — daily through 2026-08-01

Record only observed values. An event with no eligible trigger is not a failure.

- [ ] `checkout_recovery_email_sent`
- [ ] `trial_converted`
- [ ] `pwa_installed`
- [ ] `subscription_canceled` with `cancel_feedback`
- [ ] `checkout_started` originates from server checkout creation with no
  client duplicate for the same Stripe session

## Day 7 — 2026-08-01

Use unique persons and filter test accounts.

| Metric | Target / interpretation | Day 7 |
|--------|-------------------------|-------|
| Upgrade prompt → checkout started | ≥15% | _pending_ |
| Signup → `dashboard_viewed` | ≥50%; explain extension-only cohort if short | _pending_ |
| Signup → `receipt_added` within 7 days | ≥30% | _pending_ |
| Checkout → payment, same person and ordered | ≥40% when payments occur | _pending_ |
| Failed / (succeeded + failed) unique payers | Trending down | _pending_ |
| Stripe active + trialing | Up from 13 | _pending_ |
| Cancellation reason `unused` | Share declining | _pending_ |
| DAU | Compare with 55.9/day | _pending_ |

## Day 30 — 2026-08-24

- [ ] Rerun every Day 7 metric with the same definitions.
- [ ] Record whether each target passed, failed, or lacked enough volume.
- [ ] Record the final keep/soften decision.

**Kill criterion:** if DAU drops sharply **and** checkout does not improve,
recommend free automatic case checks every three days. Do not fully revert the
gate.

## Checkpoint log

| Date/time UTC | Checkpoint | Evidence-backed result | Decision / follow-up |
|---------------|------------|------------------------|----------------------|
| 2026-07-25 | Day 0 deploy and smoke | Passed; baselines recorded above | Await Day 1 cron |
| _pending_ | Day 1 gate + event health |  |  |
| _pending_ | Day 7 metrics |  |  |
| _pending_ | Day 30 metrics |  |  |
