# October 2026 growth recovery plan

Reviewed October 10, 2026. This plan follows the signed-in Search Console and PostHog investigation and the content corrections in this change. Targets below are operating goals, not forecasts or guarantees.

## What to grow

Prioritize students who need to check an OPT/STEM application, understand their work-authorization dates, or prepare their next job application. Measure a useful product outcome after signup. Monthly bulletin traffic is helpful, but it is seasonal and should not be the only acquisition source.

Search Console, September 30–October 6 versus September 23–29:

| Measure | Previous | Current |
| --- | ---: | ---: |
| Google clicks, whole property | 2,573 | 2,139 |
| Impressions, whole property | 111,849 | 95,450 |
| Average position | 6.2 | 6.1 |
| OPT processing guide clicks | 521 | 410 |
| STEM processing guide clicks | 320 | 197 |
| STEM guide CTR | 8.63% | 5.49% |
| October bulletin clicks | 222 | 6 |
| November outlook clicks | 90 | 187 |

Page totals and property totals are not precisely additive. Average position mixes queries and devices; it cannot establish that every important query held its rank. Mobile clicks fell 25.5%, compared with 8.4% on desktop, so review mobile separately.

Query evidence from the same export:

| Query | Previous clicks | Current clicks | Next decision |
| --- | ---: | ---: | --- |
| opt tracker | 202 | 187 | Protect the high-intent tool/feature route; CTR actually improved |
| stem opt processing time | 63 | 27 | Review query-specific snippets and position, not just the page average |
| stem opt processing time 2026 | 30 | 20 | Refresh the existing guide and compare the same query after recrawl |
| stem opt timeline | 24 | 12 | Link the guide clearly to the existing tool |
| stem opt tracker | 20 | 26 | Support this growing intent with existing STEM-capable tools |
| stem opt premium processing fee | 3 | 8 | Maintain correct fee and eligibility guidance; avoid duplicate articles |

The generic STEM processing query moved from position 4.14 to 4.86 and CTR 19.21% to 8.82%. This is a real query-level deterioration even though the page-wide average position improved. Do not attribute everything to AI answers or to a sitewide penalty.

## First four weeks after deployment

| Timing | Priority | Action | Success measure |
| --- | --- | --- | --- |
| Days 1–3 | Verify discovery | Check production HTML, canonicals, FAQs, modification dates, main sitemap, and Search Console URL inspection for the four refreshed articles and decision-window tool. Request indexing only after the updated page is live. | Correct rendered content; last crawl advances; valid indexability |
| Days 1–7 | Establish the new funnel baseline | Use existing events to separate blog entry, product click, tool result, signup, first receipt, and activation. Split OPT/STEM and mobile/desktop. | Counts and rates with explicit denominators; no duplicated signup event |
| Days 7–14 | Review search response | Compare complete seven-day windows after Google recrawls; use page + query + device, with a 28-day trend alongside. | STEM guide CTR moves toward a provisional 6.5% at a comparable query/position mix; monitor useful traffic and conversion |
| Days 14–28 | Improve the largest remaining drop-off | Choose one change based on evidence: a clearer result-to-save action, more useful no-estimate state, or a source-specific title/description refinement. | More activated users per 100 measured organic landing visitors; watch lookup errors and signup conversion |
| At the next bulletin release | Prevent repeated decay | Refresh the existing November URL with official dates, update sources/FAQ/schema/review date, and link from October. Keep predictions clearly dated until publication. | No stale “not published” claim after the editorial refresh; track the new month separately |

Do not promise recovery of October’s 216 lost weekly clicks: that page’s monthly demand is expiring. A more durable priority is the two processing guides, which lost 234 clicks combined. At unchanged STEM impressions (3,586), a 6.5% CTR would mean about 233 clicks instead of 197—roughly 36 additional weekly clicks. This is sensitivity arithmetic, not a traffic forecast, and changes in query mix can invalidate the comparison.

## Funnel definitions

