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
captures and flushes it. This narrow bridge does not cover all ingestion API
errors; its transport failures remain visible in Render logs. It accepts no
caller-supplied diagnostics or applicant data and limits repeated reports.

When adding API handlers, export them through `withSentryApiErrors` with their
static route pattern and HTTP method, as existing routes do. The wrapper never
reads request or response bodies, preserves streaming responses, and lets
thrown exceptions reach Next.js's normal error handler. Its diagnostic messages
contain only the HTTP method, static route pattern (such as `/api/jobs/[id]`),
and response status. Nested handler delegation reports the same response once.
An HTTP 200 response containing an application error still requires explicit
`console.error` or `Sentry.captureException` at the point of failure.

Existing PostHog instrumentation and server console redaction remain active.

The OPT/STEM tools report unexpected saved-date, plan-status, employment-history,
and date-save failures with fixed diagnostic messages, including malformed or
failed HTTP 200 responses. Expected 4xx outcomes and requests canceled by
unmounting stay separate. Reports omit dates, employment records, response bodies,
and rejected error contents.

## Browser error triage

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

Blog covers report optimizer failures, retry the original static image, then
use a static fallback. If both originals and fallback fail, the layout retains
an accessible placeholder and reports each failure with a fixed message.
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
