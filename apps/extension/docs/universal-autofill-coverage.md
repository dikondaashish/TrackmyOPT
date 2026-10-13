# Universal autofill — coverage and test evidence

Recorded 2026-10-11 for the universal-autofill work (branch
`feat/universal-autofill`). This is local implementation and test evidence. It
is **not** a Chrome Web Store release, and it does not certify every
employer's customised application flow.

## What a "Prefill this application" click does now

1. Attaches this job's generated resume (and cover letter) when one exists,
   and waits for the portal's own upload confirmation where the adapter knows it.
2. Fills work-history and education rows from the verified resume snapshot,
   adding rows through a unique Add / Add another / + button (also from zero
   rows), and selecting history dropdowns (Workday listbox buttons, React
   Select, typeahead schools) with one exact option or not at all.
3. Fills profile fields in bounded passes: a dropdown choice that reveals or
   enables more fields (country → state → city, "Yes" → follow-up) is followed
   by another pass once the DOM settles (at most three passes per click).
4. Reports one line: `33 fields filled · 4 experience records · 2 education
   records · 6 dropdowns selected · 2 need attention`, a per-field list with
   **Fix** for values the site marks invalid (with the site's own message), and
   a button that steps through every field needing attention.
5. Never submits, never clicks Next/Save and Continue, never touches CAPTCHA,
   never answers work-authorization, visa/sponsorship, salary, demographic,
   disability or veteran questions without an explicit saved private answer.

## Portal coverage matrix

Legend — **E2E**: the real built extension in Chromium, clicking the widget's
own Prefill button on a portal-shaped page served at the portal's real hostname
(`scripts/test-autofill-browser.mjs`). **Live dry run**: the extension's own
recognition code run read-only on a real public application page
(`scripts/audit-live-portals.mjs`; nothing typed, uploaded or submitted).

| Portal | Script loads | Adapter | E2E (real extension) | Live dry run | Status |
|---|---|---|---|---|---|
| Custom company career sites | path patterns (`/careers/…`, `/…/apply…`, …) | generic | PASS — 33 fields, 4 experience + 2 education records, phone code, country→state→city, degree by level, resume | Workable (Hugging Face): 6 fields correct, salary left | **Supported**; non-English or root-only paths do not load the script |
| Workday | `*.myworkdayjobs.com`, `*.myworkday.com`, `*.myworkdaysite.com` (added) | workday | PASS — My Experience step from zero rows: 4 work + 2 education cards, Month/Year parts, "I currently work here", degree listbox, verified upload | not run — applying requires a Workday candidate account | **Supported on fixtures; live unverified** |
| Greenhouse (boards / job-boards) | `*.greenhouse.io` | greenhouse | PASS — contact, location typeahead (Dallas, **Texas** among Dallas, GA / Dallastown), current company, sponsorship & gender left blank, verified upload | Anthropic: 7 fields correct incl. phone country dropdown; 4 sensitive left | **Supported** |
| Greenhouse embedded on company sites | iframe on `*.greenhouse.io` | greenhouse | — | Stripe: form loads only after the site's own Apply click | **Partial**: works once the embedded form is open |
| Lever | `jobs.lever.co`, `*.lever.co` | lever | PASS — full name, current company, LinkedIn/GitHub, verified upload | Palantir, Spotify: all recognised fields correct; office-location choice and language checklist left alone | **Supported**; live upload-confirmation markup unverified |
| Ashby | `*.ashbyhq.com` | ashby | PASS — E.164 phone where the field asks for it, skill-specific years left blank, verified upload | OpenAI, Ramp: correct; SMS-consent radio and payroll-location question left alone | **Supported** |
| SmartRecruiters | `*.smartrecruiters.com` | smartrecruiters | unit/jsdom only (OneClick shadow DOM, row editor) | ServiceNow: one-click form renders only after interaction | **Unverified live** |
| LinkedIn Easy Apply | `linkedin.com/jobs/*` | linkedin (contact + skills only) | — | not run — requires LinkedIn sign-in | **Partial by design**: no experience rows |
| Indeed Apply | `smartapply.indeed.com` (added), `indeed.com` | generic | — | not run — requires Indeed account | **Unverified**; previously the apply host never loaded the script |
| iCIMS | `*.icims.com` | generic (+ iframe relay) | — | not run — application behind sign-in | **Unverified** |
| Jobvite | `*.jobvite.com` | generic | — | not run | **Unverified** |
| Oracle Recruiting / Taleo | `*.oraclecloud.com`, `*.taleo.net` | generic | — | not run — sign-in | **Unverified** |
| SAP SuccessFactors | `*.successfactors.com`, `.eu`, `*.sapsf.com`, `.eu` (added) | generic | — | not run — sign-in | **Unverified**; EU and sapsf hosts previously never loaded |
| ADP | `*.adp.com` | generic | — | not run | **Unverified** |
| UKG / UltiPro | `*.ultipro.com`, `*.ukg.net` (added) | generic | — | not run | **Unverified**; previously never loaded |
| BambooHR | `*.bamboohr.com` | generic | — | not run | **Unverified** |

"Unverified" means the generic engine runs there and every safety rule applies,
but no automated or live check has exercised that portal's markup. Where a
control is not recognised, it is left blank and listed as needing attention.

## The ten required scenarios

All run through the real `runPrefill` engine (`tests/autofill-scenarios.test.ts`)
and, where marked, through the real extension in Chromium.

| # | Scenario | Result | Evidence |
|---|---|---|---|
| 1 | Separate country-code control | Code selected once; number written without the code. A page-default "+1" is corrected only when the stored number explicitly carries another code ("+91 …"). UK trunk 0 dropped after a separate "+44". | scenarios 1, 1b; E2E generic site |
| 2 | Field needing the full international number | E.164 (`+15551234567`) when the placeholder/label asks for it; stored form otherwise | scenario 2; E2E Ashby |
| 3 | Country → State → City dependent dropdowns | Filled in order after each list loads (bounded passes, DOM-settle wait) | scenario 3; E2E generic site |
| 4 | Workday-style month/year selectors | Listbox buttons and Month/Year inputs take start/end from the labelled group | scenario 4; E2E Workday |
| 5 | Searchable university and degree dropdowns | Typeahead search loads options; school by exact name, degree by level ("Master of Science" → "Master's Degree") | scenario 5; E2E Workday (degree) |
| 6 | Four work experiences needing extra rows | Rows added and filled in order; MM/YYYY text dates | scenario 6; E2E generic site and Workday |
| 7 | Portal already parsed the PDF | Matching rows kept (case/spacing-insensitive) and completed; new rows only for the rest | scenario 7 |
| 8 | Fields appearing after a selection | Filled in a follow-up pass | scenario 8 |
| 9 | Similar but different options | USA → "United States", never "…Minor Outlying Islands"; VA → "Virginia", never "West Virginia"; no match → blank, never the first option | scenarios 9, 9b |
| 10 | Field rejects or reformats | A phone mask that reformats is accepted (digits compared); a rejected value is reported with Retry | scenario 10 |

## Accuracy fixes found by the live dry run

The read-only audit of real pages found and fixed these misclassifications,
now regression-tested in `tests/autofill-normalization.test.ts`:

- "Telugu (TEL)" in a language checklist was read as a telephone field.
- "How do you pronounce your name?" was read as full name.
- A label wrapping a `<select>` included every option ("…Vatican City…"), so a
  country list read as a city field; a country list labelled "location" now
  selects the country.
- "Which office / opportunity location" was treated as the applicant's home.
- "Share 2–3 of your open-source contributions with links (GitHub PRs…)" was
  read as a GitHub URL field.
- An SMS-consent radio mentioning "Phone" was read as a phone field.

## Defect fixed during E2E

Restoring a generated resume saved to the account (the "generated earlier,
applying now" path) almost always fell back to profile-only: the server
restamps the artifact with its own clock after the request was made, and the
check rejected it as "generated in the future". The window is now re-based on
the device clock and validated against the current time. Regression test:
`tests/background-stored-artifact-restore.test.ts`.

## Source-of-truth safety (server)

Snapshot reconciliation now also refuses facts the applicant's own resume does
not state: a total "years of experience" is kept only when written ("6+ years"),
never computed from dates; skills and certifications must appear in the source
resume (a tailored resume may add job-description keywords).

## Known limitations and what would close them

- **Live portals behind sign-in** (Workday, iCIMS, Taleo/Oracle, SuccessFactors,
  Indeed, LinkedIn) were not exercised live. Closing this needs a manual pass
  with a test candidate account on each, authorised by the owner.
- **Workday date spinbuttons**: fixtures accept programmatic values; whether
  live Workday's React inputs commit them is unverified. Verification reports
  any value the page does not keep as needing attention, with Retry.
- **Upload confirmation markup** for Lever/Greenhouse/Ashby/SmartRecruiters is
  modelled, not observed after a real upload (that would upload a file to an
  employer). An unconfirmed upload is reported as "check upload", never success.
- **Embedded or click-to-open forms** (Greenhouse on company sites,
  SmartRecruiters one-click) fill only after the applicant opens the form.
- **Cross-origin iframes** fill through the existing relay, but their counts are
  not yet merged into the top-frame summary.
- **Step-by-step mode** does not fill a new step on its own; it shows "New
  fields appeared on this step…" and waits for a click. Continuous mode (opt-in)
  follows steps automatically.
- **Typeahead schools** need an option that equals the resume's school name;
  "Northeastern University – Boston" style variants are left for the applicant.
- **Widget settle race**: in 4 of 36 automated runs the first click landed while
  the widget was re-rendering and started nothing; a second click worked.
- **Country aliases** cover the ~110 countries in the shared table; others match
  by exact name only.
- The browser suites are not in CI (CI runs extension typecheck, unit tests and
  build). Run them locally before a release:

```bash
pnpm --filter extension build && pnpm --filter extension test:autofill-browser
pnpm --filter extension audit:live-portals
```
