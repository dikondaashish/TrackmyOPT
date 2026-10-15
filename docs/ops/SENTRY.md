# Sentry error monitoring

The Next.js app reports to `zyene-inc / trackmyopt` using
`@sentry/nextjs`. Browser exceptions and rejected promises, React error
boundaries (including root-layout failures), Next.js request errors, Node/edge
runtime failures, and `console.error` reports are captured. Every Next.js API
handler also reports returned HTTP 5xx responses through `withSentryApiErrors`,
including handled failures, cron requests, and extension requests to the website.
The browser HTTP client integration reports first-party `/api/` 5xx responses,
including failures that occur before a server handler can run. Case workers
report partial failures and audit-recording failures, even when an error was
caught internally. Expected validation/authentication/not-found/rate-limit
responses (4xx) do not create API-response issues. The separate ingestion API
process and Chrome extension's own runtime do not run the Next.js SDK. The Render
pending-case email enrollment catch sends a fixed, authenticated, body-free error
signal to `/api/internal/pending-case-enrollment-failure`, where the web SDK
captures and flushes it. The daily case worker also sends a fixed body-free signal to
`/api/internal/case-worker-failure`, authenticated with the existing API key.
Scheduled USCIS calls and persistence run through the monitored web sync flow.
The daily cron reports failed/overdue jobs from the preceding day. These bridges
do not cover all ingestion API errors; its transport failures remain visible in Render logs. It accepts no
caller-supplied diagnostics or applicant data and limits repeated reports.

Job-board ingestion is watched from the web app by the three-hourly
`/api/cron/job-board-ingestion-health` cron, once
`JOB_BOARD_INGESTION_HEALTH_ENABLED=true` is set in Vercel. It reads the
Supabase audit tables for scheduled (`job-board-hour-*`) runs and raises one
fingerprinted Sentry issue per kind: `missing-run`, `stalled-source`,
`oracle-error` and `failed-source`. Messages carry only run IDs, counts and
Oracle error codes (`ORA-`/`NJS-`/`DPI-`), never raw error text. The Vercel
cron `/api/cron/job-board-ingestion-dispatch` (the daily scheduler, gated by
`JOB_BOARD_SCHEDULE_ENABLED=true`) raises the fixed message
`Scheduled job-board ingestion dispatch failed` (fingerprint
`job-board-ingestion` / `dispatch-failed`, tags `job_board_dispatch_reason`
and `job_board_dispatch_status`) when the API is unreachable, rejects the key,
returns an error or malformed reply, or config is missing. It returns HTTP 200
with `ok: false` so the API wrapper does not raise a second issue. A slot that
was already dispatched (`suppressed`) is not an error. Failures
inside the Render worker that never reach an audit row remain visible only in
Render logs. See `docs/ops/ingestion-automation.md`.

The Render job-board worker sends fixed, body-free signals to
`/api/internal/job-board-worker-failure/[kind]` (authenticated with the API
key, rate-limited per kind) for failures that never reach an audit row:
`queue-error` (Bull/Redis error events), `source-stalled` (a source job lost
its lock) and `redis-eviction` (Redis `maxmemory-policy` is not `noeviction`).
The worker sends each kind at most once per 5 minutes. Process crashes and
out-of-memory kills are still visible only in Render events and logs.

When adding API handlers, export them through `withSentryApiErrors` with their
static route pattern and HTTP method, as existing routes do. The wrapper never
reads request or response bodies, preserves streaming responses, and lets
thrown exceptions reach Next.js's normal error handler. Its diagnostic messages
contain only the HTTP method, static route pattern (such as `/api/jobs/[id]`),
and response status. Nested handler delegation reports the same response once.
An HTTP 200 response containing an application error still requires explicit
`console.error` or `Sentry.captureException` at the point of failure.

Existing PostHog instrumentation and server console redaction remain active.

