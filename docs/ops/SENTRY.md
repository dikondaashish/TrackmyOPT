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
process and Chrome extension's own runtime do not run the Next.js SDK.

When adding API handlers, export them through `withSentryApiErrors` with their
static route pattern and HTTP method, as existing routes do. The wrapper never
reads request or response bodies, preserves streaming responses, and lets
thrown exceptions reach Next.js's normal error handler. Its diagnostic messages
contain only the HTTP method, static route pattern (such as `/api/jobs/[id]`),
and response status. Nested handler delegation reports the same response once.
An HTTP 200 response containing an application error still requires explicit
`console.error` or `Sentry.captureException` at the point of failure.

Existing PostHog instrumentation and server console redaction remain active.

The organization also contains `zyene-reviews` for Zyene Reviews. Keep the
products' DSNs and Vercel upload credentials separate. TrackMyOPT's numeric
project ID is `4512234317938688`; renaming its slug does not change the DSN.

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
timeout, requiring an HTTP 2xx response. It is currently saved disabled; verify
activation in Sentry before relying on outage checks. Three consecutive failures create an issue; one
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
