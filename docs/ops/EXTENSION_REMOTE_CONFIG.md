# Extension remote config, emergency switches, and submission tracking

Operator runbook for the Chrome extension's server-delivered configuration,
its emergency off switches, and the application-submission lifecycle.

## What remote config can and cannot do

Config is a **data document**, validated by
`apps/extension/src/platform-config/remote-config.ts` on publish (server), on
delivery (server), and on receipt and every read (extension). It can only:

- switch off all autofill, one platform, one capability, or one detector;
- choose a bundled detector mode (`off`, `shadow`, `active`);
- add lowercase label phrases mapping to bundled, non-sensitive field kinds, or
  mark labels to leave alone.

It cannot add hosts or domains, selectors, scripts, expressions, URLs, or
user-facing text (each switch names a bundled `reason`). This follows the
Chrome Web Store MV3 rule that remote configuration is allowed only "where all
logic for the functionality is contained within the extension package"; an
interpreter for remote commands would count as remote code.

| Field | Values |
| --- | --- |
| `schemaVersion` | `1` |
| `version` | `YYYY-MM-DD.N`, unique |
| `issuedAt` / `expiresAt` | ISO UTC; lifetime at most 30 days |
| `minExtensionVersion` | optional `x.y.z` |
| `killSwitches.autofill` | `{ "disabled": true, "reason": … }` |
| `killSwitches.platforms.<id>` | `workday`, `greenhouse`, `lever`, `smartrecruiters`, `ashby`, `linkedin`, `generic` |
| `killSwitches.capabilities.<id>` | `contact`, `skills`, `experience`, `education`, `rowCreation`, `searchableDropdown`, `resumeUpload`, `coverLetterUpload`, `privateAnswers`, `verifiedAuthorization`, `screeningDrafts`, `continuousMode`, `guidedAutopilot` |
| `killSwitches.detectors.<id>` | `workday_network`, `page_confirmation` |
| `reason` | `maintenance`, `site_change`, `incident`, `policy` |
| `detectors.<id>.mode` | `off`, `shadow`, `active` |
| `fieldRules.<platform>` | `labelAliases: [{ kind, phrases[] }]` (≤30 aliases, ≤20 phrases), `ignoreLabels[]` |

Size limit: 32 KB serialized. Examples: `docs/ops/extension-config-examples/`.

## Delivery, refresh, and offline behaviour

- `GET /api/extension/config` requires the extension bearer token. It returns
  200 with an `ETag`, 304 for a matching `If-None-Match`, or 204 when no
  version is active.
- The worker refreshes at startup and on the hourly `tmo-remote-config-refresh`
  alarm. Failures back off from 5 minutes to 6 hours with ±20% jitter.
- The last valid config is kept (last-known-good). Malformed or unavailable
  responses never replace it.
- **Expiry:** an expired config falls back to the bundled rules and detector
  modes, but its kill switches stay in force.
- **Newer extension required:** if `minExtensionVersion` is newer than the
  installed extension, the config's rules are ignored but its kill switches are
  honoured.
- **204 (nothing active):** the last-known-good config is kept.
- **Clearing a switch:** only a newer valid config can clear a kill switch, so a
  known emergency disable is never silently re-enabled by time, outages, or
  deactivation.
- **Bundled baseline** (`remote-config-baseline.ts`, `baseline-1`): Workday
  network detector `shadow`, confirmation-page detector `active`, no field rules.
- Every effective config carries `ruleVersion` (the baseline or remote
  version). It is recorded with each submission's evidence, so you can tell
  which rules produced a result.

## Publishing, activating, and rolling back (operators only)

Admin calls use `Authorization: Bearer $ADMIN_SECRET` against
`/api/admin/extension-config`. From `apps/extension`:

```bash
node scripts/extension-config.mjs validate ../../docs/ops/extension-config-examples/emergency-disable-workday.json
ADMIN_SECRET=… node scripts/extension-config.mjs publish config.json --by "your name" --notes "why"
ADMIN_SECRET=… node scripts/extension-config.mjs activate 2026-10-17.1
ADMIN_SECRET=… node scripts/extension-config.mjs list
```

- Publishing stores an **inactive** version.
- Activation switches the single active version atomically
  (`activate_extension_remote_config`).
- **Rollback** is activating an earlier version.
- Extensions apply changes within about an hour, or at the next browser or
  worker start.

### Emergency disable

1. Copy an example and set a new `version`, a fresh `issuedAt`, and an
   `expiresAt` up to 30 days out.
