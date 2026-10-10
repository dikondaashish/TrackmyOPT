# Sentry error monitoring

The Next.js app reports to `zyene-inc / javascript-nextjs-0u` using
`@sentry/nextjs`. Browser exceptions and rejected promises, React error
boundaries (including root-layout failures), Next.js request errors, Node/edge
runtime failures, and `console.error` reports are captured. Expected failures
that are returned without throwing or logging an error are not automatically
Sentry issues. The separate ingestion API and Chrome extension do not run the
Next.js SDK.

Existing PostHog instrumentation and server console redaction remain active.

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

## Verification

1. Configure the DSN in an ignored `apps/web/.env.local` file.
2. Run `pnpm --filter web dev` from the monorepo root.
3. Visit `/sentry-example-page`. Click the browser, server, and edge test buttons.
4. Confirm the three synthetic errors appear in
   [Sentry Issues](https://zyene-inc.sentry.io/issues/?project=4512234317938688),
   with environment `development`, and check the alert history.

The example page and error endpoints return 404 outside local development,
including production and Vercel previews. Do not deliberately break a live
customer route to test monitoring.

Focused checks:

```bash
pnpm --filter web exec vitest run lib/sentry/options.test.ts app/api/sentry-example/route.test.ts
pnpm --filter web run lint
pnpm --filter web run typecheck
pnpm --filter web run test
pnpm --filter web run build
```

See [Sentry's Next.js setup guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)
and [data collection options](https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#dataCollection).
