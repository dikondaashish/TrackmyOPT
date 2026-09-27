# Competitor architecture roadmap status — extension 0.2.4

Date: 2026-09-27. Scope: the owner-provided `TrackMyOPT-competitor-architecture-review-2026-09-27.md`, following the [0.2.3 status report](competitor-architecture-roadmap-0.2.3.md). Competitor bundles were references only; no competitor code or assets were copied. **This is not a 100% completion claim.** The ZIP is local and has not been uploaded or submitted to the Chrome Web Store.

## Code and fixture status

| Original recommendation | Status | 0.2.4 evidence and remaining limit |
| --- | --- | --- |
| Verify upload acceptance, parser settlement, and committed native values | **DONE** | Existing bounded evidence and commit checks remain tested. Page evidence cannot independently confirm a remote ATS server's final state. |
| Cover parser delay, remount, dropdown, iframe, navigation, cancellation, and user edits | **DONE** | 643 extension tests pass. Browser fixtures exercise rejected uploads, remount safety, child-frame delivery, refresh, and undo. |
| Define per-ATS capabilities for Workday, Greenhouse, Lever, Ashby, SmartRecruiters, and LinkedIn | **DONE** | Packaged adapter capabilities and conservative fallback remain explicit. SmartRecruiters OneClick selectors now reflect observed `data-test` sections and custom Add controls. They do not claim every employer variant. |
| Exact asynchronous/searchable dropdown commits | **DONE** | Existing exact-option verification remains; SmartRecruiters shadow-root date/autocomplete inputs are now excluded from native-text success claims. Live selections on each platform still need validation. |
| Repeated employment and education rows | **PARTIAL** | Existing safe native rows and unique Add controls have fixtures. SmartRecruiters OneClick's custom Add host did not activate from a direct host click in live inspection, so the adapter now targets its native shadow-root button. It can open one empty editor from zero rows and then stops; its custom title/company/date widgets and local Save are not automated. More employer layouts may differ. |
| DOM/control replacement recovery and operation-level retry | **DONE** | Existing unique-key remount recovery and blank-only retry remain. 0.2.4 progress patches advance only the matching retry operation. No uploads or user edits are blindly replayed. |
| Navigation/cancellation and stale run/frame protection | **DONE** | Document generation and frame relay guards remain. Versioned progress patches now reject duplicate, out-of-order, foreign-run, navigation-generation, frame, or adapter updates. |
| Unified per-field progress, source explanation, and targeted retry | **PARTIAL** | A value-free v1 snapshot records run ID, navigation generation, frame ID, adapter, field status/source/reason; retry updates use guarded patches. Existing applicant entries are marked `already_present`, not attributed to extension verification. The UI still paints the final scan and grouped coverage, rather than a streamed patch for every intermediate action. The protocol deliberately carries no answer text or field values. |
| Lightweight activation and measured irrelevant-page work | **PARTIAL** | Runtime deferral and explicit activation pass browser fixtures. `scripts/measure-irrelevant-page-work.mjs` measured one synthetic matched privacy page for 8.4 seconds: task CPU 0.0385s without the extension, 0.0479s with it; script CPU 0s and 0.0057s respectively. The heavy runtime stayed unloaded. This is one diagnostic run, not a cross-site latency or observer-frequency benchmark. |
| Shadow DOM widget isolation and keyboard/accessibility behavior | **DONE** | Existing widget fixtures cover hostile CSS, focus, Escape, refresh, and mobile width. |
| Settings migration, release notices, and packaged adapter disablement | **DONE** | 0.2.3→0.2.4 unpacked update preserved storage and showed the release notice in the isolated browser fixture. |
| Per-ATS success-page detection | **PARTIAL** | Exact visible confirmation headings are checked inside conservative per-ATS candidate roots; an active Submit Application control rejects success. Named ATSs do not use a generic `main` fallback. The candidate selectors have synthetic tests, not submitted-application evidence, so false negatives remain possible. |
| Optional saved-answer correction and keyboard shortcut | **DONE** | Reviewed screening drafts now require a separate Save button before persisting; save failures do not claim success. `_execute_action` has a user-remappable popup shortcut. No new Chrome permission was added. Actual shortcut conflicts and production API persistence need live validation. |
| Offscreen local PDF extraction | **NOT DONE** | The original review made this conditional on a specific local-processing need. The current authenticated backend accepts and parses PDF/DOCX/TXT uploads. Adding `offscreen` permission and a PDF runtime without that need would enlarge the release and permission surface. |
| Signed-in production API and representative employer-site acceptance | **REQUIRES LIVE VALIDATION** | The candidate build was not installed into the user's connected Chrome profile. No real applicant data was entered, no application was submitted, and no production account/API acceptance was inferred from synthetic fixtures. |
| Chrome Web Store submission | **NOT DONE** | Explicitly excluded by the owner. No Store-hosted package, listing, privacy declaration, or submission was changed. |

## Live ATS inspection boundary

| ATS | Observed public surface | Remaining validation |
| --- | --- | --- |
| Greenhouse | Public application and asynchronous country options inspected. | Run the 0.2.4 build with a controlled demo profile; confirm a committed option and employer variants. |
| Lever | Public application inspected, including current-location input and hidden selected-location state. | Verify the committed location token and parser behavior with 0.2.4; do not submit a real application. |
| Ashby | Public application and screening fields inspected. | Verify 0.2.4 prefill, document handling, and variant selectors. |
| SmartRecruiters | OneClick public form inspected. Experience/Education start with zero rows; Add opens an unsaved custom editor with shadow-root autocomplete/date controls. The actual native Add control is inside a shadow root. A raw date text edit did not reliably commit the requested month, so it was cancelled without saving. | Validate the packaged build's editor opening and custom value commits on controlled data. The present build intentionally stops before claiming a saved history row. |
| Workday | Public job reached Apply Manually, then an account-creation/terms gate. | A controlled test account and permission to accept its terms are needed to reach history controls. |
| LinkedIn | Signed-in Easy Apply contact modal inspected read-only. | Validate the 0.2.4 build with a controlled profile. The owner's prefilled personal data was neither changed nor submitted. |

The connected Chrome browser did not expose its installed-extension management page to this automation session, so its installed TrackMyOPT version was not verified. The isolated Chromium fixture independently loaded the packaged 0.2.4 build. Live site markup inspection does not establish that the connected browser was running 0.2.4.

## Validation and package

- TypeScript type check: passed.
- Extension suite: **643/643 passed**.
- Isolated Chromium release fixture: 0.2.3→0.2.4 unpacked replacement, clean installation, release notice, lazy activation, popup/widget controls, frame relay, upload/parser states, refresh, and restart passed; no page errors.
- Browser prefill/undo: 1440 px and 390 px passed; later applicant edits survived undo.
- Local production ZIP: `releases/trackmyopt-v0.2.4-chrome-web-store.zip`, SHA-256 `064ffacfa8d8ac06393c9211827f250f23538bc765748064eaa83ba4c61ce501`. The package script extracted it, checked the root manifest and allowlist, compared all files byte-for-byte, and scanned for source maps, debug/local URLs, and known secret patterns.

Do not publish this build on the strength of the synthetic checks alone. Finish controlled live ATS and production API validation, especially SmartRecruiters custom history rows and Workday, before claiming universal compatibility.
