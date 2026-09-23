# OPT Dates dashboard audit — 2026-09-22

Status: local implementation verified with synthetic data; **not deployed**. No real dates, jobs, reminder subscriptions, or database records changed. The user's original Chrome tab had an employment edit form open and was left untouched.

## Observed live defects

- Summary showed 51/150 unemployment days while Employment History showed 50/150.
- Initial EAD expiration was shown even with a started STEM extension.
- UTC parsing could shift a saved date when displayed or opened for editing.
- Different employment calculations had inconsistent inclusive endpoints, overlap handling, and STEM coverage.
- Sample reminder numbers looked like actual account deadlines.
- The employment save API swallowed database failures and could return success without saving.

These observations do not establish the user's correct legal unemployment count. Actual EAD dates, qualifying employment, and previously saved records must be confirmed; no existing records were automatically repaired.

## Implemented

- Kept Program End Date, optional DSO Recommendation Date, optional OPT Start Date, optional OPT EAD End Date, and STEM Extension Start Date. Also retained the existing separate STEM DSO recommendation field.
- Removed automatic copying between program/DSO dates and automatic replacement of the actual EAD expiration when changing OPT start.
- Shared inclusive calendar-day calculation, overlap merging, authorization clipping, and consistent OPT/STEM totals.
- Preserved calendar dates across timezone display/edit operations; refreshed today's date on focus and periodically.
- Future STEM dates do not prematurely change the initial 90-day limit. Exactly 90/150 is “limit reached,” not “exceeded.” Initial excess remains visible after STEM starts.
- Missing/failed history loads show unavailable/retry instead of fabricated zero-job counts.
- Active STEM shows a clearly labelled end estimate, not an expired initial EAD card.
- Historical initial filing deadline respects both program and DSO limits; potentially affected 2026 windows require DSO review.
- Static reminder copy is labelled “Example.”
- Employment API validates the whole request before any write: required employer/start, real dates, same-day employment allowed, end not before start. Insert/update failures return errors rather than false success. User ownership filters remain in place.

## Official sources and limits

- [Current 8 CFR 214.2(f)(10)–(11)](https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2): initial unemployment cap 90, cumulative STEM cap 150; initial DSO recommendation receipt window 30 days; STEM recommendation window 60 days; STEM starts after initial authorization and runs 24 months.
- [DHS final rule, 91 FR 44976, effective September 15, 2026](https://www.govinfo.gov/content/pkg/FR-2026-07-17/pdf/2026-14439.pdf): revised admission and filing provisions and transitional treatment. Current regulation contains a 30-day post-program filing limit, while historical rules used 60. Do not apply one rule universally without the relevant admission/filing facts.
- [ICE OPT policy guidance](https://www.ice.gov/doclib/sevis/pdf/opt_policy_guidance_042010.pdf): calendar-day unemployment counting during authorized OPT. Its old STEM duration/cap provisions are superseded by the current regulation.
- [DHS employment-date FAQ](https://studyinthestates.dhs.gov/sites/default/files/2015-10-02%20OPT%20Changes%20in%20December%202015%20FAQ_0.pdf): employment end date is the final employed day, not the first unemployed day.
- [USCIS NAFSA Fall 2024 Q&A](https://www.uscis.gov/sites/default/files/document/questions-and-answers/NAFSAFall2024RegionalConferences-USCISCurrentIssuesSessionQandA.pdf): STEM recommendation filing window correction to 60 days.

The application estimates dates; it does not adjudicate status, validate qualifying hours/employers, or query SEVIS. The new dashboard transition warning is conservative, not a completed product-wide legal rules migration.

## Verification

- Focused suite: **137 tests passed, 11 files**. Includes date arithmetic, dashboard components, initial/STEM API, employment API, runway consumers, and mocked reminder synchronization.
- Calendar audit plus employment helper tests: **24 passed per timezone**, in New York, Los Angeles, London, and Kolkata. Each run includes 250 deterministic scenarios checked against an independent day-by-day oracle.
- TypeScript: passed.
- Targeted ESLint on calculation/dashboard changes: zero errors, six warnings (effects/legacy `any` usage).
- Additional employment API/checklist lint: zero errors, three existing-style `any` catch warnings.
- Full web suite before the final 18 employment-route tests were added: **1,122 passed, 9 failed** across 198 files. Failures are in extension guided-autopilot (3), repeatable-record-engine (1), resume-attachment (4), and screening-review-widget-ui (1). Those implementations were not changed in this audit; this is not a claim that the whole working tree is green.
- React Doctor across the existing dirty working tree: 49/100, with issues extending outside this scope. Not a clean release certification.

Chrome used the actual dashboard components in `apps/web/scripts/preview-opt-dates-audit.mjs`, with synthetic data, a fixed date, and network disabled. Verified:

1. Header and Employment History agree: synthetic STEM scenario is 49/150, 386 employed, longest gap 48, current streak 134.
2. Editing employment preserves its original calendar date.
3. Changing OPT start leaves the actual EAD end unchanged; saving mock dates updates both counters.
4. Future STEM keeps the 90-day initial cap.
5. Overlapping jobs do not double count; 20 employed + 2 unemployed across 22 authorized days.
6. Failed history load displays unavailable; retry restores counts.
7. A 2026 filing scenario displays DSO review needed; all original fields and labelled reminder examples remain visible.

These are UI/mock API checks, not production database-write or real email-delivery tests.

## Release gates and remaining work

- Review and deploy only intended changes; the workspace contains substantial unrelated work. No commit, push, migration, or production deployment was performed here.
- Have the owner/DSO/legal reviewer confirm the current filing-rule transition and extend it consistently to the other OPT tools, extension and email consumers. They still contain historical assumptions.
- A STEM end calculated from start alone remains an estimate; actual EAD verification is required.
- Employment batch writes are not transactional. A storage failure after an earlier successful row returns an error that instructs the user to reload before retrying. Adding transactional/idempotent bulk writes requires separate work.
- Review historical records against source documents if they may have been saved after a timezone-shifted edit; do not silently rewrite user history.
- Resolve the nine separate extension test failures and broader static-analysis findings before calling the entire product release-ready.
