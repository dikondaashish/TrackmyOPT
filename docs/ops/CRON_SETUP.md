# Cron jobs

## Scheduler policy

| Scheduler | Jobs |
|-----------|------|
| **Vercel Cron** (`apps/web/vercel.json`) | Case digests, case deadline reminders, case status, community OPT ingest, checkout recovery, D1 activation nudge, retry-pending emails, job-board ingestion schedule and health (among others; see the file) |
| **cron-job.org** (external; configured outside the repo) | Daily reminders, document reminders, STEM OPT window alert, plus optional backups and one-off campaigns (free-receipt reengagement, welcome-free resend, at-risk, PostHog syncs) |
| **GitHub Actions** (`.github/workflows`) | No workflow calls `/api/cron/*`. `job-board-ingestion.yml` is `workflow_dispatch` only (manual supervised run against the Render API; the daily schedule is the Vercel cron `job-board-ingestion-dispatch`); `official-processing-freshness.yml` runs weekly (`0 8 * * 1`) and is not a cron-route trigger |
| **Not defined in repo** | `filings-health` (comment says "daily keep-warm probe"; no scheduler found) |
| **Disabled** | `scan-nearby-cases` (always returns 410) |

All routes except `scan-nearby-cases` use **`Authorization: Bearer <CRON_SECRET>`**, checked by `verifyCronAuth` in `lib/api/verify-cron-auth.ts` (constant-time compare). If `CRON_SECRET` is unset, routes return **503** (fail-closed); a missing or wrong header returns **401**. `send-case-digests` and `send-case-deadline-reminders` are wrapped in `observeCaseWorker` (`lib/case-status/worker-observability.ts`), which calls `verifyCronAuth`.

---

## Vercel Cron

Entries in `apps/web/vercel.json` (not exhaustive; the file is authoritative):

| Path | Schedule | Notes |
|------|----------|-------|
| `/api/cron/send-case-digests` | Hourly at :30 (`30 * * * *`) | Weekly case digest emails for users with `case_digest_preferences.enabled`; processes up to 20 candidates per run. Supports `?dry_run=1` |
| `/api/cron/send-case-deadline-reminders` | Hourly (`0 * * * *`) | Opt-in case deadline notices (3-day horizon); atomic claims prevent double sends. Supports `?dry_run=1` |
| `/api/cron/check-case-status` | Daily **14:00 UTC** (`0 14 * * *`) | Triggers the USCIS status-check batch on the API service (`NEXT_PUBLIC_API_URL` + `API_SECRET_KEY`) — do **not** duplicate on cron-job.org |
| `/api/cron/ingest-community-opt` | Daily **15:30 UTC** (`30 15 * * *`) | Ingests partner community OPT timelines (opt-tracker.com, opt-pulse.vercel.app); not USCIS Case Status API data |
| `/api/cron/checkout-recovery-emails` | Every **4 hours** (`0 */4 * * *`) | Abandoned checkout resume (Phase 5) |
| `/api/cron/d1-activation-nudge` | Hourly (`0 * * * *`) | Free signups ≥24h with no dashboard view (Phase 4) |
| `/api/cron/retry-pending-emails` | Hourly at :15 (`15 * * * *`) | Re-send stuck `email_queue` pending rows |
| `/api/cron/job-board-ingestion-dispatch` | `7 18,19 * * 1-5` and `7 1,2 * * *` | Daily job-board ingestion scheduler (Mon–Fri 14:00 and 21:00, Sat–Sun 21:00 New York); no-op outside a slot or unless `JOB_BOARD_SCHEDULE_ENABLED=true`. See `docs/ops/ingestion-automation.md` |
| `/api/cron/job-board-ingestion-health` | `20 */3 * * *` | Job-board ingestion health alerts; needs `JOB_BOARD_INGESTION_HEALTH_ENABLED=true` |

**Auth:** Vercel invokes with `CRON_SECRET` automatically when configured in project env.  
**Plan note:** Hourly/`*/4` schedules require **Vercel Pro** (Hobby is once-per-day only).

---

## Routes not in `vercel.json`

| Path | Scheduler | Notes |
|------|-----------|-------|
| `/api/cron/send-daily-reminders` | cron-job.org (per route header comment) | Premium OPT timeline reminders; suggested `0 14 * * *` (14:00 UTC = 9 AM ET) |
| `/api/cron/send-document-reminders` | cron-job.org (per route header comment) | Document reminders due today; daily 14:00 UTC |
| `/api/cron/stem-opt-window-alert` | cron-job.org (per route header comment) | See below |
| `/api/cron/at-risk-reengagement` | cron-job.org (per route header comment) | See below |
| `/api/cron/posthog-ltv-sync` | cron-job.org (per route header comment) | See below |
| `/api/cron/posthog-partner-groups-sync` | cron-job.org (per route header comment) | See below |
| `/api/cron/free-receipt-reengagement` | cron-job.org, one-off | See below |
| `/api/cron/welcome-free-resend` | cron-job.org, one-off (manual) | Resends `welcome_free` to users whose welcome failed with SMTP 535 auth errors. Needs `WELCOME_FREE_RESEND_ENABLED=true`; `limit` (default 25) and `dry_run=true` params; disable after `remaining=0` |
| `/api/cron/filings-health` | Scheduler not defined in repo | Keep-warm probe: reads one row from `h1b_filings` on the secondary filings Supabase project; 503 on failure |
| `/api/cron/scan-nearby-cases` | **Disabled — do not schedule** | Permanently disabled for USCIS API compliance; always returns **410** (`nearby_scan_disabled`) and has no auth check. Pause any cron-job.org job still pointing at it |

The former cron-job.org route `/api/cron/ingest-job-board` was removed on 2026-10-15; job-board ingestion is scheduled only by the Vercel cron `job-board-ingestion-dispatch`. Delete any cron-job.org job still pointing at the old path (it now returns 404).

## cron-job.org jobs

Configure each with **GET** + `Authorization: Bearer <CRON_SECRET>`. Prefer **not** duplicating Vercel Cron paths above.

### D1 activation nudge (optional backup)

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/d1-activation-nudge` |
| **Schedule** | Every hour (`0 * * * *`) — skip if Vercel cron is live |

```bash
curl -sS "https://www.trackmyopt.com/api/cron/d1-activation-nudge" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Free-receipt reengagement (one-off campaign)

Not a standing cron. Set `FREE_RECEIPT_REENGAGEMENT_ENABLED=true`, run until `remaining=0`, then disable.

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/free-receipt-reengagement?limit=25` |

### STEM OPT window alert

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/stem-opt-window-alert` |
| **Schedule** | Daily **9:00 AM UTC** |

### At-risk reengagement

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/at-risk-reengagement` |
| **Schedule** | Weekly (e.g. Monday 15:00 UTC) |
| **Env** | `AT_RISK_REENGAGEMENT_ENABLED=true` |

### PostHog LTV sync

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/posthog-ltv-sync` |
| **Schedule** | Daily **6:00 AM UTC** |
| **Env** | `POSTHOG_LTV_SYNC_ENABLED=true` |

### PostHog partner groups sync

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/posthog-partner-groups-sync` |
| **Schedule** | Weekly (route comment suggests Monday 7:00 AM UTC) |
| **Env** | `POSTHOG_PARTNER_GROUPS_SYNC_ENABLED=true` |

Case syncing now includes every enrolled case, including free accounts and secondary
cases. See [daily case sync](DAILY_CASE_SYNC.md) for display gating, refresh sequence,
provider limits, retries, and monitoring.
