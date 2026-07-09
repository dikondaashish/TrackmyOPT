# USCIS Torch API — Emergency Compliance (July 2026)

TrackMyOPT received a USCIS Torch API compliance notice regarding sequential
neighbor receipt lookups. This document records the remediation and production checklist.

## What changed

| Task | Summary |
|------|---------|
| **C** | Kill switch: `NEARBY_SCAN_ENABLED=false` (default). Scan endpoints return **410 Gone**. Fire-and-forget triggers removed. |
| **B** | `fetchCaseStatus({ receiptNumber, userId, callSite })` — sole Next.js entry point. NestJS mirror in `apps/api/src/uscis/uscis-client.ts`. Enrollment guard + `uscis_api_audit` logging. |
| **D** | `uscis_case_cache.quarantined` — all existing rows marked `true`. UI: Nearby Cases tab removed. |
| **E** | Compliance tests under `apps/web/lib/uscis/__tests__/` and `apps/web/app/api/case-status/__tests__/`. |

## Migrations (apply to production Supabase)

1. `supabase/migrations/20260709120000_uscis_api_audit.sql`
2. `supabase/migrations/20260709130000_uscis_case_cache_quarantine.sql`

**Do not** edit `20260614130000_uscis_case_cache.sql` — preservation obligation.

## Manual production checklist

### cron-job.org — PAUSE immediately

| Job name / URL | Action |
|----------------|--------|
| **`scan-nearby-cases`** → `GET https://www.trackmyopt.com/api/cron/scan-nearby-cases` | **Pause / disable** |

Leave all other cron-job.org jobs as-is unless you know they are unrelated.

### Vercel Cron — LEAVE ON

| Route | Schedule | Action |
|-------|----------|--------|
| `/api/cron/check-case-status` | Daily 14:00 UTC | **Keep enabled** — enrolled receipts only |

### Environment variables (production + preview)

| Variable | Required value | Notes |
|----------|----------------|-------|
| `NEARBY_SCAN_ENABLED` | `false` | **Unset also defaults to off.** Never set `true` without counsel + USCIS approval. |
| `USCIS_CLIENT_ID` | (existing) | Unchanged |
| `USCIS_CLIENT_SECRET` | (existing) | Unchanged |
| `CRON_SECRET` | (existing) | Required for internal check routes |
| `NEXT_PUBLIC_API_URL` | (existing) | NestJS worker for daily batch |
| `API_SECRET_KEY` | (existing) | NestJS auth for check-all |

### Deploy order

1. **Merge & deploy Task C first** (kill switch) — stops new neighbor scans immediately.
2. Apply Supabase migrations.
3. Deploy Task B + D commits.
4. Pause `scan-nearby-cases` on cron-job.org if not already paused.
5. Email `developersupport@uscis.dhs.gov` with remediation summary.

### Authorized USCIS API use (post-fix)

- User enrolls their own receipt in `case_status`.
- Lookups only when `case_status.user_id` matches the requesting `userId`.
- Daily batch via NestJS `check-all` queues one job per enrolled row.

### Preserved (not deleted)

- `uscis_case_cache` rows (quarantined).
- `lib/case-status/scan-nearby.ts`, `receipt-cohort.ts` (dead behind flag).
- All `uscis_api_audit` and existing logs.

## Files changed by task

### Task C (`6d22932`)

- `apps/web/lib/uscis/nearby-scan.ts` (new)
- `apps/web/lib/case-status/receipt-cohort.ts`
- `apps/web/lib/case-status/scan-nearby.ts`
- `apps/web/app/api/cron/scan-nearby-cases/route.ts`
- `apps/web/app/api/case-status/nearby/scan/route.ts`
- `apps/web/app/api/case-status/nearby/route.ts`
- `apps/web/app/api/case-status/route.ts` (removed enroll warm-up)
- `.env.example`

### Task B (`cba5446`)

- `supabase/migrations/20260709120000_uscis_api_audit.sql`
- `apps/web/lib/uscis/client.ts`, `enrollment-guard.ts`, `errors.ts`, `receipt-hash.ts`
- `apps/web/lib/immigration/uscis-checker.ts`
- `apps/web/app/api/case-status/check/route.ts`
- `apps/web/app/api/case-status/refresh/route.ts`
- `apps/api/src/uscis/enrollment-guard.ts`, `uscis-client.ts`, `uscis.service.ts`, `uscis.processor.ts`

### Task D

- `supabase/migrations/20260709130000_uscis_case_cache_quarantine.sql`
- `apps/web/lib/case-status/cohort-analytics.ts`
- `apps/web/components/dashboard/case-status/redesign/AnalyticsTabs.tsx`
- `apps/web/components/dashboard/case-status/redesign/PredictionPanel.tsx`

### Task E

- `apps/web/lib/uscis/__tests__/*.test.ts`
- `apps/web/lib/case-status/__tests__/cohort-quarantine.test.ts`
- `apps/web/lib/case-status/__tests__/receipt-cohort.test.ts`
- `apps/web/app/api/case-status/__tests__/nearby-route.test.ts`
- `apps/web/app/api/case-status/__tests__/check-ownership.test.ts`
