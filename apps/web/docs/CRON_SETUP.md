# Cron jobs (cron-job.org → TrackMyOPT)

Protected routes use **`Authorization: Bearer <CRON_SECRET>`** (same secret as `CRON_SECRET` in Vercel).

**Security:** If `CRON_SECRET` is not set in the environment, all cron routes return **503 Cron not configured** (fail-closed). Auth is centralized in `lib/api/verify-cron-auth.ts`.

---

## STEM OPT Window Alert

Sends when a user’s **OPT EAD end date** falls in the **90-day STEM filing window** (detected as `opt_ead_end_date` between **today + 89 days** and **today + 91 days** UTC, with ±1 day for schedule drift). Uses `email_queue` with `email_type = stem_opt_window_open` and 60-day dedupe per user.

| Field | Value |
|--------|--------|
| **URL** | `https://www.trackmyopt.com/api/cron/stem-opt-window-alert` |
| **Method** | `GET` |
| **Header** | `Authorization: Bearer <CRON_SECRET>` |
| **Schedule** | Every day at **9:00 AM UTC** |
| **Expected response** | `200` JSON with `success`, `processed`, `sent`, `skipped_dedup`, `skipped_blocked`, `failed` |

**Manual test**

```bash
curl -sS "https://www.trackmyopt.com/api/cron/stem-opt-window-alert" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Daily reminders (reference)

See `app/api/cron/send-daily-reminders/route.ts` for the daily OPT reminder job (premium users, tool emails). Configure similarly on cron-job.org with the same auth header pattern.
