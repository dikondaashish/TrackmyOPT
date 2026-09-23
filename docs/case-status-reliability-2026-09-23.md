# Case-status reliability update — September 23, 2026

## Implemented

- Daily USCIS queue creation pages through both enrolled cases and premium profiles, in stable order. A failed page aborts queue creation rather than silently omitting users.
- Failed checks record a failure timestamp, not a successful-check timestamp. Successful worker checks clear previous failure state.
- Monitoring labels distinguish recent, delayed, failed and unconfirmed checks. The UI no longer invents a next-check time from the previous check.
- The I-765 premium clock uses explicit USCIS start evidence, rejects invalid/future dates, stops for evidence requests and notices of intent to deny, and restarts only after confirmed response receipt. Completed cases do not retain an overdue countdown. Dates remain estimates, not approval promises.
- Hero and countdown overdue totals share the same business-day result. Manual start-date validation also runs on the authenticated API route.
- USCIS events with no supplied date no longer inherit today's date or an unrelated prior event date. HTML in history descriptions is rendered as plain text.
- IOE identifies electronic processing, not a particular service center. It no longer selects an NBC comparison cohort.
- Regular and premium community cohorts remain separate. Stored reports are revalidated on read; future events and reversed stage dates cannot contribute approval durations. Paginated analytics fail closed instead of serving partial populations.
- Historical approval ranges are labeled as historical comparisons, not live queue positions or imminent decisions. Switching cases clears the previous case's analytics while the next request loads.
- The case page loads the signed-in user's saved OPT dates from the existing OPT calculator endpoint. It links back to OPT Dates and does not infer work authorization, employment or F-1 status from projected dates.
- Status explanations direct users to official notices instead of unsupported review/delivery promises.

No database migration or production-record cleanup is required. Existing partner data is preserved.

## Verification

Automated checks cover clock lifecycle, invalid dates, UTC/holiday boundaries, display copy, cohort separation, multi-page queues, failure timestamps, authenticated date updates, and saved-date loading/error/empty states. The isolated `apps/web/scripts/preview-case-status.mjs` fixture allows browser review without reading applicant data or writing to a live account.

Local validation: 1,304 web tests and 319 API tests passed; both production builds and TypeScript checks passed. Targeted lint passed with existing controller warnings. React Doctor remained 86/100 compared with the same pre-change files; complexity warnings remain. Browser fixtures were inspected in light and dark themes and at narrow content widths. These results do not certify a production deployment or email delivery.

Regulatory reference checked September 23, 2026: [8 CFR 106.4(e)–(f)](https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-106/section-106.4), displayed by eCFR as current through September 21, 2026. Regional/emergency office closures are not modeled; users must confirm the applicable date with USCIS.

## Remaining product work

- Verify deployed web and worker versions, next scheduled monitoring run, and actual email delivery separately from successful local tests or a Git push.
- Broader information-hierarchy redesign awaits the owner's design-context answer. Existing colors are preserved in this update.
- Add source freshness/coverage indicators and stronger partner deduplication before offering more granular comparisons or predictive models.
- Implement case-specific notice/deadline workflows and validated reminder delivery separately; saved OPT dates in this update are read-only, not a new reminder system.
- Do not claim an approval probability, exact USCIS queue rank, nationwide processing coverage, or competitor superiority without supporting evidence.
- The shared observed-federal-holiday table currently covers 2024–2028; maintain or replace it before displaying later-year clocks.
