# Competitor architecture roadmap status — extension 0.2.3

Date: 2026-09-27. Baseline: the owner-provided `TrackMyOPT-competitor-architecture-review-2026-09-27.md` and [0.2.2 implementation report](architecture-update-0.2.2.md). This report evaluates TrackMyOPT's own code. Competitor bundles were architecture references; their code and assets were not copied.

**Code completion is not live ATS acceptance.** Automated fixtures use fictional applicant data and controlled markup. Employer-specific customizations, signed-in production services, cross-origin restrictions, and Chrome Web Store update delivery still require live validation. The 0.2.3 package has not been uploaded or submitted to the Chrome Web Store.

## Requested compatibility gaps

| Requirement | Status | Evidence and limit |
| --- | --- | --- |
| Exact dropdown selection and asynchronous/searchable options | **DONE** | `smart-dropdown.ts` waits for scoped options, chooses one unambiguous match, requires the specific option's committed token/text to remain stable, and refuses mere search text. Wrong choices, timeouts, and cancellation have regression tests. **REQUIRES LIVE VALIDATION** on each ATS. |
| Repeated education and employment rows | **PARTIAL** | Existing visible rows are filled only when their nonempty fields agree with the corresponding résumé record. An explicit Prefill click can add up to five rows on Workday, Greenhouse, Lever, Ashby, or SmartRecruiters only when a unique, non-submitting Add control is inside the matching section and each new row appears. Generic and LinkedIn Add controls remain manual; no Remove or confirmation actions are automated. All six platform capability paths and ambiguity/cancellation cases have fixtures. Employer layouts **REQUIRE LIVE VALIDATION**. |
| Platform-specific field capabilities | **DONE** | All six named adapters declare contact, skills, education, employment, searchable-dropdown, and supported row-add behavior explicitly. LinkedIn does not claim history-row support. Generic fallback has no automated row creation. Upload evidence remains adapter-scoped; no remote executable rules or added permissions. **REQUIRES LIVE VALIDATION** for individual employer variants. |
| DOM/control replacement recovery | **DONE** | An async dropdown can recover a uniquely keyed control inside the same live form. A failed native operation offers a targeted retry that rediscovers a unique replacement. Ambiguous, unkeyed, or whole-form replacements stop for review. Synthetic remount and whole-form tests pass. **REQUIRES LIVE VALIDATION**. |
| Navigation/cancellation invalidates operations | **DONE** | A document generation guard, URL check, undo cancellation guard, and pagehide/SPA context events stop pending writes, row additions, dropdown clicks, and targeted retries. Tests cover restart, navigation, cancellation, and late options. |
| Stale run/message protection | **DONE** | Background relay requires a top-frame run bound to the tab's current URL and issues increasing per-tab sequences. Child documents reject duplicate/out-of-order relays; newer relays invalidate earlier work. Pure relay tests and an isolated Chromium child-frame delivery test pass. A tab can still navigate in the tiny interval between URL check and delivery, so representative live navigation tests remain necessary. |
| Operation-level targeted retry | **DONE** | The widget exposes one button per failed safe contact, native select, searchable dropdown, or history-field commit. Retrying does not reattach files, rerun all profile fields, or overwrite a newly entered value. It rechecks form identity, source-record mapping, selected option, and committed result. Tests cover a replaced control, user correction, URL change, and row reordering. Rejected uploads are deliberately manual; they are never blindly retried. |

## Original review, requirement by requirement

| Original recommendation or acceptance condition | Status | Current result |
| --- | --- | --- |
| Upload acceptance, parser settlement, and verified native-field outcomes | **DONE** | 0.2.2 added scoped upload evidence, bounded parser settlement, rejection handling, and native commit checks; 0.2.3 preserves them. Page evidence is not independent server confirmation. |
| Delayed parsing, remount, dropdown, child-frame, navigation, cancellation, and user-edit fixtures | **DONE** | The extension suite now has 629 passing named tests; the release browser fixture checks direct child-frame prefill, parser/rejection behavior, refresh, restart, and no page errors. Synthetic fixtures cannot establish live compatibility. |
| Scoped adapter capabilities for the six target platforms | **DONE** | Named packaged adapter declarations, conservative generic fallback, and adapter-specific upload/row behavior exist. Selector and control variations **REQUIRE LIVE VALIDATION**. |
| Unified prefill progress, source explanations, and targeted retry | **PARTIAL** | Grouped coverage, local source labels, document-processing states, and per-operation targeted retry work. A fully versioned per-field snapshot/patch protocol with explicit frame IDs and reason codes has not been added; the existing local generation/relay sequence prevents stale writes. |
| Lazy activation and measured irrelevant-page work | **PARTIAL** | The small bootstrap and deferred runtime work were delivered in 0.2.2, with a 96.8% reduction in initially loaded JavaScript bytes. Startup CPU, observer frequency, and cross-site latency were not benchmarked. |
| Shadow DOM widget isolation and keyboard/accessibility regression | **DONE** | Delivered in 0.2.2; browser fixture checks hostile host CSS, settings, Escape, iframe behavior, and refresh. |
| Settings migration, release notices, and packaged capability disabling | **DONE** | Delivered and tested in 0.2.2; 0.2.3 retains the migration and adapter-disable boundary. |
| Per-ATS success-page selectors | **PARTIAL** | Existing generic success detection remains. No new per-ATS success-page claim was introduced without live evidence. Prefill does not submit applications. |
| Optional saved-answer correction prompt and keyboard shortcuts | **NOT DONE** | Existing saved private-answer review remains; new automatic correction and command shortcuts were outside this ATS compatibility task. |
| Offscreen local PDF extraction | **NOT DONE** | The original review placed this in a later, need-dependent category. Current backend document processing does not justify added permission or package weight. |
| Signed-in production API and representative employer-site acceptance | **REQUIRES LIVE VALIDATION** | No real applicant data or live application submissions were used. Test Workday, Greenhouse, Lever, Ashby, SmartRecruiters, and LinkedIn with controlled demo accounts and multiple employer layouts before a Store release. |
| Chrome Web Store submission | **NOT DONE** | Explicitly excluded from this task. No listing, privacy declaration, or Store package was changed. |

## Checks and artifact

- TypeScript type check: passed.
- Extension unit/regression suite: **629/629 passed**.
- Isolated Chromium release fixture: 0.2.2 → 0.2.3 unpacked replacement preserved storage and showed the release notice. A clean 0.2.3 profile then passed installation, lazy activation, background-to-child relay and stale-URL rejection, upload/parser states, widget controls, page refresh, and storage restart with no page errors. The behavior check uses a clean profile because headless Chromium can retain old unpacked service-worker code after file replacement. This is not Chrome Web Store auto-update validation.
- Chromium prefill/undo: desktop and 390 px mobile passed; trusted edits survived undo.
- OPT/STEM: 32 flows across four timezones and light/dark themes passed with mocked APIs.
- Production ZIP: `releases/trackmyopt-v0.2.3-chrome-web-store.zip`, SHA-256 `176ac3b85bd7820c58c7cfed50d699227e9c099011f6ef387db6ff49f269c19d`. The package script extracted it, compared every file byte for byte, verified `manifest.json` at the ZIP root, and checked the allowlist, source-map/debug/local-URL patterns, manifest resources, and known secret patterns.

No Chrome Web Store upload or submission occurred. Do not call the original roadmap 100% complete: live ATS and signed-in validation, CPU measurement, full per-field progress protocol, and the explicitly optional later recommendations remain open.
