# Phase 2 — Product Funnel Completeness

**Date:** 2026-07-05  
**PostHog project:** [369087](https://us.posthog.com/project/369087)

---

## Dashboards

| Dashboard | URL | Tiles |
|-----------|-----|-------|
| Blog → Product CTA Funnel | [1802532](https://us.posthog.com/project/369087/dashboard/1802532) | CTA clicks daily, CTA→signup funnel, CTA by variant |
| Job Tracker + Extension | [1802533](https://us.posthog.com/project/369087/dashboard/1802533) | Web vs extension jobs, Resume generator events |

---

## Cohorts

| Cohort | ID | Definition |
|--------|-----|------------|
| Activated (receipt added) | [396173](https://us.posthog.com/project/369087/cohorts/396173) | Performed `receipt_added` ≥1 |
| Pro users | [396174](https://us.posthog.com/project/369087/cohorts/396174) | `premium_status = true` |
| At-risk (no return 14d) | [396175](https://us.posthog.com/project/369087/cohorts/396175) | Signed up in 90d, no `$pageview` in 14d |

---

## Saved heatmaps

| Page | Short ID | Status |
|------|----------|--------|
| [Homepage](https://www.trackmyopt.com/) | `2XzojNQl` | Processing |
| [Login](https://www.trackmyopt.com/login) | `xXmSkk23` | Processing |
| [Dashboard](https://www.trackmyopt.com/dashboard) | `ZKnOobEA` | Processing |

Heatmaps render asynchronously in PostHog → Web analytics → Heatmaps.

---

## Resume events (2.1)

Instrumented in `app/dashboard/career/resume-generator/editor/page.tsx`:

| Event | Trigger | Key properties |
|-------|---------|----------------|
| `resume_generated` | AI returns LaTeX | `template_id`, `job_description_length` |
| `resume_ats_scored` | ATS scan / generate / regen | `score`, `ats_score`, `scan_source`, `auto_regen_count` |
| `resume_downloaded` | PDF download | `ats_score`, `filename`, `had_gate_warning` |
| `resume_compiled` | Server PDF compile | `capture_source: server` in `compile/route.ts` |

**Note:** 0 events in last 30d — code not yet deployed to production; validate after next deploy.

---

## `capture_source` standardization (2.6)

All product events now flow through wrappers:

| Layer | Wrapper | `capture_source` |
|-------|---------|------------------|
| Client | `captureClientEvent()` | `"client"` (auto) |
| Server | `captureServerEvent()` | `"server"` (auto) |

**Migrated in Phase 2:**

- `job-tracker/actions.ts` — create, status update, delete
- `api/extension/job-application/route.ts` — `extension_job_added`
- `api/documents/upload/route.ts` — `document_uploaded`
- `auth/signout/route.ts` — `user_signed_out`
- `opt-health-insurance-finder/*` — eligibility + plan click via `captureInsurance*()` helpers
- `captureSignOut()` — routes through `captureClientEvent()` (flush + reset preserved)

Wrappers set `capture_source` **last** so callers cannot override it.

**Remaining direct `posthog.capture`:** only inside `lib/posthog-client.ts` (`captureClientEvent`) and `lib/posthog-server.ts` (`captureServerEvent` / group fallback).

**Regression tests:** `lib/posthog/__tests__/capture-source.test.ts`

---

## Phase 2 exit criteria — met

| Step | Status |
|------|--------|
| 2.1 Resume events | ✅ Code complete |
| 2.2 Blog dashboard | ✅ |
| 2.3 Job tracker dashboard | ✅ |
| 2.4 Cohorts | ✅ |
| 2.5 Heatmaps | ✅ Created (render pending) |
| 2.6 capture_source | ✅ |
