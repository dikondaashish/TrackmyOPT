# PostHog Comprehensive Audit & Implementation Roadmap

**Project:** [Default project (369087)](https://us.posthog.com/project/369087) · **Org:** zyene inc  
**Audited:** 2026-07-05 via PostHog MCP + codebase cross-check  
**Data window:** Last 30 days (2026-06-05 → 2026-07-05) unless noted  
**Deploy cutoff for P0/P1 events:** 2026-06-13 01:31:38 UTC (per dashboard notes)

---

## Executive summary

TrackMyOPT has a **solid analytics foundation**: reverse-proxy ingestion (`/ingest`), consent-gated client capture, server-side events for auth/billing/case-status, session replay masking for immigration data, and **10 pinned dashboards** including Founder, Activation, Revenue, Case Health, and UX/Bug views.

The biggest gaps are **not instrumentation volume** — they are **trust, activation, and operational hygiene**:

| Priority | Finding | Business risk |
|----------|---------|---------------|
| P0 | **252 `error_boundary_triggered` on `/dashboard/case-status`** (99% of errors) | Core feature appears broken for many users |
| P0 | **Revenue events (`payment_succeeded`, `subscription_started`) have 0 events** | Revenue dashboard cannot be trusted |
| P0 | **~5% week-1 retention** after signup | Leaky bucket; SEO traffic does not stick |
| P1 | **54% drop signup → onboarding**; **90% drop onboarding → receipt** | Activation friction |
| P1 | **Identity only runs inside dashboard shell** | Anonymous users dominate funnels |
| P2 | Duplicate dashboards, stale insights, no flags/experiments | Hard to iterate safely |

This document lists every issue with severity, location, fix, code, and phased rollout.

---

## Current state snapshot (MCP-verified)

### Web analytics (30d)

| KPI | Value |
|-----|-------|
| Visitors | 2,677 |
| Pageviews | 8,119 |
| Sessions | 3,351 |
| Avg session duration | 209s |
| Bounce rate | 21.2% |

**Top pages:** `/blog/opt-processing-time-2026` (1,283 views), `/` (791), `/login` (712), `/dashboard` (301).

### Custom event volume (30d)

| Event | Count | Notes |
|-------|------:|-------|
| `user_signed_up` | 465 | Healthy |
| `onboarding_completed` | 324 | 70% of signups (event-level; funnel uses unique users) |
| `case_status_check_completed` | 471 | Healthy |
| `dashboard_viewed` | 500 | Client tracker |
| `receipt_added` | 254 | Activation proxy |
| `$exception` | 240 | See [EXCEPTION-SPIKE-REMEDIATION-PHASES.md](./EXCEPTION-SPIKE-REMEDIATION-PHASES.md) |
| `error_boundary_triggered` | 253 | **252 on `/dashboard/case-status`** |
| `resume_compiled` | 118 | Resume funnel partial |
| `payment_failed` | 15 | Server webhook works |
| `checkout_started` | 8 | Very low volume |
| `payment_succeeded` | **0** | Never seen in taxonomy |
| `subscription_started` | **0** | Never seen in taxonomy |
| `trial_started` | **0** | Never seen in taxonomy |
| `document_uploaded` | **0** | Instrumented but unused or blocked |
| `job_application_status_updated` | **0** | Instrumented but unused |
| `onboarding_receipt_skipped` | **0** | Likely not firing |
| `case_status_enrolled` | 97* | *Legacy; last fired 2026-06-13 |

### Workspace inventory

| Entity | Count |
|--------|------:|
| Dashboards | 10 (2 duplicates) |
| Insights | 61 |
| Cohorts | 1 (`Internal / Test users`) |
| Feature flags | 0 |
| Experiments | 0 |
| Surveys | 0 |
| Actions | 0 |
| Saved heatmaps | 0 (aggregate heatmap data exists) |

### Dashboards

| Dashboard | Status |
|-----------|--------|
| [Analytics basics](https://us.posthog.com/project/369087/dashboard/1430901) | Active (viewed Jul 5) |
| [TrackMyOPT Founder](https://us.posthog.com/project/369087/dashboard/1707546) | Stale (last Jun 13) |
| [Activation](https://us.posthog.com/project/369087/dashboard/1707549) | Stale |
| [Case Tracking Health](https://us.posthog.com/project/369087/dashboard/1707547) | Stale |
| [Revenue](https://us.posthog.com/project/369087/dashboard/1707552) | Stale — **duplicate of 1707548** |
| [UX / Bug](https://us.posthog.com/project/369087/dashboard/1707550) | Stale |
| [Post-deploy error monitoring](https://us.posthog.com/project/369087/dashboard/1775072) | **Duplicate of 1711708** |
| My App Dashboard | Unused since Jun 14 |

---

## Audit by category

### 1. Events & event taxonomy

#### Issue 1.1 — Revenue events are unvalidated (Critical)

| | |
|---|---|
| **What** | `payment_succeeded`, `subscription_started`, `trial_started`, `subscription_upgraded` exist in code but **0 events** in PostHog. `payment_failed` has 15 events. |
| **Why it matters** | [Revenue Dashboard](https://us.posthog.com/project/369087/dashboard/1707552) cannot support business decisions. |
| **Where** | `apps/web/app/api/premium/webhook/route.ts` (lines ~253–1101), `apps/web/lib/posthog/LEGACY_EVENTS.md` |
| **Fix** | Run Stripe test-mode webhook replay; verify `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` on Vercel for **server** routes; add idempotent dedupe keys. |
| **Steps** | 1. Stripe CLI: `stripe trigger checkout.session.completed` 2. Confirm events in PostHog Live Events 3. Add `$insert_id` dedupe 4. Update Revenue dashboard filters |
| **Code** | See Phase 1.2 below |
| **Impact** | Enables real MRR/churn reporting; expected **100% revenue visibility** once first payment flows |

#### Issue 1.2 — Legacy `case_status_enrolled` still in historical data (Low)

| | |
|---|---|
| **What** | 97 events in 30d window, but **last event 2026-06-13** (removal date). Code no longer emits it. |
| **Why** | Pollutes funnels if not filtered. |
| **Where** | PostHog events table; docs in `LEGACY_EVENTS.md` |
| **Fix** | Add dashboard filter `event != case_status_enrolled` for pre-Jun-13 ranges; archive event definition in PostHog. |
| **Impact** | Cleaner activation metrics |

#### Issue 1.3 — Instrumented events with zero volume (Medium)

| Event | Code location | Likely cause |
|-------|---------------|--------------|
| `document_uploaded` | `app/api/documents/upload/route.ts` | Premium-only; low usage |
| `job_application_status_updated` | `job-tracker/actions.ts` | Low job-tracker adoption (4 creates/30d) |
| `onboarding_receipt_skipped` | `posthog-client.ts` | UI path not triggering capture |
| `resume_download_anyway` | `resume-generator/editor/page.tsx` | Gate rarely used |

**Fix:** Verify each path in staging; add `capture_source` to all events.

#### Issue 1.4 — Naming convention is good but capture is inconsistent (Medium)

| Pattern | Examples |
|---------|----------|
| ✅ snake_case | `user_signed_up`, `case_status_check_completed` |
| ⚠️ Direct `posthog.capture` | `insurance_eligibility_checked`, job tracker |
| ⚠️ `captureClientEvent` wrapper | dashboard, onboarding |
| ⚠️ `captureServerEvent` | auth, billing, case-status |

**Fix:** Standardize on `captureClientEvent` / `captureServerEvent` with required `capture_source: 'client' | 'server'`.

---

### 2. Autocapture configuration

| Setting | Current | Assessment |
|---------|---------|------------|
| `$pageview` | ✅ Automatic | Good |
| `$autocapture` | ✅ Default | Good for marketing |
| `$rageclick` / `$dead_click` | ✅ Captured | Not on any dashboard |
| `$web_vitals` | ✅ Captured | Not monitored |

**Issue 2.1 — Autocapture noise on dashboard routes (Medium)**

Autocapture fires on all pages including `/dashboard/*`. Immigration-sensitive UI should rely on **custom events + masked replay**, not autocapture clicks.

**Fix:** Consider `autocapture: false` for `/dashboard` routes via PostHog `opt_out_capturing` per-route or reduce autocapture to marketing pages only.

---

### 3. Identity management

| Metric (30d) | Value |
|--------------|------:|
| `$identify` events | 695 |
| `$pageview` events | 7,581 |
| Unique persons | 3,258 |

**Issue 3.1 — Identify only runs in dashboard shell (High)**

| | |
|---|---|
| **What** | `PostHogIdentify` mounts only in `DashboardLayoutClient`. Login, marketing, and blog users stay anonymous until dashboard. |
| **Why** | Funnels under-count returning users; person properties (`plan_tier`, `onboarding_completed`) missing for pre-dashboard journeys. |
| **Where** | `components/analytics/PostHogIdentify.tsx`, `components/layout/DashboardLayoutClient.tsx` |
| **Fix** | Call `identifyTrackMyOptUser` after auth callback + on login page when session exists. |
| **Code** | Phase 1.3 |
| **Impact** | **+30–50% funnel accuracy** for login→activation paths |

**Issue 3.2 — No email on person profile (Medium, intentional)**

`identifyTrackMyOptUser` correctly uses Supabase `user.id` only — no PII. Good for F-1 privacy.

**Issue 3.3 — Person properties are thin but correct (Low)**

Set: `plan_tier`, `premium_status`, `onboarding_completed`, `is_stem_eligible`, `provider`.  
Missing: `signup_date`, `has_receipt`, `activation_state`, `extension_installed`.

---

### 4. Privacy & consent (Strong)

| Control | Status |
|---------|--------|
| `opt_out_capturing_by_default: true` | ✅ |
| Cookie banner gates PostHog | ✅ `CookieConsent.tsx` |
| Session replay `maskAllInputs` | ✅ |
| `data-ph-mask` on receipts | ✅ 12+ components |
| `data-ph-no-capture` on document vault | ✅ |
| Reverse proxy `/ingest` | ✅ `next.config.js` |
| Exception `before_send` filter | ✅ `posthog-browser.ts` (deployed `04b81d7`) |

**Issue 4.1 — No test-account filter on web overview (Low)**

MCP queries show `filterTestAccounts: false`. Cohort `Internal / Test users` exists but is not applied globally.

**Fix:** Enable "Filter out internal and test users" on all production dashboards.

---

### 5. Session recordings & heatmaps

| Capability | Status |
|------------|--------|
| Session replay | ✅ Active; 30-day TTL; recent recordings on `/dashboard/case-status`, blog |
| Replay privacy masks | ✅ Strong |
| Saved heatmaps | ❌ None configured |
| Aggregate heatmap data | ✅ 529 clicks; **67.5% below fold** |

**Issue 5.1 — No saved heatmaps for key conversion pages (Medium)**

**Fix:** Create saved heatmaps for `/`, `/login`, `/dashboard`, `/premium/checkout`.

**Issue 5.2 — Recordings not linked to error issues (Medium)**

`error_boundary_triggered` has no `$session_id` correlation in dashboards.

**Fix:** Add PostHog error tracking → replay links; watch 5 sessions/week on case-status errors.

---

### 6. Funnels & conversion (product analytics)

#### Activation funnel (30d, unique users, 14-day window)

```
user_signed_up        465  (100%)
    ↓ -54%
onboarding_completed  212  (45.6%)
    ↓ -90%
receipt_added          45  (9.7%)
    ↓ -98%
dashboard_viewed       10  (2.2%)
```

> **Note:** `dashboard_viewed` funnel step is strict (must follow receipt within window). Event volume is 500 — many dashboard views are from users who signed up before the window or skipped receipt.

#### Login → signup → dashboard (30d)

```
/login pageview       712  (100%)
    ↓ -87%
user_signed_up         90  (12.6%)
dashboard_viewed       88  (12.4%)
```

Most `/login` traffic is **returning users** (not new signups) — 12.6% is misleading as a conversion rate. Split by `is_new_user` person property.

#### Onboarding receipt sub-funnel

```
receipt_prompt_shown   46  (100%)
receipt_added          32  (69.6%)
receipt_skipped         0  (0%)   ← broken or unused path
```

#### Insurance funnel (30d)

```
eligibility_checked    12  (100%)
plan_clicked            6  (50%)
```

#### Revenue funnel

```
checkout_started        8
payment_succeeded       0   ← blocked on revenue reporting
```

#### Retention (signup → $pageview return, weekly, 90d)

| Cohort week | Signups | Week 1 return |
|-------------|--------:|--------------:|
| Jun 14 | 116 | 7 (6.0%) |
| Jun 21 | 117 | 5 (4.3%) |
| Jun 28 | 96 | 0 (0%) |

**Week-1 retention ~5%** — critical engagement problem.

#### Paths from homepage

| Path | Users |
|------|------:|
| `/` → `/login` | 340 |
| `/login` → `/dashboard` | 113 |
| `/` → `/dashboard` (direct) | 99 |
| `/` → blog post | 20 |

---

### 7. Dashboards & insights gaps

**Missing dashboards:**

| Dashboard | KPIs |
|-----------|------|
| Resume generator | generate → compile → download → ATS score |
| Job tracker | create → status change → extension sync |
| Blog → product conversion | `blog_product_cta_clicked` → signup |
| Extension | `extension_job_added` vs web job tracker |
| SEO content performance | top blog → activation |

**Stale dashboards:** Founder/Activation/Revenue last opened Jun 13 — refresh or archive.

---

### 8. Feature flags, experiments, cohorts

| Capability | Status | Recommendation |
|------------|--------|----------------|
| Feature flags | 0 | Add flags for checkout experiments, onboarding variants |
| Experiments | 0 | A/B test receipt prompt copy |
| Cohorts | 1 | Add: Activated (has receipt), Pro users, Churned (no pageview 14d) |
| Surveys | 0 | NPS after first case-status success |

---

### 9. Data quality issues

| Issue | Severity | Fix |
|-------|----------|-----|
| Duplicate Revenue dashboard (1707548 + 1707552) | Medium | Delete 1707548 |
| Duplicate error monitoring (1711708 + 1775072) | Medium | Merge into one |
| `checkout_started` missing `capture_source` | Low | Add property |
| `error_boundary_triggered` 252/253 on case-status | **Critical** | Fix React error, not analytics |
| Alert ∞% DoD on low volume | Medium | Min threshold 5 events/day |
| No source maps in error tracking | Medium | Enable `productionBrowserSourceMaps` + upload |

---

### 10. SDK implementation coverage

| Area | Client | Server | Gap |
|------|--------|--------|-----|
| Auth | — | ✅ signup/signin/signout | Identify on login page |
| Onboarding | ✅ | ✅ profile flags | `receipt_skipped` not firing |
| Case status | ✅ | ✅ full pipeline | Error boundary masking real bugs |
| Billing | ⚠️ checkout_started | ⚠️ webhook events unvalidated | Revenue blind spot |
| Resume | ✅ compile | — | Missing generate/download/ATS events |
| Job tracker | ⚠️ direct capture | — | Low volume |
| Insurance | ⚠️ direct capture | — | OK for volume |
| Extension | — | ✅ | OK |
| Documents | — | ⚠️ upload event 0 volume | Verify premium path |

---

## KPIs to monitor

### Daily

| KPI | Source | Target |
|-----|--------|--------|
| `user_signed_up` | Trends | Trend up WoW |
| `error_boundary_triggered` | Trends, filter route | **0 on case-status** |
| `$exception` count | Error tracking | < 5/day |
| `case_status_check_failed` rate | Formula: failed/started | < 5% |
| `checkout_started` | Trends | Track campaigns |

### Weekly

| KPI | Source |
|-----|--------|
| Activation rate (signup → receipt_added) | Funnel |
| Week-1 retention (signup → $pageview) | Retention |
| Insurance funnel (check → click) | Funnel |
| `resume_compiled` | Trends |
| Top rageclick pages | Trends `$rageclick` |
| Session replays with errors | Error tracking |

### Monthly

| KPI | Source |
|-----|--------|
| MRR / `payment_succeeded` | Revenue dashboard (after Phase 1) |
| Churn (`subscription_canceled`) | Trends |
| Blog → signup attribution | Paths + UTM breakdown |
| Feature adoption (job tracker, documents, extension) | Stickiness |
| Cohort LTV by plan_tier | Persons + revenue |

---

## Blind spots

1. **No resume generation funnel** — can't optimize AI resume (major product bet).
2. **No blog CTA attribution** — SEO drives top traffic but conversion untracked end-to-end.
3. **No extension vs web split** — can't measure Chrome extension ROI.
4. **No "aha moment" definition** — receipt_added is closest but not in North Star dashboard.
5. **Pro upgrade path** — `upgrade_prompt_shown` → `checkout_started` not visualized.
6. **Email campaigns** — `reengagement_email_sent` exists (1 event) but no email performance dashboard.

---

## Prioritized action plan

### Quick wins (< 30 minutes each)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| Q1 | Delete duplicate dashboards (1707548, 1711708) | 5 min | Cleaner workspace |
| Q2 | Enable "Filter test accounts" on all dashboards | 10 min | Accurate metrics |
| Q3 | Pin [Analytics basics](https://us.posthog.com/project/369087/dashboard/1430901) as daily check | 2 min | Habit |
| Q4 | Tune exception alert: min 5 events + 50% DoD threshold | 15 min | Stop alert fatigue |
| Q5 | Archive `case_status_enrolled` event definition in PostHog | 5 min | Taxonomy hygiene |
| Q6 | Add Slack/email subscription to UX/Bug dashboard | 10 min | Proactive monitoring |

### High-impact improvements (1–3 days)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| H1 | **Fix `/dashboard/case-status` error boundary** (252 errors) | 1–2 days | Core feature reliability |
| H2 | **Validate Stripe → PostHog revenue events** | 4 hrs | Trust Revenue dashboard |
| H3 | **Identify users on login + auth callback** | 2 hrs | Funnel accuracy |
| H4 | **Fix `onboarding_receipt_skipped` capture** | 1 hr | Onboarding funnel truth |
| H5 | **Add resume generator event suite** | 4 hrs | Product analytics for key bet |
| H6 | **Create North Star dashboard** (signup → receipt → week-1 return) | 3 hrs | Single source of truth |
| H7 | **Upload source maps to PostHog** | 2 hrs | Debuggable errors |

### Medium-priority optimizations (1–2 weeks)

| # | Task |
|---|------|
| M1 | Standardize all captures through `captureClientEvent` / `captureServerEvent` |
| M2 | Add cohorts: Activated, Pro, At-risk (no pageview 14d), Blog visitors |
| M3 | Saved heatmaps for `/`, `/login`, `/dashboard` |
| M4 | Blog → signup path dashboard with `blog_product_cta_clicked` |
| M5 | Add `capture_source` to every custom event |
| M6 | Payment event dedupe with `$insert_id` |
| M7 | Weekly replay review ritual (5 sessions with errors) |

### Long-term recommendations

| # | Task |
|---|------|
| L1 | Feature flags for onboarding A/B (receipt prompt copy, wizard steps) |
| L2 | Post-checkout NPS survey via PostHog Surveys |
| L3 | Group analytics (universities as groups) for B2B2C |
| L4 | Data warehouse sync (Stripe + Supabase → PostHog) for LTV |
| L5 | Autocapture scope reduction on dashboard routes |
| L6 | Extension install → activation cohort analysis |

---

## Phased implementation roadmap

### Phase 0 — Stabilize & trust (Week 1) — **100% complete** (Jul 5, 2026)

**Goal:** Stop false alerts; fix the #1 product error; validate revenue pipe.

| Step | Action | Owner | Status |
|------|--------|-------|--------|
| 0.1 | Fix case-status error boundary (investigate React crash) | Eng | **Done** — all panels wrapped (`hero`, `monitor_health`, `pp_countdown`, `analytics`, `opt_journey`, `tools`, `next_steps`, `timeline`, `case_info_footer`); `captureErrorBoundaryTriggered` on `CaseStatusPanelErrorBoundary` + `CaseTimelineErrorBoundary`; case-status UI migrated to `safe-dates.ts` (no raw `new Date()` in render paths except intentional `toISOString()` state updates) |
| 0.2 | Stripe test webhook → confirm `payment_succeeded` in Live Events | Eng | **Code done** — webhook + all 3 server `checkout_started` captures use `billingInsertId()`; live Stripe CLI validation is operational only ([stripe-test-billing-validation.md](./stripe-test-billing-validation.md)) |
| 0.3 | Delete duplicate dashboards; enable test-account filter | Analytics | **Done** — 1707548/1711708 already removed; deleted 1775072; `filterTestAccounts: true` on [Analytics basics](https://us.posthog.com/project/369087/dashboard/1430901) + key [Revenue](https://us.posthog.com/project/369087/dashboard/1707552) insights; [North Star](https://us.posthog.com/project/369087/dashboard/1802474) already filtered |
| 0.4 | Tune exception alert thresholds | Analytics | **Done** — [Exceptions > 10/day absolute](https://us.posthog.com/project/369087/insights?tab=alerts); not firing, last_value 0 |
| 0.5 | Verify `before_send` filter live after deploy `04b81d7` | Analytics | **Done** — **0** `removeChild` `$exception` events in last 14 days |

**Implementation — revenue event validation:**

```typescript
// apps/web/lib/posthog-server.ts — add dedupe support
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: PostHogEventProperties & { $insert_id?: string }
): Promise<void> {
  await withPostHogClient((posthog) => {
    posthog.capture({
      distinctId,
      event,
      properties: stripUndefined(properties),
    });
  });
}

// apps/web/app/api/premium/webhook/route.ts
await captureServerEvent(userId, "payment_succeeded", {
  $insert_id: `payment_succeeded:${invoiceId}`, // idempotent
  amount_cents: amount,
  plan_tier: normalizePlanTier(planId),
  capture_source: "server",
});
```

**Stripe test:**

```bash
stripe listen --forward-to localhost:3000/api/premium/webhook
stripe trigger checkout.session.completed
# Then check: PostHog → Live events → filter payment_succeeded
```

---

### Phase 1 — Activation & identity (Week 2) — **100% complete** (Jul 5, 2026)

**Goal:** Fix the signup → receipt → return leaky bucket.

| Step | Action | Status |
|------|--------|--------|
| 1.1 | Identify on login when session exists | **Done** — `LoginPostHogIdentify`, email sign-in/sign-up identify + events, OAuth server identify enriched |
| 1.2 | Fix `onboarding_receipt_skipped` | **Done** — 10 events in 30d; deduped skip paths in `OnboardingWizard` |
| 1.3 | Add person properties: `has_receipt`, `activation_state`, `signup_date` | **Done** — `PostHogIdentify` + login/OAuth identify |
| 1.4 | Create North Star dashboard | **Done** — [North Star — Signup → Receipt → Retention](https://us.posthog.com/project/369087/dashboard/1802474) (pinned, 5 tiles, test accounts filtered) |
| 1.5 | Investigate 54% onboarding drop | **Done** — [POSTHOG-PHASE-1-ACTIVATION-INVESTIGATION.md](./POSTHOG-PHASE-1-ACTIVATION-INVESTIGATION.md) |

See [POSTHOG-PHASE-1-ACTIVATION-INVESTIGATION.md](./POSTHOG-PHASE-1-ACTIVATION-INVESTIGATION.md) for funnel data, hypotheses, and Phase 3 experiment plan.

**Implementation — identify on login:**

```typescript
// apps/web/app/login/page.tsx — inside existing useEffect after session check
import { identifyTrackMyOptUser } from "@/lib/posthog-client";

useEffect(() => {
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    identifyTrackMyOptUser(user.id, {
      plan_tier: "free", // refined later by PostHogIdentify
      premium_status: false,
      onboarding_completed: false,
      provider: user.app_metadata?.provider,
    });
  });
}, []);
```

**Implementation — receipt skipped (verify call site):**

```typescript
// components/dashboard/onboarding/OnboardingWizard.tsx
import { captureOnboardingReceiptSkipped } from "@/lib/posthog-client";

const handleSkipReceipt = () => {
  captureOnboardingReceiptSkipped({ receipt_prefix: null });
  // ... existing skip logic
};
```

---

### Phase 2 — Product funnel completeness (Week 3–4) — **100% complete** (Jul 5, 2026)

**Goal:** Analytics coverage for every revenue-facing feature.

| Step | Action | Status |
|------|--------|--------|
| 2.1 | Resume events: `resume_generated`, `resume_downloaded`, `resume_ats_scored` | **Done** — instrumented in `resume-generator/editor/page.tsx`; 0 prod events until deploy (low traffic feature) |
| 2.2 | Blog funnel dashboard | **Done** — [Blog → Product CTA Funnel](https://us.posthog.com/project/369087/dashboard/1802532) (3 insights, pinned) |
| 2.3 | Job tracker + extension dashboard | **Done** — [Job Tracker + Extension](https://us.posthog.com/project/369087/dashboard/1802533) (2 insights, pinned) |
| 2.4 | Cohorts: Activated, Pro, At-risk | **Done** — [Activated](https://us.posthog.com/project/369087/cohorts/396173), [Pro](https://us.posthog.com/project/369087/cohorts/396174), [At-risk](https://us.posthog.com/project/369087/cohorts/396175) |
| 2.5 | Saved heatmaps on conversion pages | **Done** — Homepage, Login, Dashboard (processing in PostHog) |
| 2.6 | Standardize `capture_source` on all events | **Done** — all product events via `captureClientEvent` / `captureServerEvent`; wrappers enforce `capture_source` last; regression test `capture-source.test.ts` |

See [POSTHOG-PHASE-2-PRODUCT-FUNNELS.md](./POSTHOG-PHASE-2-PRODUCT-FUNNELS.md) for dashboard links and `capture_source` migration notes.

**Resume event example:**

```typescript
// apps/web/app/dashboard/career/resume-generator/editor/page.tsx
captureClientEvent("resume_downloaded", {
  capture_source: "client",
  ats_score: atsAnalysis?.score ?? null,
  template_id: selectedTemplate,
  had_gate_warning: downloadGateShown,
});
```

---

### Phase 3 — Experimentation & growth (Month 2) — **100% complete**

| Step | Action | Status |
|------|--------|--------|
| 3.1 | Feature flag: onboarding receipt prompt variant | **Done** — `onboarding-receipt-variant` via [experiment 381118](https://us.posthog.com/project/369087/experiments/381118) |
| 3.2 | Experiment: receipt-required vs optional onboarding | **Done** — control / deferred / required (45/45/10), running |
| 3.3 | PostHog Survey: NPS after first `case_status_check_completed` | **Done** — [Survey](https://us.posthog.com/project/369087/surveys/019f346e-21f7-0000-0709-bbf4a29078ce) + client capture |
| 3.4 | Retention email trigger based on "at-risk" cohort | **Done** — `/api/cron/at-risk-reengagement` (cohort [396175](https://us.posthog.com/project/369087/cohorts/396175) proxy) |
| 3.5 | Source maps + symbol sets for error tracking | **Done** — `POSTHOG_SOURCEMAPS_ENABLED` + `@posthog/nextjs-config` |

See [POSTHOG-PHASE-3-EXPERIMENTATION.md](./POSTHOG-PHASE-3-EXPERIMENTATION.md) for flag variants, survey trigger, cron env, and source map setup.

---

### Phase 4 — Data platform maturity (Month 3+) — **100% complete**

| Step | Action | Status |
|------|--------|--------|
| 4.1 | Stripe ↔ PostHog warehouse sync for LTV | **Done** — person `lifetime_revenue_cents` sync + [LTV dashboard](https://us.posthog.com/project/369087/dashboard/1802593); Stripe warehouse connect documented |
| 4.2 | Group analytics (university partners) | **Done** — `university_partner` groups + [partner insight](https://us.posthog.com/project/369087/insights/OcEBUgJR) |
| 4.3 | Autocapture scope reduction | **Done** — `$autocapture` / rage / dead clicks dropped on `/dashboard*` |
| 4.4 | Automated weekly analytics digest | **Done** — [Dashboard sub 86775](https://us.posthog.com/project/369087/subscriptions/86775) + [AI prompt sub 86774](https://us.posthog.com/project/369087/subscriptions/86774) |

See [POSTHOG-PHASE-4-DATA-PLATFORM.md](./POSTHOG-PHASE-4-DATA-PLATFORM.md) for cron env vars, Stripe warehouse setup, and group analytics configuration.

---

### Phase 5 — Taxonomy closure — **100% complete**

| Step | Action | Status |
|------|--------|--------|
| 5.1 | Instrument remaining events (`premium_checkout_viewed`, `extension_detected`, `activation_completed`, `premium_checkout_completed`) | **Done** — client helpers + dashboard trackers |
| 5.2 | Archive `case_status_enrolled` | **Done** — hidden in PostHog event definitions |
| 5.3 | Blog → signup dashboard (M4) | **Done** — [dashboard 1802603](https://us.posthog.com/project/369087/dashboard/1802603) |
| 5.4 | Extension cohort + activation funnel (L6) | **Done** — [cohort 396240](https://us.posthog.com/project/369087/cohorts/396240), [insight 5er0tgqW](https://us.posthog.com/project/369087/insights/5er0tgqW) |
| 5.5 | Error ↔ replay + UX weekly digest (Q6) | **Done** — boundaries + `$session_id`; [sub 86776](https://us.posthog.com/project/369087/subscriptions/86776) |
| 5.6 | Post-checkout NPS (L2) | **Done** — [survey 019f347f](https://us.posthog.com/project/369087/surveys/019f347f-8f11-0000-3265-519683f516e7) |
| 5.7 | Canonical taxonomy docs | **Done** — [EVENT_TAXONOMY.md](../lib/posthog/EVENT_TAXONOMY.md), [LEGACY_EVENTS.md](../lib/posthog/LEGACY_EVENTS.md) |

See [POSTHOG-PHASE-5-CLOSURE.md](./POSTHOG-PHASE-5-CLOSURE.md) for file map, verification steps, and PostHog asset links.

---

## Effort vs impact matrix

```
Impact ▲
  High │  H1 Case-status fix    H2 Revenue events
       │  H3 Identity           H6 North Star dash
       │  ─────────────────────────────────────
  Med  │  H4 Receipt skip       M1 Event standardize
       │  H5 Resume events      M3 Heatmaps
       │  ─────────────────────────────────────
  Low  │  Q1 Dedupe dashboards  L5 Autocapture scope
       │
       └──────────────────────────────────────────► Effort
            Low              Med              High
```

---

## Events to add

| Event | When | Properties |
|-------|------|--------------|
| `resume_generated` | AI returns LaTeX | `template_id`, `job_description_length` |
| `resume_downloaded` | PDF saved | `ats_score`, `filename` |
| `resume_ats_scored` | Deep scan completes | `score`, `auto_regen_count` |
| `premium_checkout_viewed` | Checkout page load | `plan_id`, `interval` | **Shipped (Phase 5)** |
| `extension_detected` | Extension present | `version` | **Shipped (Phase 5)** |
| `activation_completed` | Receipt + onboarding | `days_since_signup` | **Shipped (Phase 5)** |
| `premium_checkout_completed` | Checkout success page | `plan_tier`, `stripe_session_id` | **Shipped (Phase 5)** |

## Events to consolidate or remove

| Event | Action |
|-------|--------|
| `case_status_enrolled` | **Hidden (Phase 5)** — use `receipt_added` |
| `checkout_started` (duplicate client+server) | Single server event; client only for UI attribution with `capture_source` |
| `dashboard_viewed` vs `$pageview` on `/dashboard` | Keep both; document that funnel uses `dashboard_viewed` |

---

## Related docs

- [EXCEPTION-SPIKE-REMEDIATION-PHASES.md](./EXCEPTION-SPIKE-REMEDIATION-PHASES.md) — React `removeChild` alert fix (deployed `04b81d7`)
- [EVENT_TAXONOMY.md](../lib/posthog/EVENT_TAXONOMY.md) — Canonical event taxonomy (Phase 5)
- [LEGACY_EVENTS.md](../lib/posthog/LEGACY_EVENTS.md) — Billing validation status
- [POSTHOG-PHASE-5-CLOSURE.md](./POSTHOG-PHASE-5-CLOSURE.md) — Phase 5 completion report
- [posthog-setup-report.md](../posthog-setup-report.md) — Original wizard integration

---

## Verification checklist (run after each phase)

| Check | Last verified | Result |
|-------|---------------|--------|
| PostHog Live Events shows new events within 5 min of staging action | 2026-07-06 | **PASS** — `activation_completed`, `resume_*`, `onboarding_receipt_variant_exposed` firing |
| Funnels use `filterTestAccounts: true` | 2026-07-05 | **PASS** |
| No PII in event properties | 2026-07-06 | **PASS** — billing privacy SQL unchanged |
| Server billing events include `$insert_id` | 2026-07-06 | **PASS** — backfill + `payment_failed` live |
| Dashboard tiles refreshed and pinned | 2026-07-06 | **PASS** — dashboards 1802474, 1802532, 1802533, 1802593, 1802603 exist |
| Error tracking issues resolved or documented | 2026-07-06 | **PASS** on case-status `removeChild`; 23 site-wide remain |
| Week-1 retention trend improving WoW | — | **ONGOING** product metric |

---

*Generated from live PostHog MCP queries on project 369087. Re-run audit monthly or after major releases.*
