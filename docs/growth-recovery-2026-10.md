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

## Changes delivered in this revision

- Replaced the October bulletin prediction text with published India EB-1/EB-2/EB-3 final-action and filing dates, examples, official sources, and updated FAQs.
- Refreshed the November outlook using October’s published baseline; removed unsourced traffic and analyst claims. The official index still says the upcoming bulletin is coming soon as of October 10.
- Corrected OPT and STEM premium-processing eligibility, fee, business-day clock, and the distinction between adjudicative action and EAD delivery.
- Removed unsupported fixed approval ranges, biometrics countdowns, online-filing speed claims, and an unsubstantiated student-data median.
- Added official-estimate instructions, practical delay steps, section navigation, relevant internal links, synchronized visible/structured FAQs, and honest review dates.
- Made updated dates visible on research articles while preserving original publication dates.
- Clarified the existing case-status CTA: free estimate, no account required, and sufficient comparable cases needed. Kept its existing consent-aware event and destination.

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

## Validation of this revision

Validated from a clean checkout with the same dependency lockfile and exact copies of the changed files because reads from the original dependency directory stalled. No production secrets were copied.

- Targeted ESLint passed.
- TypeScript check passed.
- Four SEO/schema/indexing test files passed: 17 tests.
- Production build and template-preview checks passed with the repository CI’s non-secret placeholder environment.
- React Doctor reported no issues in the six changed source files (89/100, improved from 88 before fixing the navigation labels).
- Generated HTML for all four refreshed articles has one H1, the existing self-canonical, a real October 10 modification date, and matching visible/structured FAQs. Search titles are 51–58 characters.
- Internal links and section anchors in the processing guides resolve to existing routes/sections.
- Browser preview confirmed the STEM guide renders and its “Check my wait” CTA opens the guest tool with both OPT and STEM options. This checks navigation, not a live database estimate.

Passing local checks does not establish completed GitHub CI, production deployment, Google recrawling, or traffic recovery.


## October 10 operational follow-through

- Verified the previous content commit deployed successfully through Vercel. All four refreshed URLs return HTTP 200, include the October 10 modification date and one H1. All four plus the guest tool appear in the 247-URL production sitemap.
- Google Search Console confirmed both processing guides are indexed; requested recrawling successfully for OPT and STEM. The STEM crawl before the request was October 10 at 3:05 AM, using smartphone Googlebot, with successful fetch, indexing allowed, and matching canonical. Browser access became unavailable during the October bulletin inspection; October, November and guest-tool inspections/requests remain pending for the follow-up.
- Created the [growth recovery dashboard](https://us.posthog.com/project/369087/dashboard/2195103) with eight validated insights. Its reviewable configuration is [stored here](analytics/growth-recovery-dashboard.json). Guest-route funnels start October 5, when the route launched, avoiding a misleading denominator from earlier CTA destinations. Other reports use 28 complete days. SQL guardrails include all actors; funnel queries exclude configured test accounts.
- October 5–9 guest funnel: 26 case-status CTA clickers → 20 result viewers → 9 tracking clicks → 2 signups. These are ordered unique-person counts, not the independent event totals. The seven-day window is immature and the sample is small.
- September 12–October 9 signup funnel: 397 → 267 receipt additions → 77 activations. The missing first-receipt property must not be interpreted as zero receipts. This counts any receipt addition after signup and client-observed activation, with recent cohorts still immature.
- Signup audit: 397 events, 397 people, zero repeated signup people. Google supplied 390 server captures and email supplied seven client captures. This is not proof that all real signups are recorded.
- Added network/response failure capture to the guest lookup guardrail without sending dates, receipt prefixes, error messages or request URLs. API errors retain HTTP status. Insufficient-cohort results remain successful responses.
- Prepared the [campus resource pack](university-resource-pack.md), tagged links, draft introduction and a five-contact pilot outline. No outreach has been sent; recipients still need to be identified.
- Repaired three stale CI test fixtures: real NextRequest in the guest route test, ResizeObserver/width simulation for consent-gated ads, and the current case-insight button label. Added narrow-container and guest outcome checks.

The next product decision should follow matured cohorts: the initial guest path loses more people between result and signup than between CTA and result. Inspect result-to-account usability before adding more articles. The sample is too small to select a winning variant yet.

Follow-through validation: all 278 test files passed (1,672 tests); targeted ESLint passed; React Doctor found no issues (89/100). The original five CI failures are covered by the repaired fixtures. Dashboard API readback confirmed eight saved tiles; each query executed successfully before saving. Local documentation links and dashboard JSON were validated.
TypeScript and the production build also passed in the clean validation checkout with non-secret CI placeholder environment values.
