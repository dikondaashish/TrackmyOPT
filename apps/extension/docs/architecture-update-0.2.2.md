# Extension architecture update — 0.2.2

Date: 2026-09-27. Baseline: 0.2.1, Git `95a24ea`.

## Delivered behavior

| Area | Implementation | Validation |
| --- | --- | --- |
| Document uploads | Separate browser file assignment from page confirmation; scoped adapter evidence; bounded parser wait; errors and timeouts pause later filling; existing files rechecked without replacement | Scheduler/DOM regression tests and Chromium upload/rejection fixtures |
| Field commits | Check native text/select values after asynchronous updates; verify repeated-record writes; reject detached or changed controls without rewriting them | Commit/cancellation/remount tests; real Chromium fill and undo |
| ATS adapters | Five named adapters expose packaged upload capabilities; form/record discovery crosses open shadow roots; independent packaged adapter-disable set | Existing portal fixtures plus new verification cases |
| Progress and recovery | Processing stage, document-specific status, local field-source labels, retry unfinished fields, and a distinct resume-review state | Unit/DOM tests; source labels remain local and outside telemetry |
| Loading | 9,885-byte bootstrap; dynamically imported packaged runtime; one message relay and module instance per document; child frames load on request; informational routes can stay deferred | Chromium install, message, iframe, refresh and deferred-page checks |
| UI isolation | Main widget in Shadow DOM; host remains positioned in the popover layer; scoped queries, focus restoration, announcements, settings and undo retained | Hostile-CSS browser fixture; keyboard/settings tests; existing sidebar regression suite |
| Update lifecycle | Versioned local release metadata; serialized migration; future-schema protection; install/update/startup handling; dismissible release notes independent of login requests | Migration and actual bundled-worker event tests; browser notice/dismissal and storage restart checks |
| Production package | Version 0.2.2, unchanged permissions/host permissions, packaged runtime declared as a dynamic web-accessible resource | Typecheck, production build, ZIP extraction and byte-for-byte comparison |

## Verification results

- Extension TypeScript check passed.
- 608 named unit/regression tests passed, in addition to existing top-level assertion fixtures.
- OPT/STEM browser tests: 32 cases across four timezones and light/dark themes passed, using mocked APIs.
- Browser Prefill/undo: desktop (1440px) and mobile (390px) passed; trusted user edits survive undo.
- Extension Chromium fixture: installation, lazy import, background relay, iframe activation, widget isolation, settings/Escape, page refresh, parser settlement, rejected-upload retry, restart/storage and release-notice dismissal.
- The previous 0.2.1 ZIP was loaded into a temporary Chromium profile, replaced by 0.2.2 and reopened; the version changed and existing storage survived. This is an **unpacked replacement test**, not a Chrome Web Store auto-update test.
- Headless unpacked replacement does not reliably emit Store update events. Install/startup ordering is tested against the bundled worker with simulated Chrome events; the notice browser test supplies release metadata explicitly.
- Browser fixtures use synthetic data and intercepted services. They do not prove signed-in production API behavior or compatibility with every live employer configuration.

## Loading measurement

The original job-page script was 307,585 bytes. The new initial script is 9,885 bytes (96.8% fewer initially loaded JavaScript bytes). The full runtime is 315,843 bytes and still loads on supported job workflows. This is a loading-size result, **not a CPU or speed benchmark**; total package code increased to support the new safeguards. No blanket performance or ATS coverage claim is warranted.

## Permission and data boundaries

No new Chrome permissions or host permissions. No competitor code, artwork, selector database, or API was imported. Rules execute from the package; there is no remote action interpreter or remotely loaded JavaScript. The runtime is web-accessible on HTTP(S) origins because existing career-path matches span arbitrary origins and Chrome's resource rules cannot restrict by path. Its URL uses Chrome's per-session dynamic ID. It contains application logic, not credentials.

References: [Chrome web-accessible resources](https://developer.chrome.com/docs/extensions/reference/manifest/web-accessible-resources), [Manifest V3 code requirements](https://developer.chrome.com/docs/webstore/program-policies/mv3-requirements).

Field-source references are ephemeral DOM references used for local display. Existing telemetry still uses its count/enum allowlist. The migration only stores release metadata and purges legacy synced token keys; it does not reset applicant settings or copy credentials.

## Deliberate scope boundaries

- Upload confirmation is evidence visible in the page, not independent server verification. Unknown markup remains explicitly unverified. Bounded settlement cannot guarantee that a third-party site will never change a value later.
- If a complete application container is replaced during verification, the run pauses. An explicit retry rediscovers the current form; it does not replay stale writes automatically.
- Existing dropdown commitment, sensitive-answer approval, saved-answer editing/“Remember my answer”, undo, navigation guards and no-final-submit rules remain in place.
- Existing-row education/experience filling is retained. Automatic Add/Remove-row operations require separately validated employer controls and are not introduced from competitor examples.
- Optional new shortcuts, automatic profile learning, offscreen PDF processing and a remote configuration service were not added. Existing keyboard interaction and explicit answer saving already serve the immediate flows; no new permission or backend is justified solely for competitor parity.
- OPT/STEM calculations, account features, authentication contracts and marketing assets were not redesigned.

## Reproduce

From the repository root:

```sh
pnpm --filter extension typecheck
pnpm --filter extension test
pnpm --filter extension package:store
pnpm --filter extension exec playwright install chromium
pnpm --filter extension test:release-browser
pnpm --filter extension test:opt-browser
pnpm --filter extension test:undo-browser
```

The last two scripts use installed Google Chrome by default. Set `OPT_TEST_BROWSER=chromium` or `UNDO_TEST_BROWSER=chromium` to use Playwright's installed Chromium. The release-browser script uses isolated profiles, synthetic pages and Playwright Chromium. If the previous release ZIP is absent, it runs fresh-install checks; set `EXTENSION_PREVIOUS_ZIP` to a verified 0.2.1 ZIP to include replacement checks. ZIPs, screenshots and temporary profiles are not committed.

## Production artifact

- File: `releases/trackmyopt-v0.2.2-chrome-web-store.zip`
- SHA-256: `69568e47dfd8f8a2ec23a1d2b65fa2577851ab2dc5b98f8281abe231009fc97a`
- ZIP extracted successfully; all entries matched the build byte for byte, with `manifest.json` at the archive root.
- Package validator found no source maps, console/debug statements, local URLs, unexpected files or known secret patterns. This is a bounded automated scan, not a claim that pattern matching proves the absence of every possible secret.

## Publication boundary

This task prepares source and a verified production ZIP. The Chrome Web Store draft is not submitted or published. Before publishing 0.2.2, complete signed-in smoke tests on the intended production services and representative live ATS applications, then upload this version to the existing Store draft. Do not describe synthetic fixtures as production end-to-end acceptance.
