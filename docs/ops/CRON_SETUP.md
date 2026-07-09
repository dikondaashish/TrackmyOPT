# Cron jobs

## Scheduler policy

| Scheduler | Jobs |
|-----------|------|
| **Vercel Cron** (`apps/web/vercel.json`) | **USCIS case status batch only** — `/api/cron/check-case-status` |
| **cron-job.org** | All other cron routes (emails, PostHog sync, reminders, D1 nudge, etc.) |

All routes use **`Authorization: Bearer <CRON_SECRET>`**. If `CRON_SECRET` is unset, routes return **503** (fail-closed). Auth: `lib/api/verify-cron-auth.ts`.

---

## Vercel Cron (case status only)

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/check-case-status` |
| **Method** | `GET` |
| **Schedule** | Daily **14:00 UTC** (9 AM ET) — `0 14 * * *` in `apps/web/vercel.json` |
| **Auth** | Vercel invokes with `CRON_SECRET` automatically when configured in project env |

Do **not** duplicate this job on cron-job.org.

---

## cron-job.org jobs

Configure each with **GET** + `Authorization: Bearer <CRON_SECRET>`.

### D1 activation nudge

Emails free users who **completed onboarding ≥24h ago** but **never opened the dashboard** (one email per user).

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/d1-activation-nudge` |
| **Schedule** | Every hour (`0 * * * *`) |

```bash
curl -sS "https://www.trackmyopt.com/api/cron/d1-activation-nudge" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

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
| **Schedule** | Weekly (e.g. Monday 7:00 AM UTC) |
| **Env** | `POSTHOG_PARTNER_GROUPS_SYNC_ENABLED=true` |

### Other cron-job.org routes

See route headers in `apps/web/app/api/cron/`:

- `send-daily-reminders` — daily OPT reminders (premium)
- `send-document-reminders` — document expiry
- `retry-pending-emails` — every 30 min
- `scan-nearby-cases` — every 15 min
- `checkout-recovery-emails`, `free-receipt-reengagement`, `welcome-free-resend`