Browser requests that fail before any HTTP response arrives ("Failed to fetch",
Safari "Load failed", Firefox "NetworkError…") are usually the visitor's
connection. Fixed TrackMyOPT diagnostics ending in `(stage=network, status=none)`
mean the same thing. `shouldDropNetworkFailure` in `lib/sentry/options.ts` drops
them while the browser is offline or the page is hidden. Otherwise it sends one
body-free, credential-free `HEAD` probe (with one retry two seconds later) to the
host that failed — this site, or the host Sentry names, such as the Supabase
project. If that host answers, the request was lost on the visitor's connection
and the event is dropped; if it stays unreachable, the event reports as a
possible outage. A third failure on the same page against a reachable host is
treated as persistent (for example, a blocked or misconfigured request) and
reports. At most one network failure reports per page load, so one outage
cannot create an issue for every widget. Events wait for the probe (up to about
12 seconds); a page closed during that wait loses that event. 5xx responses are
reported separately and are unaffected.

App code that catches such a failure and reports it with its own fixed message
(for example the receipt-entry `network` diagnostics) applies the same policy
through `shouldReportCaughtNetworkFailure`, sharing the once-per-page budget
(without the reachability probe; it is also skipped while a probe is running).
Fixed messages ending in `(stage=network, status=none)` get the full probe
policy instead.

posthog-node logs its own delivery problems through `console.error`.
`isAnalyticsTransportFailure` drops only PostHog network errors/timeouts and
the bounded shutdown-wait timeout; PostHog HTTP errors (such as a rejected key)
and every product failure still report.

Expected JWT outcomes (expired, malformed, or wrongly signed extension tokens)
return `null` silently in `verifyToken`; only unexpected verification faults,
such as a missing signing secret, are reported (error class only).

The USCIS case check retries an idempotent `case_status` read/update once when
supabase-js gets no HTTP response (`status: 0`), and labels persistence
failures as `transport` or `http <status> <SQLSTATE>`. AI call failures are
reported as a fixed `[ai-failed] task=… model=… error=… status=… reason=…`
line; the JSON detail goes to logs at warn level only.

The OPT/STEM tools report unexpected saved-date, plan-status, employment-history,
and date-save failures with fixed diagnostic messages, including malformed or
failed HTTP 200 responses. Expected 4xx outcomes and requests canceled by
unmounting stay separate. Reports omit dates, employment records, response bodies,
and rejected error contents. Loading failures retain only a fixed stage
(`network`, `http`, `json`, `payload`, or `processing`) and numeric HTTP status
(or `none` before a response). These distinguish failures before a response, non-2xx
responses, response-body reading/parsing failures, rejected payloads, and local
processing failures without
relaxing the Sentry privacy scrubber. Historical reports without these fields
cannot be retroactively diagnosed from this change.

The public OPT decision-window lookup follows the same stage/status diagnostics
for unexpected failures and validates the numeric values it renders before
showing an estimate. Expected 4xx outcomes keep the normal error state without
Sentry error reporting. The submit label survives browser translation and its
date limit is set after hydration.

## Browser error triage

### OPT forecast evidence and validation

The forecast API and refresh cron use `withSentryApiErrors`; failed immutable
observation writes fail the case check so its durable retry can recover the
evidence. Model-read/write failures never publish a partial ready run. A daily
sync still pending at the last forecast slot emits a fixed error message.
Community partial-source failures are explicitly reported even when other
sources succeed. Browser forecast failures use a fixed message and retain the
historical comparison. No receipt, provider body or case dates enter these
diagnostics. Expected limited evidence, source review, unauthorized access and
ordinary waiting-for-sync states do not create issues.

Model freshness and accuracy reports are stored in private database run records,
not Sentry metrics. This does not add paid monitors, tracing, Replay or logs.
Cron absence requires an external freshness check; a job that never executes
cannot report itself. See [forecast operations](../predictions/OPT_FORECAST_ENGINE.md).

