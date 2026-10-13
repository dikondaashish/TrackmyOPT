# Daily enrolled-case sync

The single Vercel cron `/api/cron/check-case-status` runs at **14:00 UTC every
calendar day** (`0 14 * * *`). This is 10:00 AM New York during daylight time and
9:00 AM during standard time. It is a daily batch, not a promise that each
individual request finishes exactly 24 hours after the preceding request.

Every currently enrolled `case_status` row is eligible, including free accounts,
secondary cases, and cases with a final status. An enrolled case without a profile
row still syncs using free-tier display and notification rules. Real profile lookup
errors fail closed. Only user-enrolled receipts may
be queried; neighboring receipts and quarantined cache entries remain excluded.
Deleting a case cancels its persisted schedule and subsequent enrollment checks
prevent provider calls, writes, or notifications for that removed enrollment.

## Display and notifications

- Premium users read the latest database result, see case metrics, and receive
  status-change emails when their case notifications are enabled. Delivery
  rechecks enrollment, current status, subscription expiry, and notification
  preference. An unchanged daily status does not send another email.
- Free accounts also sync daily, but `/api/case-status` returns only their saved
  display snapshot. Daily syncs neither promote that snapshot nor enroll a free
  account into a case marketing sequence. Case metrics and monitoring details
  require a current premium subscription.
- On a free user's **first refresh click per case**, an atomic database function
  reveals the latest stored result without calling USCIS. The **second and later
  clicks** request USCIS and promote a successful result into the display
  snapshot. This sequence persists across browser sessions. New enrollment may
  still perform its immediate initial lookup, requested by saving the receipt.
- Live manual requests have a five-minute, per-case cooldown measured from the
  manual request, not from a background daily sync. Concurrent clicks cannot
  consume the first cached step twice or bypass the manual cooldown.

Premium dashboards reload database data on realtime updates, once a minute
while visible, and when the window regains focus. These reloads never call USCIS.
Free dashboards do not subscribe to automatic status updates.

## Provider limits and recovery

Render queues the current daily run and the following 14:00 UTC schedule. A
repair before 14:00 UTC belongs to the preceding run, so it cannot consume the
identity of the next scheduled batch. Stable daily IDs
and durable `case_check_jobs` outcomes prevent repeating a completed case after
Redis removes its payload. Re-dispatch recovers unfinished schedules, including
a Redis restart. The cron response reports **dispatch**, while job records report
actual completed syncs; a successful dispatch is not proof of USCIS success.

Scheduled and manual checks use the web application's single USCIS client and
credential configuration. `API_SECRET_KEY`, already shared by Vercel and Render,
authenticates worker callbacks. Render defaults its website callback origin to
`https://www.trackmyopt.com`; it no longer requires separate USCIS credentials
or `CRON_SECRET` to sync or request notifications. The internal sync route checks
Render availability before spending a provider request, to avoid consuming the
USCIS request budget when the worker is already unavailable for persistence.

### Render workspace and compute plans

On October 12, 2026, the Render dashboard confirmed **Zyene's workspace is Pro**.
The same dashboard showed the production **TrackmyOPT web service**
(`srv-d5q1o4koud1c73drob40`) and **trackmyopt-queue Key Value instance**
(`red-d5q1l89r0fns73d7pghg`) on **Free compute plans**. Workspace subscriptions
and service compute plans are separate; a Pro workspace does not automatically
upgrade either instance. See [Render billing](https://render.com/docs/faq#billing)
and [Free instance limitations](https://render.com/docs/free).

With those verified compute settings, the web service can still spin down after
15 minutes without inbound traffic, and the queue can lose its in-memory data on
restart. The availability check creates real inbound traffic during an active
batch; durable PostgreSQL job outcomes and re-dispatch support queue recovery.
Free compute also retains its documented usage and suspension limits. Recheck
each service's compute plan before changing these operational assumptions. The
availability check, recovery logic, and USCIS request limits remain useful with
paid compute; a workspace or compute upgrade does not change USCIS allowances.

The PostgreSQL request governor covers OAuth, manual calls, daily calls, and
retries across instances. It grants at most one request every **250 ms** (4 TPS).
Its conservative rolling budget covers the current hour and preceding 24 hours:
**350,000 production requests** or **900 sandbox requests**. It fails closed if
unavailable. Upstream `Retry-After` creates a shared pause; authentication failures
and 5xx also pause requests. Fetches have timeouts and cannot follow redirects.
Only the configured official USCIS API hosts are accepted. Worker retries wait
five minutes (three attempts), longer than the two-minute local outage circuit.
Expected not-found, validation, and throttling responses do not trip that circuit.

[USCIS's published API specification](https://developer.uscis.gov/sites/default/files/apidoc_specs/swagger_3.yaml)
currently documents production 10 TPS / 400,000 per day and sandbox 5 TPS /
1,000 per day. Recheck the current documentation and the application's own
approval letter before changing these bounds. Production API/token endpoints
must match the [USCIS production approval letter](https://developer.uscis.gov/get-started/go-live).
Never use scraping or bypass a protected-case 404.

## Monitoring and release

Unexpected worker failures send a fixed, authenticated, body-free signal to
`/api/internal/case-worker-failure`, which reports to TrackMyOPT Sentry. The bridge
limits repeated outage signals to protect the free Sentry quota. API 5xx,
provider/auth failures, persistence failures, notification failures, and partial
failures use the existing web SDK. The next daily cron reports failed or overdue
jobs in the preceding day even if the worker never reached completion. Expected
failed-case outcomes for unavailable cases, invalid receipts, and throttling are
excluded from unexpected-failure alerts. It is not
an immediate outage detector. Rate limits, transport failures, Sentry quota, and
email-provider acceptance can affect reporting and notification delivery.
See [Sentry operations](SENTRY.md).

The additive migration creates display/cooldown columns and content-free request
accounting. New internal functions and accounting tables are service-role-only;
client writes cannot reset the new cooldown/display fields. Snapshots live on the
case row and are removed with it under [case retention](../compliance/CASE_DATA_RETENTION.md).
Apply only this migration using the [migration workflow](SUPABASE_MIGRATIONS.md),
never a blanket production `db push`.

Verification includes real PostgreSQL concurrency/grant tests:

```sh
node scripts/operations/test-daily-case-sync.mjs
pnpm --filter api exec jest --runInBand
pnpm --filter web test
pnpm typecheck
pnpm --filter web build
```

The [USCIS agreement review checklist](../compliance/USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md)
remains an operational/legal review of the actual agreement, consent, production
approval, and key rotation. Technical safeguards alone do not establish legal
approval. Do not mark that review complete without the actual evidence.
