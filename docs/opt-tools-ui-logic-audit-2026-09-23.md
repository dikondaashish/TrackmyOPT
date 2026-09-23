# OPT tools UI and calculation audit — September 23, 2026

## Scope

The four public and dashboard OPT Apply, OPT Clock, STEM Apply, and STEM Clock
tools now share their layout and date-saving behavior. Existing color families
are retained: blue/indigo, amber/orange, emerald/teal, and purple/violet.
Semantic warning and critical colors are unchanged.

## Changes

- Compact headers, four-tool navigation, responsive inputs/results, collapsible
  guidance, and smaller reminder settings replace oversized duplicate panels.
- Explicit unsaved-preview, save-success, error, loading, guest, and retry states.
  Only edited date fields are posted; changing a start date does not overwrite
  the EAD end or manufacture a DSO recommendation date.
- Shared inclusive calendar-day unemployment calculations merge overlapping jobs,
  exclude future days, and use the dashboard's combined initial/STEM allowance.
  Initial-period overages remain visible. Failed history loads do not become
  empty-history counts, and empty history requires confirmation.
- Filing calculations consider the actual SEVIS recommendation, validate calendar
  dates, and flag incompatible windows. The initial-OPT September 2026 transition
  remains DSO-review-only; the historical estimate is not labeled a confirmed
  current deadline. No claim of eligibility or approval is made.
- The calendar no longer rolls invalid dates into another month. Escape and date
  selection return focus to the input, errors are associated with inputs, and the
  narrow calendar grid does not force horizontal scrolling.
- Approval insights no longer generate baseline durations or recent reports.
  The bounded sample separates explicitly confirmed initial/STEM categories,
  excludes known premium-processing cases, requires receipt and recorded approval
  dates, deduplicates receipt numbers, and suppresses cohorts below five users.
  The displayed metric is correctly labeled a median, not an average.

## Evidence

- Web suite: 206 test files, 1,253 passing tests.
- Date helper suite: 18 tests passed separately under America/New_York,
  America/Los_Angeles, Europe/London, and Asia/Kolkata.
- TypeScript and optimized Next.js webpack production build passed.
- Changed TypeScript/TSX files: ESLint passed without errors or warnings.
- React Doctor changed-files audit: 88/100; five remaining advisory warnings
  concern component complexity and effect-based fetching. Fetch effects use
  cancellation/abort guards; date loading also guards newer edits. No suppression
  or dependency changes were introduced.
- In-app browser synthetic preview: all four tools opened; 375, 768, 1024, and
  1440 CSS-pixel viewport checks showed no document horizontal overflow. Checked
  dark mode, mobile calendar, date selection, invalid-date suppression, synthetic
  date saving, reminder save/stop, and incompatible STEM-start validation.
- Read-only Supabase query using the production projection/filter/order succeeded.
  Only a count was returned; no personal rows were printed or changed.

Browser fixture: from `apps/web`, run `node scripts/preview-opt-tools.mjs`.
It bundles the real UI with synthetic fetch responses, blocks external network
requests, binds to loopback port 4317, and resets synthetic data on reload.
Use `?tool=stem-clock`, the other tool slugs, `&guest`, or `&dark`.
It is not an end-to-end production account or email-delivery test.

## Sources and limits

- [8 CFR 214.2(f)](https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-214/subpart-A/section-214.2#p-214.2(f))
- [2026 duration-of-admission final rule](https://www.govinfo.gov/content/pkg/FR-2026-07-17/pdf/2026-14439.pdf)
- [8 CFR 274a.12(b)(6)(iv)](https://www.ecfr.gov/current/title-8/chapter-I/subchapter-B/part-274a/subpart-B/section-274a.12#p-274a.12(b)(6)(iv))
- [Official USCIS processing times](https://egov.uscis.gov/processing-times/)

These are planning tools, not legal determinations. Applicable transition rules,
I-94 treatment, qualifying employment, and actual EAD dates require DSO review.
Recorded case histories are not independently verified adjudication data;
unreported premium processing and incomplete records may affect the sample.
Statistics are cached for up to an hour, with an API stale-while-revalidate window.
No schema migration, production profile change, reminder send, or billing change
was performed. A successful Git push does not establish deployment health.
