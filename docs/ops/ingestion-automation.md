# Unattended job-board ingestion

How the daily job-board ingestion runs without supervision, and how to switch
it on. Every setting below defaults to the behaviour before it existed, so
merging the code changes nothing in production.

## Moving parts

| Piece | Where | Off by default? |
|---|---|---|
| Schedule (Mon–Fri 14:00 and 21:00, Sat–Sun 21:00 New York) | Vercel cron `apps/web/app/api/cron/job-board-ingestion-dispatch` (`apps/web/vercel.json`) | Yes: Vercel env `JOB_BOARD_SCHEDULE_ENABLED` |
| Slot and daylight-saving logic | `apps/web/lib/job-board/ingestion-health.ts` (cron and health check); `scripts/operations/job-board-schedule.mjs` (scripts) | n/a |
| Manual, recovery and supervised runs | `.github/workflows/job-board-ingestion.yml` (`workflow_dispatch` only) | n/a |
| One failed-source retry per run (manual workflow runs only) | trigger script, `recover-failed` endpoint | Yes: repository variable `JOB_BOARD_AUTO_RECOVER_FAILED` |
| Health alerts to Sentry (every 3 hours) | `apps/web/app/api/cron/job-board-ingestion-health` | Yes: Vercel env `JOB_BOARD_INGESTION_HEALTH_ENABLED` |
| Dedicated worker | `JOB_BOARD_WORKER_ENABLED` on each Render API service | Yes: unset means every process consumes |
| Pacing window | `JOB_BOARD_PACING_WINDOW_MS` | Yes: 40 minutes |
| Per-provider spacing | `JOB_BOARD_PROVIDER_MIN_GAP_MS` | Yes: no extra limit |
| Skip sources in full runs (jobs untouched, source stays enabled) | `JOB_BOARD_EXCLUDED_SOURCE_IDS` | Yes: none excluded |

## Behaviour

- **Schedule.** Vercel cron runs in UTC, so
  `/api/cron/job-board-ingestion-dispatch` fires at `7 18,19 * * 1-5`
  (weekday 14:00) and `7 1,2 * * *` (daily 21:00): every UTC hour that can be
  a slot in EST or EDT. The route dispatches only when New York time is within
  90 minutes after a slot and the slot starts at or after
  `JOB_BOARD_SCHEDULE_START` (when set); other firings return
  `skipped: outside-slot`. The run ID comes from the slot start
  (`job-board-hour-<UTC hour>`), so in EDT the second firing of a slot is
  suppressed by the scheduler ledger, which the route treats as success.
- **Dispatch only.** The route wakes the API (`NEXT_PUBLIC_API_URL`) and the
  queue worker (`JOB_BOARD_WORKER_URL`, default
  `https://trackmyopt-api.onrender.com`) with up to 3 health requests each,
  then calls `POST /job-board/ingest-enabled-sources` with `API_SECRET_KEY`,
  `x-scheduler-run-id` and `x-trigger-origin: vercel_cron`, and returns. It
  does not supervise the run or retry failed sources; the health check and
  the worker's Sentry bridge cover supervision. A failed dispatch (API
  unreachable, rejected key, HTTP error, malformed reply, missing config)
  raises the Sentry issue `Scheduled job-board ingestion dispatch failed`.
- **Why not GitHub cron.** GitHub scheduled runs on this repository fired
  5–9 hours late (a `17 3 * * *` CI cron ran at 08:16–10:47 UTC; an `0 8`
  cron ran around 17:00 UTC). Such firings fall outside every 90-minute slot
  window and were correctly ignored, so the 14:00 slot on 2026-10-15 never
  ran. Vercel crons on this project fire on time.
- **No overlap.** A full run (scheduled or manual) is deferred while any other
  run still has a waiting, delayed, paused or active Bull job in either lane.
  This is Bull state, not a lock with a TTL: an active job keeps its lock for
  as long as the worker runs it, so a long run cannot expire into an overlap.
  Audits left `started` by a killed process do not block runs; the health
  check reports them as stalled.
- **Website API never touches the queues.** With
  `JOB_BOARD_WORKER_ENABLED=false` a process registers no Bull consumers and
  skips the boot pause guard, so its deployments cannot pause or resume the
  worker's queues. It can still enqueue runs and serve jobs.
- **Redis.** The worker logs an error on boot when Redis `maxmemory-policy` is
  anything but `noeviction`, because evicted keys silently drop Bull jobs.
- **Targeted recovery.**
  `POST /job-board/ops/ingestion-runs/:runId/recover-failed` (needs
  `JOB_BOARD_QUEUE_CONTROL_ENABLED=true`) requeues only manifest sources whose
  latest audit failed and that have no pending job. Succeeded and
  still-started sources are never requeued, so repeated calls are safe.
  The retry keeps the run ID and its original `runStartedAt`.
- **Health check.** The cron runs every 3 hours, which caps a persistent
  problem at about 8 events a day per kind (Sentry free-plan quota). It raises
  separate Sentry issues for:
  - a slot with no queued dispatch 3 hours after it was due;
  - a source still `started` after 90 minutes;
  - Oracle error codes;
  - failed sources (latest audit per source only).

## Pausing the schedule

- Stop new scheduled runs: set Vercel env `JOB_BOARD_SCHEDULE_ENABLED=false`
  (or remove it) for Production and redeploy; env changes only apply to new
  deployments. The cron then returns `skipped: disabled`.
- Stop work already queued: use the existing queue pause controls
  (`JOB_BOARD_QUEUE_CONTROL_ENABLED` endpoints, or
  `JOB_BOARD_QUEUE_PAUSE_ON_BOOT` on the worker).