2. Add the switch, for example:
   `"platforms": { "workday": { "disabled": true, "reason": "site_change" } }`.
3. Run `validate`, then `publish`, then `activate`.
4. To lift it, publish and activate a newer version without the switch.

When a switch is active, open pages stop new automatic work. In-progress
Prefill runs stop at their next step, and Continuous mode and guided autopilot
stop. The applicant sees the bundled explanation for that reason and can still
complete the application manually.

## Submission confirmation lifecycle

`apps/extension/src/submission/`:

1. A trusted user activation of a final Submit control starts an attempt. On
   Workday this is the footer Submit button; on other sites, a final-step submit
   inside the application form. Pointer and keyboard activations both count.
2. On Workday, the isolated script arms the page-context monitor in the same
   event turn. The monitor is declared in `manifest.json` with
   `world: "MAIN"` for Workday hosts.
3. The background binds the attempt to its tab, frame, page, signed-in user,
   and job. Attempts expire after 15 minutes; network monitoring stops after 5.
4. Evidence is applied as follows:
   - **Workday network verdict:** used only when the detector is `active`.
     `success` → confirmed; `application_error` / `http_error` → failed;
     anything else is inconclusive. In `shadow` mode the verdict is only
     recorded and reported through value-free analytics
     (`extension_submission_outcome`).
   - **Confirmation page:** confirms only an attempt started in the same tab
     and origin.
   - **Manual:** the applicant clicks "Yes, I submitted it".
   - **No evidence:** the attempt becomes "not confirmed".
5. Confirmed attempts go to an outbox in `storage.local`. It retries with
   backoff (1 minute to 6 hours) and sends `POST /api/extension/application-submission`,
   which is idempotent on `attempt_id`.
   - An update is never sent while a different account is signed in.
   - 4xx rejections are dropped and reported.
   - Entries are abandoned after 14 days.
   - While sync is pending the UI says "Application submitted; tracker sync
     pending".

The server matches a tracker row only by an owned `application_id` or the exact
job URL, never by company or title. It advances only `Wishlist` → `Applied` and
records minimal evidence in `job_application_submissions`. That evidence has no
URLs, bodies, or answers.

### Promoting the Workday network detector

The finalize endpoint and success shape in `workday-submission-rules.ts` come
from static analysis of third-party code, not from TrackMyOPT runtime
observation. Promote `workday_network` to `active` only after:

1. **Real-tenant check:** on an authorized Workday test tenant, capture a
   sanitized successful finalize and a validation failure, then confirm the
   request path and body shape.
2. **Fixtures and tests:** add those as fixtures to
   `tests/submission-monitor.test.ts`.
3. **Shadow data:** review `extension_submission_outcome` events for Workday,
   with `network_detector_mode=shadow` and `submission_outcome`. Network
   `success` should agree with page confirmation, and there should be no
   success verdict without one.

Then publish `detectors.workday_network.mode = "active"` (see
`extension-config-examples/promote-workday-detector.json`). Roll back by
re-activating the previous version.

## Database migration

`supabase/migrations/20261018020352_extension_remote_config_and_submissions.sql`
creates both tables and the activation function. It was exercised locally on
PGlite (PostgreSQL in WASM) with constraint, RLS, and rollback checks.

It must be applied to production through the workflow in
`docs/ops/SUPABASE_MIGRATIONS.md`: rehearse, apply, run the advisors, rename the
file to the version production assigns, and record it in
`production-history.json`.

Until it is applied:

- the config route returns 204, so the bundled baseline is used;
- the admin route returns 503;
- tracker updates still work, but submission evidence is not stored, and the
  route logs `table_missing` for each update.

## Verification

- **Unit tests** (`pnpm --filter extension test`): `remote-config`,
  `submission-monitor`, `submission-lifecycle`, `submission-coordinator`,
  `application-review`, `verified-authorization`, `private-prefill-engine`,
  `prefill-mode-lifecycle`.
- **Web tests** (`pnpm --filter web test`): the config, admin, diagnostic,
  application-submission, and private-answers routes, plus
  `lib/extension/application-submission.test.ts`.
- **Browser:** `pnpm --filter extension test:submission-browser` runs real
  Chromium with the built extension and mocked network, and covers success, an
  HTTP-200 application error, shadow mode, sync failure, and keyboard submit.
  The suite also includes `test:autofill-browser` (with review-panel
  assertions) and `test:release-browser`.
- **Activation measurement:** `pnpm --filter extension measure:activation`.
