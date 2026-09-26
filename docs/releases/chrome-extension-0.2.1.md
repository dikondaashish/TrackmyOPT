# TrackMyOPT Chrome extension 0.2.1 release record

## Scope

Update the existing Zyene, Inc. Chrome Web Store item
`hfljbefkccdmlnhclfojlafipjnjbajm`, previously published at 0.1.18. The
repository's prior 0.2.0 draft was not the published version. No new Chrome
permission was added. The manifest and package versions are 0.2.1.

## Source and package

- The production build is minified, omits console/debugger statements and source
  maps, and copies only runtime assets.
- The release script checks Manifest V3, version alignment, permissions,
  manifest references, forbidden development content, and exact ZIP extraction.
- Package: `apps/extension/releases/trackmyopt-v0.2.1-chrome-web-store.zip`.
- SHA-256: `588f68548368fe8200275dd8465c915eaf27f8bc935de9658e67737a6237b71a`.
- The ZIP has 22 runtime files with `manifest.json` at its root. It excludes
  source, tests, documentation, environment files, and source maps.

## Behavior fixed during release QA

- A content script attempted to use extension-only `chrome.storage.session`.
  Tab-scoped job context now passes through the service worker, preserving the
  detected job when an application changes page.
- On a matched career page, clicking the page widget's Undo could fail because
  Chrome did not grant the service worker fresh `scripting` access. When that
  happens, the already-running content script restores its own prefill journal.
  The real-browser fictional form test verified an empty first-name field was
  filled, then restored on Undo, while application submission count stayed zero.

## Validation

- Extension TypeScript and unit tests passed; the suite contains 588 tests.
- Web TypeScript, targeted legal/marketing tests (21), ESLint on changed files,
  and production build passed.
- React Doctor on changed web files: 93/100 with no findings.
- A fresh unpacked 0.2.1 installation opened the tour. Fictional tour prefill,
  preservation of an edited field, chapter persistence after refresh, popup
  signed-in and signed-out states, and six authenticated read-only API calls
  worked in Chrome. The service worker and page console had no significant
  errors in those checks.
- A fictional local posting was detected and checked against the tracker. On
  that page, prefill and Undo worked without submitting any application.
- The real published 0.1.18 CRX was downloaded from Google's public updater
  and loaded in the same unpacked test path and extension ID. After changing
  that path to the verified 0.2.1 ZIP and reloading, Chrome showed 0.2.1 with
  the signed-in popup and Step-by-step/Guided Autopilot preferences preserved.
- The dedicated browser suites passed: 1440 px and 390 px Prefill/Undo flows,
  and 32 mocked OPT-tool flows across four time zones and two themes.
- The package was extracted and compared byte-for-byte to its verified build.

## Store draft

Version 0.2.1 was uploaded to the existing listing. Copy, five screenshots,
two promotional tiles, support URL, permission explanations, and data-use
declarations were updated; the existing brand icon was retained. The Store may
perform an in-depth review because of the manifest's career-site patterns.
The public privacy page must show the new section 2.9 before submission.

## Limitations to verify before submission

Full Chrome-process restart, authenticated write flows, AI drafting, and live
Workday/Greenhouse forms were not exercised with a dedicated demo account. The
Store's reviewer test-account credentials were retained, and its instructions
were updated to cover the current popup and fictional product tour; the
credentials themselves were not independently verified. No real applicant
record or employer application should be modified just to complete QA. Record
the final Store submission and repository commit in the user-facing release
report; these happen after this source record is committed.