The [existing Blog → Signup dashboard](https://us.posthog.com/project/369087/dashboard/1802603) and [saved funnel](https://us.posthog.com/project/369087/insights/sztU304L) showed 624 CTA clickers and 168 subsequent signups (26.92%) for July 12–October 10, 2026. Its description specifies a 14-day ordered conversion window. This is a historical, consent-observed funnel; it is not a visitor-to-signup rate, a new-tool experiment result, or proof of incremental revenue. Recent entrants have not had a full 14 days to convert.

Use the existing [event taxonomy](../apps/web/lib/posthog/event-taxonomy.md):

1. `$pageview`: organic landing visit to an intended blog or tool page.
2. `blog_product_cta_clicked`: `variant = case-status`; break down by `source_page`. Exclude the separate `features-link` variant when measuring the guest-tool route.
3. `opt_decision_window_viewed`: successful result; split `has_estimate = true/false` and `case_kind`. A result with insufficient cohort data is not a technical error.
4. `opt_decision_window_cta`: click to continue into account-based tracking.
5. `user_signed_up`: new account, with identity stitching and duplicate capture checked before calculating the rate.
6. `receipt_added`, then `activation_completed` (the October 10 audit found that `is_first_receipt` is not emitted; do not filter on it): useful case-tracking outcome. Use a fixed seven-day signup-to-activation window.

Primary growth measure: unique new users who reach an activation outcome each week. For the case-status acquisition route, also measure activated users per 100 consent-observed organic entrants. Keep total server-side signups separate from the consent-limited client funnel. Do not divide all server signups by the smaller PostHog visitor count and label it overall conversion.

Guardrails: tool failure rate (`opt_decision_window_failed`), usable-result share, mobile engagement, support complaints, and paid conversion after activation. Do not change consent behavior to improve the apparent visitor count. Do not judge the new route by login pageviews alone.

## Sustainable acquisition after recovery

1. **Maintain a small set of strong guides.** Assign each search intent one primary URL: processing time, pending EAD action steps, premium processing, STEM continuation, and unemployment calculation. Update the existing pages when official facts change. New posts should answer a distinct need rather than repeat the same query.
2. **Let useful tools earn repeat visits.** Route processing readers to the decision-window tool, unemployment readers to the clock, and job-search readers to the sponsor/resume tools. Make limits and sample sizes visible. Expand features only after the funnel shows where users cannot complete the task.
3. **Publish original evidence only when defensible.** A future aggregate processing report should disclose opt-in data coverage, sample size, collection dates, category, percentiles, and selection bias. Suppress small groups and never expose receipt numbers or applicant records. Until then, cite official estimates instead of claiming proprietary medians.
4. **Build distribution around demonstrated utility.** Prepare a short resource pack for university international offices and student organizations: sourced guides, free tool, and a clear explanation of limitations. Outreach and publication are separate future actions; this revision sends no messages. Judge a small pilot by activated users from tagged links before expanding it.
5. **Review freshness weekly and at official releases.** Use Search Console to prioritize high-impression pages losing clicks; read official sources before changing facts. Keep original publish dates, add real modification dates, and avoid turning old posts into “new” Google News entries.

## Source and quality notes

The weakest content dimensions in the original pages were trust and referenceability: contradictory premium-processing answers, unsupported timelines, and a publication-status note left unchanged after release. This revision focuses on those weaknesses before adding content volume.

- [Official October 2026 Visa Bulletin](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-october-2026.html)
- [Official bulletin index](https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html)
- [USCIS premium-processing eligibility announcement](https://content.govdelivery.com/accounts/USDHSCIS/bulletins/34cf6fc)
- [8 CFR 106.4: fees, clock and adjudicative actions](https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-106/section-106.4)
- [USC Office of International Services: STEM extension](https://ois.usc.edu/employment/stem-opt-extension/)

Editorial checks: direct answers match intent; claims map to sources; visible FAQs and JSON-LD use the same arrays; original URLs and publication dates remain; review dates reflect substantive edits; internal links point to existing routes. No invented approval average, guaranteed ranking increase, or attorney-review claim is added.

Google explicitly permits an empty news sitemap when no articles fall within the two-day window ([official guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)). Keep original publication dates; no sitemap workaround is required. A daily heartbeat now checks the November release and performs weekly growth reviews through November 7, notifying only on meaningful changes or blockers.

## Paid Pro conversion improvements — October 10

The owner's primary business target is **two successful USD $0.99 seven-day Pro starts each day** (14 per complete week). Free registrations remain a leading indicator. The owner's report of approximately one paid start weekly is not a reconciled Stripe baseline; earlier PostHog billing events missed some paid introductions. New events begin after this deployment, with no historical backfill.

The September 12–October 9 audit found 397 signups, 77 ordered seven-day activations and five subsequent checkout starters. Separately, 11 unique people started checkout; eight chose annual and three monthly. The six client `premium_checkout_completed` events are return-page signals, not independently verified payment counts. These denominators differ, and recent cohorts are immature.

Measurement rules:

- Use complete **UTC days**, matching the PostHog project timezone. Daily unique people with `pro_paid_intro_started` are the target measure. A weekly total of 14 does not prove every individual day reached two.
- Offer → click → checkout → verified start uses a seven-day ordered window. The offer events cover modal flows; standalone pricing-page visits are not the same denominator. Client steps require analytics consent. `source` is the allowlisted product surface, not a marketing channel or arbitrary URL.
- Intro → first paid renewal uses a 21-day window to allow payment retries. Review fully matured cohorts separately; do not divide all renewals by this week's starts. The first renewal is identified by its billing period beginning at Stripe's introductory `trial_end`, not webhook arrival time.
- Cancellation requests are captured when introductory Pro customers disable renewal; `during_intro` distinguishes requests during the seven-day period. Terminal `subscription_canceled` remains a separate event. Refund guardrails include subscription refunds across plans and partial/full refunds; amounts are cumulative per charge and must not be summed across partial-refund events.
- Analytics delivery remains best effort and must not block access. A temporary invoice/API or capture failure may leave measurement incomplete. Reconcile the paid-start count with Stripe in each weekly review before making a commercial decision. No analytics event is an entitlement authority.
- The new dashboard is expected to be empty until deployment and real purchases. Historical zeros indicate absent instrumentation, not zero business revenue. Do not create synthetic production purchases to populate it.

Review after seven complete days: compare eligible offer exposure, consent-observed click-through, checkout success, paid starts and cancellation requests by product source and billing interval. Review renewal after cohorts mature. Choose the next change from the largest observed loss and actual monitoring failures. This implementation cannot guarantee two paid starts daily.

Authoritative implementation references: [PostHog event deduplication](https://posthog.com/docs/data/events), [Stripe Checkout fulfillment](https://docs.stripe.com/checkout/fulfillment), and [Stripe invoice fields](https://docs.stripe.com/api/invoices/object).
