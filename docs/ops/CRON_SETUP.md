# Cron jobs

## Scheduler policy

| Scheduler | Jobs |
|-----------|------|
| **Vercel Cron** (`apps/web/vercel.json`) | Case status, checkout recovery, D1 activation nudge, retry-pending emails |
| **cron-job.org** | Optional backups + one-off campaigns (free-receipt reengagement, at-risk, PostHog sync, STEM alerts, etc.) |

All routes use **`Authorization: Bearer <CRON_SECRET>`**. If `CRON_SECRET` is unset, routes return **503** (fail-closed). Auth: `lib/api/verify-cron-auth.ts`.

---

## Vercel Cron

| Path | Schedule | Notes |
|------|----------|-------|
| `/api/cron/check-case-status` | Daily **14:00 UTC** (`0 14 * * *`) | USCIS batch — do **not** duplicate on cron-job.org |
| `/api/cron/checkout-recovery-emails` | Every **4 hours** (`0 */4 * * *`) | Abandoned checkout resume (Phase 5) |
| `/api/cron/d1-activation-nudge` | Hourly (`0 * * * *`) | Free signups ≥24h with no dashboard view (Phase 4) |
| `/api/cron/retry-pending-emails` | Hourly at :15 (`15 * * * *`) | Re-send stuck `email_queue` pending rows |

**Auth:** Vercel invokes with `CRON_SECRET` automatically when configured in project env.  
**Plan note:** Hourly/`*/4` schedules require **Vercel Pro** (Hobby is once-per-day only).

---

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
| **Schedule** | Daily |