React error #418 is a hydration mismatch and remains observable in both Sentry
and PostHog. On October 12, 2026, both occurrences shown in PostHog were on
`/tools/opt-clock`. The shared tool hook rendered the current local date during
SSR; static HTML can retain the build date while the browser uses a later date
or a different timezone. The hook now starts with an empty date, refreshes after
hydration, and updates each minute and on focus. Regression checks hydrate HTML
from a different day and exercise both public OPT/STEM clocks with a different
browser date and timezone. This fixes that reproduced cause; other hydration
causes still need investigation if they recur.

The `window.ethereum.selectedAddress = undefined` TypeError shown on
`/blog/h1b-approval-rates-by-company` came from Brave on iOS, with a page-only
global-code stack. It matches [Brave's wallet-injection bug](https://github.com/brave/brave-browser/issues/58670);
TrackMyOPT has no wallet integration. PostHog drops only the exact signature
with Brave/iOS metadata and page-script evidence. Bundled errors, mixed product
errors, and events without that evidence remain reportable. This classification
does not change Sentry capture, alerts, sampling, or privacy settings, and does
not remove historical events. Do not resolve an issue solely to clear the list;
check its release, last occurrence, and post-deployment evidence first.

### October 15, 2026 browser review

`RangeError: Maximum call stack size exceeded.` on `/login` (TRACKMYOPT-Z) used
WebKit wording, and every frame pointed at a page document (`app:///login:200`,
`app:///:228`). The production `/login` HTML is a single line and `/` has 22
lines, and the app ships no multi-line inline scripts, so those frames are
script evaluated against the page URL by the browser or host app, not
TrackMyOPT code. The matching PostHog RangeError groups are iOS, almost all the
Google app's in-app browser (`GSA/`) plus Chrome iOS, with frames at page lines
~188–415. Sentry `isInjectedPageScriptEvent` and PostHog
`isInjectedPageScriptError` drop an exception only when every located frame is
the page document itself (not `/_next/`, `turbopack:` or a `.js` file) beyond
line 50. Frameless errors, early page lines, and anything touching a bundle
frame still report. If the served HTML ever grows past 50 lines or gains a
multi-line inline script, revisit this threshold.

Pro checkout's "request failed" event (TRACKMYOPT-19) had no matching
`/api/premium/create-checkout` log or server error, so the request never reached
the function. Checkout, the activation probe and the OPT tools now label such
failures `stage=network, status=none`, so they follow the network policy above;
checkout keeps its PostHog `pro_checkout_failed` event with the same stage. Auth
provider errors (other than missing sessions), HTTP failures, malformed bodies
and processing failures still report with their stage and status.

Promise rejections without a stack — `undefined` (TRACKMYOPT-1C), a synthetic
`CustomEvent` of type `unhandledrejection`, and an empty object (TRACKMYOPT-X/Y,
one page view) — cannot be attributed. TrackMyOPT's own source never dispatches
such events, but bundled dependencies could not be ruled out without frames, so
no filter was added; they remain reportable.

The organization also contains `zyene-reviews` for Zyene Reviews. Keep the
products' DSNs and Vercel upload credentials separate. TrackMyOPT's numeric
project ID is `4512234317938688`; renaming its slug does not change the DSN.

## Session, image, and extension recovery

The October 12 [TrackMyOPT issue review](SENTRY_ISSUE_REMEDIATION_2026-10-12.md)
covers only project `4512234317938688`. The locked `@supabase/auth-js@2.75.0`
has a pnpm patch that validates primitive/array storage before user hydration,
clears malformed session and user cookies with a fixed diagnostic, and preserves
an in-progress OAuth PKCE verifier. It also guards browser URL access during
server initialization. Keep the patch when updating dependencies until the
upstream implementation and regression tests verify the same recovery. The
proxy batches cookie updates and preserves every updated/deleted chunk on both
normal responses and redirects.

Retryable refresh-network failures keep the existing session and remain
reportable. The SDK already retries transient fetch failures; do not convert
provider outages into successful authentication or suppress their reports.

Blog covers retry the original static image after an optimizer failure, then
use a static fallback. If both originals and fallback fail, the layout retains
an accessible placeholder and sends a `HEAD` request for the original cover.
Only a broken asset reports (`Blog cover image failed to load (stage=http|payload,
status=…)`: a non-2xx or non-image response); a probe without any response uses
the shared network policy. A cover the server does serve but the browser would
not show — images blocked by crawlers, data saver, or extensions — is not a
TrackMyOPT failure and is not reported; after the first such confirmation the
page stops probing. Before October 15, 2026, every such page reported; the
33 events then were all in same-second bursts from data-centre locations
(Ashburn, San Jose, Singapore, China, Seongnam) while every cover file was
present and served with HTTP 200. `components/blog/blog-cover-assets.test.ts`
fails the test suite if a blog index or research cover file is missing.
Dashboard extension messaging consumes callback errors and rejected promises;
expected missing/closed contexts are normal detection outcomes. Unexpected
bridge failures and open-tool timeouts use fixed error reports. The extension's
own background runtime still has the coverage limitation described above.

## Historical PostHog code review

The [one-year PostHog review](POSTHOG_CODE_REVIEW_2026-10-12.md) records all 81
issue groups and their evidence limits. AdSense now reserves each actual slot
before queueing and measures its current width. Template PDF cleanup consumes
cancellation rejections. Unexpected ad initialization, PDF load/render/cleanup,
and activation probe failures use fixed console diagnostics captured by Sentry.
Activation checks retain retry and account/consent guards; expected offline,
unmount, and authentication outcomes remain separate. Dashboard sidebar storage
also uses the safe helpers when storage is null or blocked, as does the job
tracker's saved-view preference.

PostHog and boundary reporting no longer drop React DOM removeChild/insertBefore
failures based solely on their message. Historical page-only/minified Safari
recursion and anonymous rejections remain unverified after inspecting the full
stored frame origins. The follow-up reproduced and repaired four job-tracker
hydration mismatches (relative dates, due counts, month grid, and table dates)
using a stable first render. Date-only follow-ups now keep the visitor's selected
calendar day. The board also uses a stable React ID for drag instructions to
avoid dnd-kit's server/client counter mismatch. Individual historical #418 causes
remain unverified; do not describe a suppression label or an old last-seen date
as a root-cause repair. This source review does not verify deployment or recurrence.

The further October 12 review reproduced browser-translation DOM crashes in the
landing resume enhancement and video sound controls. Their changing labels now
have stable elements, with translated-node regression checks; translation and
DOM error capture remain enabled. JSON-LD tests also exercise the captured
reader expression on current site schemas, and the serializer now uses its
fallback for empty contexts. Recovered Git history reproduces that expression
failure on the old root-array layout and verifies the June 14 object-root repair;
all eight historical groups precede it, while exact event attribution remains
an inference. Historical Safari recursion has a strong Google
iOS browser association, but its injected source is unavailable. Three new
production OPT API-loading diagnostics on release `9253825f369a` were observed
in the TrackMyOPT-only Sentry view; their captured data does not establish the
response/network cause. These and the remaining historical gaps stay unverified.

## Free-plan requirement

The owner requires the free Developer plan (recorded 2026-10-10). Keep the
existing error capture, production source maps, and new-issue/regression email
alert. Error sampling stays at 100% (`sampleRate: 1`); Replay, tracing, Sentry
logs, metrics, and attachments remain disabled. Expected 4xx outcomes are not
reported as API-response errors, preserving the error quota for actual failures.

Do not start paid trials, upgrade the subscription, or enable paid monitors
without an explicit owner request. The free plan cannot use a
[pay-as-you-go budget](https://www.sentry.help/en/articles/13965037-can-i-set-up-an-on-demand-pay-as-you-go-budget-for-my-free-developer-plan)
to increase its quota. Check the organization's monthly usage in Sentry
Settings → Subscription; quota exhaustion can prevent new events from being
accepted. A free plan does not guarantee unlimited error collection.

Sentry includes [one free uptime monitor per organization](https://www.sentry.help/en/articles/13964198-can-i-get-more-than-one-uptime-monitor).
Zyene Reviews already uses that slot. Preserve its monitor and leave the extra
TrackMyOPT monitor disabled while staying on the free plan. This uptime limit
does not disable TrackMyOPT's application error reporting or email alert.

## Deployment configuration

Set these in the `trackmy-opt-web` Vercel project before the next build:

| Variable | Environments | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SENTRY_DSN` | Production, Preview, Development | Public project ingestion endpoint |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Each environment | `production`, `preview`, or `development` |
| `SENTRY_AUTH_TOKEN` | Production only | Sensitive secret for source-map upload |

The source-map upload token is configured for Production as a sensitive build secret. Keep it in encrypted Vercel
environment variables, never source code or a `NEXT_PUBLIC_` variable.
The build only uploads maps when `VERCEL_ENV=production` and the token exists;
local/CI builds do not upload. When both PostHog and Sentry upload, PostHog
retains maps until Sentry uploads and deletes them. Error capture works without
an upload token, but minified browser stacks are less useful. Use a Node.js
version supported by SDK 11 (20.19+, 22.12+, or a current supported release).

The CSP permits only this project's Sentry ingestion host. Update that host
in `apps/web/next.config.js` if the project DSN changes.

## Data collection

This integration sends diagnostic error reports. Replay, performance tracing,
Sentry logs, metrics, breadcrumbs, user identity, cookies, HTTP headers/bodies,
URL query values, AI input/output, query result data, and frame locals are
disabled. The shared `beforeSend` filter also removes custom scope data,
attachments, request URLs, and source context. It redacts known sensitive
patterns in error messages, including email addresses, receipt numbers,
credentials, billing IDs, UUIDs, and URL credentials/queries/fragments.
Serialized object/array payloads, including truncated session JSON, are removed
wholesale from diagnostic text while preserving the message prefix and stack.

Keep applicant details out of error strings: pattern filtering cannot recognize
every possible personal value. Privacy disclosure lives in `/privacy` and
the shared third-party service list.

## Notifications

The enabled **TrackMyOPT — new errors and regressions** alert is scoped to this
project, across all environments. It emails the Zyene Inc Sentry member
(`zyene.inc@gmail.com`) on new issues, regressions, and priority changes.
Repeated events are grouped into the existing issue; the new-issue trigger
does not send an email for each occurrence. Sentry quotas, spike protection,
browser blocking, and provider delivery affect capture/notification delivery.

Manage the rule in [Sentry alerts](https://zyene-inc.sentry.io/monitors/alerts/6147762/).

A production [uptime monitor](https://zyene-inc.sentry.io/monitors/10601767/)
is configured for `https://www.trackmyopt.com`, every minute with a five-second
timeout, requiring an HTTP 2xx response. It is currently saved disabled because
Sentry rejected activation: "You don't have enough pay-as-you-go available to
create a new seat". No billing settings were changed. Verify activation in
Sentry before relying on outage checks. Three consecutive failures create an issue; one
successful check resolves it. These issues use the same project email alert.
Only the public homepage is checked; authenticated workflows still rely on
application error reporting.

## Verification

1. Configure the DSN in an ignored `apps/web/.env.local` file.
2. Run `pnpm --filter web dev` from the monorepo root.
3. Visit `/sentry-example-page`. Click the browser, server, edge, and handled-API
   test buttons. The handled-API button returns a synthetic 503 without throwing.
4. Confirm the synthetic errors appear in
   [Sentry Issues](https://zyene-inc.sentry.io/issues/?project=4512234317938688),
   with environment `development`, and check the alert history.

The example page and error endpoints return 404 outside local development,
including production and Vercel previews. Do not deliberately break a live
customer route to test monitoring.

Focused checks:

```bash
pnpm --filter web exec vitest run lib/sentry/options.test.ts app/api/sentry-example/route.test.ts
pnpm --filter web exec vitest run lib/sentry/api-errors.test.ts lib/case-status/worker-observability.test.ts
pnpm --filter web run lint
pnpm --filter web run typecheck
pnpm --filter web run test
pnpm --filter web run build
```

See [Sentry's Next.js setup guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
and [data collection options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection).
