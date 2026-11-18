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

1. **The offer.** The offer sold daily checks and an email, which USCIS
   also gives for free. It opened seconds after the receipt was saved (most
   offer views came from that moment), and its button stayed disabled until a
   consent box was ticked. From 2026-10-12 (#73) the whole wait-comparison
   section was hidden on Free, so the case page showed nothing of what Pro
   adds. An earlier version of this note said Free already saw every
   wait-time chart; that was wrong and is corrected here.
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

## What Phase 2 changed

| Change | Where |
| --- | --- |
| Free accounts see the typical wait for a case like theirs and the typical stage timings, plus a description of each Pro comparison with an unlock button. The server sends Free nothing that places the case inside the distribution. | `app/api/case-status/community-estimate`, `CaseStatusSection.tsx`, `CommunitySummaryCard.tsx` |
| Late-case help. A pending OPT or STEM OPT case past the typical wait gets the steps in order (USCIS inquiry date, case inquiry, premium processing, congressional inquiry, CIS Ombudsman, DSO) with official links and text to adapt. Pro gets the content; Free sees the step titles and an unlock button. | `lib/case-status/late-case-help.ts`, `panels/LateCaseHelp.tsx` |
| Plan feature lists name these Pro features and call the Free one "Typical OPT Approval Wait". | `lib/pricing/plan-features.ts` |

New measures: `upgrade_prompt_shown` with trigger `locked_comparison` or
`late_case_help`, and `late_case_help_shown` (`plan_tier`, `level`).

The late-case steps were checked against uscis.gov and dhs.gov on
2026-11-18. Recheck them when USCIS changes its inquiry or premium rules.

## Case Pass

Owner decision, 2026-11-18: $9.99 once for Pro for 180 days, no renewal, no
refunds. It is offered under the plan comparison and on the pricing page,
next to the subscription, to accounts without paid access.

| Part | Where |
| --- | --- |
| Price and term | `CASE_PASS` in `lib/pricing/plan-config.ts`. Checkout builds the Stripe price inline, so there is no Stripe Price or environment variable. |
| Checkout | `POST /api/premium/case-pass/checkout`: one-time Stripe Checkout, consent recorded as `case_pass_checkout_consent`. Refused for accounts that already have paid access. |
| Access | `applyStripeCheckoutSession` grants Pro until 180 days after the purchase and records the payment with `plan_id = case_pass`. |
| Protection | Subscription code revokes access when Stripe has no active subscription. `reconcileCustomerBilling` and `/api/premium/status` call `restoreCasePassAccess` first, so a running pass survives a cancelled or expired subscription. A fully refunded pass is marked `refunded` and stops counting. |
| Display | Settings show "Case Pass", the end date and no cancel card. Refund Policy and Terms state that it does not renew and is not refundable. |

Measures: `case_pass_offer_viewed`, `case_pass_consent_prompted`,
`case_pass_offer_clicked` (client), `checkout_started` with
`plan_id = case_pass` and `case_pass_purchased` (server), and Stripe
one-time payments of $9.99. Compare pass purchases with new subscriptions
per month, and watch refund requests and disputes.

Not built: a reminder before a pass ends, and a way to buy a pass on top of
a running subscription.

## What Phase 3 changed

On 2026-11-18, 1,453 accounts had an approved case. 217 had saved EAD dates,
49 had recorded a job, 13 had a resume and 4 had a job application. The case
page went quiet at approval.

| Change | Where |
| --- | --- |
| After-approval steps on the case page for OPT and STEM OPT: save the EAD dates, open the unemployment clock (90 or 150 days), add the job, see verified jobs, check the STEM window. Free on every plan, with "done" marks for saved dates and employment. | `lib/case-status/after-approval.ts`, `panels/AfterApprovalSteps.tsx` |
| The dashboard "Next step" card sends an approved OPT case to those steps on every plan. | `lib/dashboard/resolve-dashboard-next-step.ts` |
| The recommendation question is asked when someone views an approved case. It is no longer asked seconds after the first status loads at sign-up, where 339 people saw it in 60 days and 6 answered. | `nps-survey.ts`, `OnboardingWizard.tsx`, `useCaseStatusController.ts` |
| A score of 9 or 10 gets a second card: copy a link to share, or send a story by email. The case page also has a "send them the free tracker" link. No reward is attached. | `NpsSurvey.tsx` |

Measures: `after_approval_steps_shown`, `after_approval_step_clicked`
(`step`), `nps_shown` with trigger `case_approved_viewed`,
`nps_promoter_followup_shown`, `share_link_copied` (`source`),
`testimonial_email_opened`, visits with `utm_campaign=after_approval`, and
the share of approved accounts with saved EAD dates and a recorded job.

Not done, and why:

- No email to the accounts already approved. That is a marketing send and
  needs the opt-in.
- No referral reward. The `referrals` table is for partner codes.
- The Pro status email does not mention the steps, because it does not know
  whether the case is an OPT filing.

## Still open

- A reminder before a Case Pass ends.
- Stories arrive by email; publishing one is a manual step.
- The first-visit NPS prompt still opens right after the first status
  resolves.
