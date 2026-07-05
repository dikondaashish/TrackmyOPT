# Phase 1 — Activation Drop Investigation

**Date:** 2026-07-05  
**PostHog project:** [369087](https://us.posthog.com/project/369087)  
**North Star dashboard:** [Signup → Receipt → Retention](https://us.posthog.com/project/369087/dashboard/1802474)

---

## Funnel snapshot (30d, unique users, 14-day window, test accounts filtered)

| Step | Users | Conversion | Drop |
|------|------:|-----------:|-----:|
| `user_signed_up` | 465 | 100% | — |
| `onboarding_completed` | 212 | 45.6% | **54.4%** |
| `receipt_added` | 45 | 9.7% | **90.3%** (of onboarding completers) |

Median time signup → onboarding: **1m 9s**  
Median time onboarding → receipt: **27s**

---

## Receipt sub-funnel (30d)

| Event | Users (30d) |
|-------|------------:|
| `onboarding_receipt_prompt_shown` | 46 |
| `receipt_added` (from prompt cohort) | 32 (69.6%) |
| `onboarding_receipt_skipped` | 10 total events (not sequential — users skip instead of add) |

`onboarding_completed` breakdown by `skipped`:

- `skipped: false` — users who finished all wizard steps (~50% of completions)
- `skipped: true` — wizard dismissed (Escape/outside click) or explicit skip path (~50%)

---

## Root-cause hypotheses (ranked)

### H1 — Receipt is optional and most users skip (primary driver of 90% drop)

The receipt step is skippable by design. ~50% of `onboarding_completed` events have `skipped: true`. Users can reach onboarding completion without ever adding a USCIS receipt, so the signup → receipt funnel **overstates** product failure — it measures optional activation, not required setup.

**Evidence:** 10 `onboarding_receipt_skipped` events in 30d; receipt prompt → add rate 69.6% among those who see the prompt.

### H2 — Six-step wizard friction causes signup → onboarding drop (54%)

465 signups vs 212 onboarding completions. Users who OAuth-sign-up may land on dashboard, dismiss the wizard (ISS-006/007), and never return to complete profile fields (course, dates, status).

**Evidence:** Median onboarding completion 1m after signup suggests engaged users finish quickly; the 54% who don't complete likely never start or dismiss early.

### H3 — Identity gap inflated anonymous funnel steps (partially fixed in Phase 1)

Pre-Phase-1, `$identify` only ran in the dashboard shell. Login and OAuth journeys were anonymous until `/dashboard`, under-counting returning users in funnels.

**Fix shipped:** `LoginPostHogIdentify`, email signup `user_signed_up` + identify, enriched OAuth server identify with `signup_date` / `activation_state`.

### H4 — Week-1 retention ~5% amplifies the leaky bucket

Users who skip receipt have no case status to check → no reason to return. North Star retention insight shows ~4–6% week-1 return on recent signup cohorts.

---

## Recommended actions

| Priority | Action | Owner | Effort |
|----------|--------|-------|--------|
| P0 | Track **activated** users via `activation_state` person property (shipped) + cohort `activation_state = activated` | Analytics | Done |
| P1 | Dashboard checklist nudge for `no_receipt` users (product) — already exists post-wizard dismiss | Product | Monitor CTR |
| P1 | North Star daily check: activation funnel + receipt skip trend | Founder | 2 min/day |
| P2 | **Experiment (Phase 3):** receipt prompt variant — defer to day-2 email vs in-wizard required | Growth | 1 sprint |
| P2 | Shorten wizard from 6 → 3 steps (course+dates combined, receipt deferred) | Product | 2–3 days |

---

## Experiment plan (Phase 3)

**Flag:** `onboarding-receipt-variant`  
**Variants:**

- `control` — current optional receipt step in wizard
- `deferred` — skip receipt in wizard; show checklist CTA on dashboard hub for 7 days
- `required` — block wizard finish until receipt entered (holdout 10%)

**Primary metric:** `activation_state = activated` within 14 days of signup  
**Guardrails:** onboarding completion rate, week-1 retention, support tickets

---

## Phase 1 exit criteria — met

| Step | Status |
|------|--------|
| 1.1 Identify on login | ✅ Login + email auth + OAuth callback |
| 1.2 `onboarding_receipt_skipped` | ✅ 10 events in 30d |
| 1.3 `has_receipt`, `activation_state`, `signup_date` | ✅ Person properties on identify |
| 1.4 North Star dashboard | ✅ [Dashboard 1802474](https://us.posthog.com/project/369087/dashboard/1802474) |
| 1.5 Drop investigation | ✅ This document |
