# Sign-up to paid: diagnosis and Phase 1 (2026-11-18)

Sign-ups are healthy but almost none become paying users. This records what
the data showed, what Phase 1 changed, and how to judge it.

## What the data showed

Sources: Supabase (accounts, cases, emails), Stripe (subscriptions, charges),
PostHog (events). Browser events only cover visitors who accepted analytics,
so those counts are a floor; Stripe and database counts are exact.

Last 60 days (to 2026-11-18):

| Step | People |
| --- | --- |
| Signed up | 739 |
| Added a USCIS receipt | 567 |
| Saw the Pro offer | about 300 |
| Pressed the pay button | 5 |
| Paid anything | 8 |

All time: 2,775 accounts, 72 subscriptions started, about 21 paying.
Revenue: $237 in September, $33 in October, $17 in November to the 18th.

Three leaks:

1. **The offer.** Free already shows the status and every community
   wait-time chart; Pro adds daily checks and an email. The offer opened
   seconds after the receipt was saved (most offer views came from that
   moment), and its button stayed disabled until a consent box was ticked.
2. **No return path.** 79% of new sign-ups opened the dashboard on one day
   only. 324 Free accounts had a status change in 30 days and none was told.
   The October promotional sequence sent nothing because it needs a marketing
   opt-in almost nobody has given.
3. **Trials cancelled before a full charge.** 44 of 72 subscriptions were
   cancelled during the introduction, 15 within the first hour. Annual Pro:
   29 started, 4 kept. Monthly Pro: 37 started, 18 passed the introduction.

## What Phase 1 changed

| Change | Where |
| --- | --- |
| Free accounts get a "your case has an update" email when a scheduled check finds a new status. It carries no status and no receipt number, and has a signed "Stop case emails" link. One per account per 20 hours. Pause with `FREE_CASE_UPDATE_EMAILS=false`. | `lib/notifications/transactional/case-updates.ts`, `app/api/case-status/check/route.ts`, `app/api/email/case-updates/unsubscribe` |
| The upgrade pop-up no longer opens right after a receipt is saved. It waits for a return visit (case saved at least 20 hours ago). The always-visible upgrade strip is unchanged. | `lib/case-status/free-case-insight-prompt.ts`, `useCaseInsightPrompt.ts` |
| Pay buttons are always clickable. Pressing one without the consent box ticked shows "Tick the box above to continue" and focuses the box. Checkout still cannot start without consent. | `PricingModalPlanCard.tsx`, `CaseMonitoringOffer.tsx` |
| Day-3 email for accounts on the paid Pro introduction: checks run, changes recorded, setup steps. | `lib/billing/trial-progress.ts`, `/api/cron/trial-progress-emails` |
| The weekly case summary is open to Free accounts as an opt-in. Free accounts get their last revealed status and a flag when a newer one is waiting, never the new status itself. | `lib/case-status/digest.ts`, `send-case-digests`, `WeeklyDigestSettings.tsx` |

Not changed: prices, the annual-preselected plan comparison restored on
2026-11-05, and what Free and Pro include. Trial starts per plan do not show
that a monthly default earns more per start, so that default was left alone.

## How to judge it

Compare the four weeks after release with the 60 days above.

| Measure | Before | Source |
| --- | --- | --- |
| Free accounts emailed about a change | 0 | `email_queue` type `free_case_update`; PostHog `free_case_update_email_sent` |
| Return visits that see the change banner | 2 people in 40 days | PostHog `upgrade_prompt_shown`, trigger `status_change_wedge` |
| Offer viewers who press pay | under 2% | `pro_offer_clicked` ÷ `pro_offer_viewed` |
| Pay presses blocked by the consent box | not measured | `pro_offer_consent_prompted` |
| Subscriptions that reach a full charge | about 1 in 4 | Stripe subscriptions and charges |
| New paid starts per month | 2–3 | Stripe |

## Still open

- Phase 2: put the personal decision window and "my case is late" help in
  Pro, and test a one-time Case Pass against the subscription.
- Phase 3: move approved users to the unemployment clock and job tools.
- The first-visit NPS prompt still opens right after the first status
  resolves.