- While the schedule is paused, also set
  `JOB_BOARD_INGESTION_HEALTH_ENABLED=false` or move
  `JOB_BOARD_SCHEDULE_START` forward; otherwise skipped slots are reported as
  `missing-run`.
- Recover a missed slot by dispatching the workflow with `manual_run_id`
  `job-board-hour-<UTC hour of the slot>` (the ledger still suppresses a
  duplicate if the slot did run).

## Infrastructure to change (owner approval)

| Change | Why | Cost per month |
|---|---|---|
| Render Key Value `trackmyopt-queue`: Free → Starter, persistence on, `maxmemory-policy` `noeviction` | Today: no persistence and `allkeys_lru`, so a restart or memory pressure can drop queued jobs | about $10 |
| Render `trackmyopt-api` (worker): Free → Starter | Free web services sleep after 15 minutes without inbound requests; this killed the amboss run mid-commit | about $7 |
| `TrackmyOPT`: set `JOB_BOARD_WORKER_ENABLED=false` | Makes `trackmyopt-api` the only consumer | $0 (already Starter) |
| `trackmyopt-api`: set `JOB_BOARD_QUEUE_PAUSE_ON_BOOT=false` | Steady state; keep it as an emergency switch | $0 |
| GitHub Actions minutes (manual runs only) | Public repository | $0 |
| Vercel cron (two entries) | Project is on Pro | $0 extra |

Check current prices in the Render dashboard before upgrading.

## Activation order

1. Upgrade Key Value. Confirm `noeviction` and persistence. Upgrade the
   worker plan.
2. Deploy this code to both services. Set `JOB_BOARD_WORKER_ENABLED=false` on
   `TrackmyOPT`, then `JOB_BOARD_QUEUE_PAUSE_ON_BOOT=false` on the worker, and
   redeploy the worker.
3. Verify via `GET /job-board/ops/ingestion-queue`: queues empty and not paused.
4. Run the hash backfill (below) as one supervised manual run.
5. Set Vercel `JOB_BOARD_INGESTION_HEALTH_ENABLED=true` and
   `JOB_BOARD_SCHEDULE_START` (ISO time the schedule is switched on; slots
   before it are never reported missing or dispatched, and unset disables the
   missing-run check), then apply migration
   `20261015194933_job_board_vercel_cron_trigger_origin.sql` (allows
   `trigger_origin = 'vercel_cron'`) before the API that accepts it is
   deployed, and set the Vercel env `JOB_BOARD_SCHEDULE_ENABLED=true` and
   redeploy. The old repository variable `JOB_BOARD_SCHEDULE_ENABLED` no
   longer has any effect. Optionally set the repository variable
   `JOB_BOARD_AUTO_RECOVER_FAILED=true` (manual workflow runs) after a week of
   clean runs.

## Hash backfill (first full run)

About 9,700 open jobs across 169 sources have no `content_hash` yet. Their
first run writes each job once (about 0.8 s per job, measured), and later
runs only confirm them.

1. **Preconditions:**
   - PR #89 (20-hour removal rule) is deployed;
   - the worker and Redis upgrades are in place;
   - the queues are empty and not paused;
   - no `started` audits for live runs.
2. **Dispatch** through the workflow with `manual_run_id`
   `job-board-manual-hash-backfill-<date>`. Keep the default pacing.
3. **Expected duration:** about 2–2.5 hours of database work. The workflow
   supervises for 120 minutes; if that deadline passes, re-dispatch with
   `monitor_only=true` and the same run ID. Source jobs keep running.
4. **Watch for:**
   - `incremental plan` log lines;
   - stage watchdog warnings longer than 10 minutes;
   - any `ORA-` or `NJS-` error.
   Do not retry a source that hung at COMMIT; diagnose it with
   `apps/api/sql/oracle/ingestion-commit-diagnostics.sql`.
5. **Expected removals:** jobs that went stale on 2026-10-14 and are still
   absent move to `removed` (the 20-hour window has passed). That is the
   intended rule; compare counts per source afterwards.

Later runs take a few minutes of database work. With
`JOB_BOARD_PACING_WINDOW_MS=900000` (15 minutes) a full run is about 15–20
minutes end to end.

## Oracle Text search index maintenance

The CONTEXT index `ADMIN.TRACKMYOPT_JOB_SEARCH_CTX_IDX` syncs `ON COMMIT`, so
every ingestion commit also updates it, and it fragments over time.

- **Incident (2026-10-15):** the index had grown to 12.1M `$I` rows (against
  about 366k distinct tokens) with 45,779 deleted docids. One source's
  commit-time sync (amboss) ran on CPU for more than 14 hours; the session was
  killed at 15:42 UTC.
- **Fix:** a one-off `CTX_DDL.OPTIMIZE_INDEX` `FULL` took 13 minutes and
  reduced the index to 417,841 rows and 0 deleted docids.
- **Ongoing:** the ADMIN `DBMS_SCHEDULER` job `TRACKMYOPT_SEARCH_IDX_OPTIMIZE`
  runs `OPTIMIZE_INDEX` `FULL` (maxtime 30 minutes) daily at 09:00 UTC,
  outside the ingestion slots.

Check the job:

```sql
select state, last_start_date, last_run_duration
from dba_scheduler_jobs
where job_name = 'TRACKMYOPT_SEARCH_IDX_OPTIMIZE';
```

Check fragmentation (a row count far above the distinct-token count means the
index needs optimizing):

```sql
select count(*), count(distinct token_text)
from ADMIN."DR$TRACKMYOPT_JOB_SEARCH_CTX_IDX$I";
```
