# TrackMyOPT Freemium → Paid Conversion Plan

**Status:** Phases 0–6 live on `main` (PRs #23–#24) · production verification and Day 1/7/30 measurement in progress
**Date:** 2026-07-25  
**Sources:** Supabase (`profiles`, `case_status`, `job_applications`, `resume_generations`), PostHog project `369087`, Stripe subscriptions, codebase gate audit  

**Companion canvas:** open [`freemium-conversion-analysis.canvas.tsx`](/Users/ashishdikonda/.cursor/projects/Users-ashishdikonda-Documents-Office-ZYENE-Our-Products-1-Trackmyopt-TrackMyOPT-TrackMyOPT/canvases/freemium-conversion-analysis.canvas.tsx) beside chat in Cursor

---

## Implementation status (code)

| Phase | Status | Notes |
|------:|--------|-------|
| **0** | **100% code · live** | Identify on auth; server identify-before-capture + `supabase_user_id`; PricingModal `pricing_cta_viewed`; `checkout_started` only from server `create-checkout`; webhook user resolve via metadata → `stripe_customer_id`; `NORTH_STAR_FUNNEL_EVENTS`; PostHog board + baseline |
| **1** | **100% code · live (PR #23)** | Premium-only auto-check queue; `skippedFree` in `/uscis/check-all`; packaging notice; Pro `nextCheckAt`; stale >24h upsell. **Ops:** after next overnight batch, confirm free `last_checked_at` unchanged |
| **2** | **100% code · live** | plan-features SSoT; FAQ/SEO/Help aligned Free=manual refresh / Pro=daily auto-checks + status emails; H-1B 25, ATS 3, jobs unlimited; Dedicated = quotas + priority support |
| **3** | **100% code · live (PR #24)** | Status-change wedge v2 (trial CTA → PricingModal); 2nd refresh + stale + receipt-added upsells; persistent trial strip; fake 5-job bar removed; `checkout_started` only on Stripe session (not modal open) |
| **4** | **100% code · live (PR #24)** | Activation = receipt + successful check; post-auth → case-status; `dashboard_viewed` + `first_dashboard_viewed_at` without onboarding gate; D1 by signup age (**Vercel hourly cron**); activation poll; `pwa_installed` + manifest |
| **5** | **100% code · live (PR #24)** | payment_failed hygiene; checkout recovery + Vercel cron; portal deep-link; past_due banner; trial_converted + renewal receipts; annual CTAs; retry-pending Vercel cron |
| **6** | **100% code · live (PR #24)** | Dedicated closed for new sales + Pro migration; unused cancel win-back; `PRO_TRIAL_DAYS` wired; resume/ATS by `plan_tier` only |

**PostHog dashboard:** [Freemium Conversion (Phase 0)](https://us.posthog.com/project/369087/dashboard/1897601)  
**North-star funnel:** [n8q5vuJU](https://us.posthog.com/project/369087/insights/n8q5vuJU) · **Checkout→payment:** [d66YwCNm](https://us.posthog.com/project/369087/insights/d66YwCNm)

### Production deployment (2026-07-25)

- PR [#24](https://github.com/dikondaashish/TrackmyOPT/pull/24) merged at `1f4224d04fa966d9a944243c8e6aef12746b74a7`.
- Vercel production deployment `dpl_BBkG21v4y5dD2ptndHcA3UL7NVS4` is Ready on `www.trackmyopt.com`.
- Four production crons are registered: `check-case-status` (`0 14 * * *`), `checkout-recovery-emails` (`0 */4 * * *`), `d1-activation-nudge` (`0 * * * *`), and `retry-pending-emails` (`15 * * * *`).
- Public `/pricing` smoke passed: Free + Pro purchase CTAs only, annual billing selected, and 7-day trial copy visible.
- Authenticated PricingModal smoke passed on both Free and Pro accounts: only Free + Pro are offered, annual Pro is selected (`$4.17/mo`, billed yearly at `$49.99/year`), and the Free-account trial CTA, consent, and footer consistently use `PRO_TRIAL_DAYS` (7 days).
- Cancelled checkout smoke passed: the no-charge confirmation renders and **Try again** reopens the annual Pro PricingModal.
- Success-route landing smoke passed: the countdown returns the signed-in user to `/dashboard/case-status`. Trial-specific success copy was not exercised because it requires a real completed Stripe trial session; source/tests verify it uses `PRO_TRIAL_DAYS`, and no checkout session or subscription was created during this smoke test.


---

## Executive summary

TrackMyOPT is acquiring users and getting them to use the product — especially USCIS case tracking — but almost nobody pays.

| Metric | Value |
|--------|------:|
| Total profiles | 1,841 |
| Free | 1,827 |
| Pro | 10 |
| Dedicated | 4 |
| **Paid conversion** | **0.76%** |
| New signups (30d) | 572 |
| New + still premium (30d) | 2 |
| Stripe active + trialing | 13 |
| Stripe canceled | 22 |

**Root cause (one sentence):** Free users already get the core paid outcome — daily USCIS auto-checks update their case status in the database. Pro mainly adds the alert email. People get what they came for without paying.

This document is the phased plan to fix packaging, enforcement, activation, checkout, and retention.

---

## Table of contents

1. [Problem diagnosis](#1-problem-diagnosis)
2. [Current free vs Pro reality](#2-current-free-vs-pro-reality)
3. [Target packaging (end state)](#3-target-packaging-end-state)
4. [Master flip list: Free → Pro / Pro → Free](#4-master-flip-list-free--pro--pro--free)
5. [Phases overview](#5-phases-overview)
6. [Phase 0 — Align on truth & instrumentation](#phase-0--align-on-truth--instrumentation)
7. [Phase 1 — Stop giving Pro away (auto-check gate)](#phase-1--stop-giving-pro-away-auto-check-gate)
8. [Phase 2 — Honest packaging & copy fixes](#phase-2--honest-packaging--copy-fixes)
9. [Phase 3 — Paywall moments that convert](#phase-3--paywall-moments-that-convert)
10. [Phase 4 — Activation & onboarding](#phase-4--activation--onboarding)
11. [Phase 5 — Checkout reliability & payment recovery](#phase-5--checkout-reliability--payment-recovery)
12. [Phase 6 — Retention, Dedicated cleanup, pricing tests](#phase-6--retention-dedicated-cleanup-pricing-tests)
13. [Success metrics & kill criteria](#7-success-metrics--kill-criteria)
14. [Code anchors](#8-code-anchors)
15. [Risks & mitigations](#9-risks--mitigations)

---

## 1. Problem diagnosis

### 1.1 Funnel collapse (PostHog, last 90 days)

Ordered funnel (unique persons, 30-day window between steps):

| Step | People | Of signups | Leak |
|------|-------:|-----------:|------|
| `user_signed_up` | 938 | 100% | — |
| `dashboard_viewed` | 177 | 18.9% | **81% never reach dashboard** |
| `activation_completed` | 27 | 2.9% | Activation almost never completes |
| `upgrade_prompt_shown` | 4 | 0.4% | Paywall barely appears on this path |
| `checkout_started` | 0 | 0% | No ordered converts |
| `subscription_started` | 0 | 0% | — |

Parallel totals (same window, **not** ordered by person):

- Checkout viewed: 28  
- Checkout started: 15  
- `payment_succeeded`: 20  
- `payment_failed`: 18  
- `subscription_started`: 14  

**Implication:** Some people do pay, but same-person funnel attribution is broken, and payment failures nearly match successes. Conversion is both a **product packaging** problem and a **checkout/analytics** problem.

### 1.2 What users actually use

| Feature | Adoption | Monetization relevance |
|---------|----------|------------------------|
| USCIS cases tracked | **842 users** (~45% of profiles) | **Primary product** |
| Status-change wedge candidates (alert suppressed) | 46 users | Real Pro moment — under-monetized |
| Resume generations | 24 users | Niche; keep as teaser |
| Job applications | **8 users** | Dead for monetization today |
| Users at ≥5 jobs | 1 | “5 job limit” is theater |
| Multi-case users | 1 | “8 cases on Pro” is not a hero benefit yet |

Last 30 days event volume (PostHog):

- Case checks: ~1,019  
- Receipts added: ~389  
- ATS scores: ~112  
- Upgrade prompts: ~84 (mostly `status_change_wedge`)  
- Resumes generated: ~36  
- Pricing CTA viewed: **~1**  
- PWA installed (tracked): 0  

### 1.3 Smoking gun in code

Daily cron calls `POST /uscis/check-all`, which queues **every** active case.

In `apps/api/src/uscis/uscis.processor.ts`:

- Status is updated for free and Pro alike.  
- Free users get `last_change_alert_suppressed = true` (no email).  
- Pro users get notification trigger (email/push).  

**Free users still see the updated status when they open the app.** That is the paid outcome, delivered for free.

### 1.4 Stripe reality

| Status | Count | Notes |
|--------|------:|-------|
| Active | 12 | Mix of Pro monthly/annual + Dedicated |
| Trialing | 1 | Pro annual |
| Canceled | 22 | Dominated by Pro monthly |
| Cancel feedback | too_expensive (4), unused (4) | Product value unclear or price too high for perceived value |

---

## 2. Current free vs Pro reality

| Capability | Marketed | Free in code today | Problem |
|------------|----------|--------------------|---------|
| OPT / STEM calculators | Free | Free | Keep — acquisition |
| Manual case check (1 case) | Free | Enforced (~1 case) | Keep |
| Daily USCIS auto-checks | **Pro** | **Runs for everyone** | **Critical leak** |
| See updated status in dashboard | Implied Pro for “alerts” | Free sees full status | **Critical leak** |
| Status-change email / push | Pro | Hard-gated | Real Pro value — keep |
| Daily 9AM OPT emails | Pro | Hard-gated | Keep |
| Document vault + expiry mail | Pro | Hard-gated | Keep |
| H-1B browse | Free: 100 cos | Cap = **25** | Copy mismatch |
| Job tracker | Free: 5 jobs | **Not enforced** in `createApplication` | Fake gate |
| AI resumes | Free: 5/mo | Enforced 5/mo | Keep teaser |
| ATS scans | Free: 5/mo marketed | Enforced **3**/mo | Copy mismatch |
| Partner offers | Pro exclusive | Mostly ungated | Fake Pro perk |
| Dedicated attorney / 24-7 | Dedicated | Mostly marketing; tier ≈ resume quota | Trust risk |

---

## 3. Target packaging (end state)

### Free forever

- OPT / STEM calculators and timeline tools  
- Full dashboard shell + Chrome extension (core)  
- **1 USCIS case**  
- **Manual** status refresh only  
- See **last checked** status (timestamp visible: “Last checked X ago”)  
- Insurance / tax / Sprintax links  
- AI resume: **5/mo**  
- ATS: **3/mo** (advertise 3, not 5)  
- Job tracker: unlimited (or remove from pricing comparison entirely)  
- H-1B: **25** companies (advertise 25)  

### Pro ($4.99/mo or annual)

- **Daily auto-checks** (this is the product)  
- Instant **email + push** on status change  
- Up to **8** cases  
- Document vault + expiry reminders  
- Daily 9AM OPT deadline emails  
- Higher resume / ATS limits  
- Full H-1B + analytics  
- Chrome extension priority alerts (if implemented; otherwise remove from copy)  

### Dedicated (pause hard claims)

- Do **not** sell attorney sessions / 24-7 support until ops can deliver.  
- Either: (a) hide Dedicated, or (b) redefine as “Pro + higher quotas + priority email support” only.  

---

## 4. Master flip list: Free → Pro / Pro → Free

### 4.1 Change from Free → Pro (must enforce)

| # | Change | Why | Primary files / systems |
|---|--------|-----|-------------------------|
| F→P1 | **Daily auto-check batch excludes free users** | Marketing already says Pro; code gives it away | `apps/api` `queueAllActiveCases` / USCIS processor; cron `check-case-status` |
| F→P2 | Free UI shows “Auto-check is Pro” + last-checked timestamp | Makes the gate visible and fair | Case status UI (`CaseStatusSection`, display helpers) |
| F→P3 | Status-change **alerts** stay Pro (already true) — strengthen CTA | 46 users already hit suppressed-alert state | `free-change-wedge.ts`, notify route, PricingModal |
| F→P4 | Optional later: blur/delay **new** status text for free until upgrade or manual refresh | Stronger conversion; higher UX risk | Case status redesign + wedge |

### 4.2 Change from Pro → Free (or stop selling as Pro)

| # | Change | Why | Primary files |
|---|--------|-----|---------------|
| P→F1 | **Partner offers** off Pro comparison | Already ungated | `plan-features.ts`, pricing pages |
| P→F2 | **Job tracker unlimited on Free** (or drop from pricing) | 8 users; limit not enforced | `plan-features.ts`, `job-tracker/actions.ts`, feature pages |
| P→F3 | Align H-1B free copy to **25** | Code = 25 | `plan-features.ts`, landing, pricing |
| P→F4 | Align ATS free copy to **3** | Code = 3 | `plan-features.ts`, emails, marketing |
| P→F5 | Remove / rewrite Dedicated attorney & 24-7 claims | Not delivered as sold | Dedicated cards, legal copy, Stripe product description |

### 4.3 Keep as-is

- OPT/STEM calculators free  
- Manual check free  
- Extension free  
- Email/push alerts Pro  
- 9AM reminders Pro  
- Document vault Pro  
- Resume 5/mo free teaser  

---

## 5. Phases overview

| Phase | Name | Goal | Duration (guide) | Depends on |
|------:|------|------|------------------|------------|
| **0** | Truth & instrumentation | Shared metrics, event identity fixed enough to measure | 3–5 days | — |
| **1** | Auto-check gate | Stop giving Pro away | 3–7 days | Phase 0 metrics baseline |
| **2** | Honest packaging | Marketing = code | 2–4 days | Can parallel with 1 |
| **3** | Paywall UX | Convert high-intent moments | 5–10 days | Phase 1 live |
| **4** | Activation | Fix 81% dashboard drop | 1–2 weeks | Can start early |
| **5** | Checkout & payments | Fix fail rate + attribution | 1 week | Parallel anytime |
| **6** | Retention & pricing | Keep payers; clean Dedicated | Ongoing | After 1–3 |

Do **not** skip Phase 1 for more marketing. Ads and emails cannot fix a product that is free in practice.

---

## Phase 0 — Align on truth & instrumentation

### Goal

Know whether packaging changes work. Today, ordered checkout→payment is 0% same-person while totals show payments — dashboards lie.

### Problems to solve

1. `checkout_started` and `payment_succeeded` often do not share the same PostHog person.  
2. `pricing_cta_viewed` is almost never fired (~1 in 30d).  
3. Signup vs Supabase counts diverge (PostHog 938 vs ~1,322 profiles created in 90d) — identify / coverage gaps.  

### Work items

1. **Audit identify**  
   - Ensure `posthog.identify(user.id)` on login, signup, and before checkout.  
   - Ensure Stripe webhook / server events use `captureServerEvent(userId, …)` with the same ID.  

2. **Define north-star funnel** (save as PostHog insight)  
   - Signup → first receipt added → first case check → upgrade prompt → checkout started → `subscription_started` (or premium_status true).  

3. **Baseline snapshot (write down before Phase 1)**  
   - % profiles with `premium_status`  
   - Active Stripe subs  
   - Free cases updated overnight (count)  
   - Upgrade prompt → checkout rate  

4. **Dashboard**  
   - One PostHog board: activation, upsell, checkout, payment_failed, cancel reasons.  

### Exit criteria

- [x] Same-person `checkout_started` → `payment_succeeded` is measurable (baseline: 12→1 = 8.3% over 90d / 14d window; improve after identify fix ships)
- [x] Baseline numbers documented in Appendix C / Phase 0 baseline below
- [x] Free/Pro target packaging agreed in §3 (implemented in Phase 1–2 code)

### Phase 0 baseline snapshot (2026-07-23)

| Metric | Value | Source |
|--------|------:|--------|
| Profiles | 1,841 | Supabase |
| Premium % | 0.76% (14) | Supabase |
| New profiles 30d | 572 | Supabase |
| North-star: signup → receipt | 45.5% (938→427) | PostHog 90d |
| North-star: → case check | 44.2% (415) | PostHog 90d |
| North-star: → upgrade prompt | 1.07% (10) | PostHog 90d |
| North-star: → checkout / sub | 0% ordered | PostHog 90d |
| Checkout → payment (same person) | 8.3% (12→1) | PostHog 90d / 14d |
| Stripe active + trial | 13 | Stripe |
| Stripe canceled | 22 | Stripe |

**Code shipped in Phase 0**

- `captureServerEvent` now `identify` then `capture` with `supabase_user_id`
- `pricing_cta_viewed` fires when PricingModal opens (not only page footer CTA)
- Client `checkout_started` re-identifies current distinct id before capture
- `NORTH_STAR_FUNNEL_EVENTS` constant + tests
- PostHog dashboard + saved insights (links above)

### How this solves conversion

Without Phase 0, Phase 1–3 look like “we shipped” with no proof. Instrumentation is how we know the gate worked.

---

## Phase 1 — Stop giving Pro away (auto-check gate)

### Goal

**Free = manual freshness. Pro = automatic freshness + alerts.**

This is the highest-leverage product change.

### What changes Free → Pro

| Before | After |
|--------|--------|
| Cron auto-checks all cases | Cron auto-checks **premium only** |
| Free sees overnight updates for free | Free status stays until they hit Refresh (or upgrade) |
| Pro differentiator = email only | Pro differentiator = **auto-check + email/push** |

### Implementation depth

1. **Backend (`apps/api`)**  
   - In `queueAllActiveCases` (or equivalent), join/filter cases to users with `profiles.premium_status = true` (or active trial).  
   - Keep manual `POST /uscis/check` / web `case-status/check` available for free users (rate-limit if needed).  
   - Add logging: `queued_premium_count`, `skipped_free_count`.  

2. **Web cron**  
   - `apps/web/app/api/cron/check-case-status/route.ts` stays; behavior changes via API filter.  
   - Confirm Vercel cron still healthy after deploy.  

3. **UI (required with gate)**  
   - Show: “Last checked: …”  
   - Free: “Daily auto-check is a Pro feature. Refresh manually or upgrade.”  
   - Pro: “Next auto-check in …” (existing helper in `case-status-display.ts`).  

4. **Wedge update**  
   - When free user opens app and status is stale (>24h), soft prompt to upgrade for auto-checks — not only on status change.  

5. **Comms**  
   - In-app banner for existing free users with a case: “We’re clarifying Free vs Pro: daily auto-checks now require Pro. Manual refresh stays free.”  
   - Optional email to active free case trackers (honesty > surprise).  

6. **Trial**  
   - 7-day Pro trial should grant **auto-check + alerts**, not features they already had.  
   - Start trial CTA from case status page when they add a receipt.  

### Tests / checks

- [x] Free user case: not updated by overnight cron (unit: `premium-auto-check.spec.ts`; **ops spot-check after API deploy**)
- [x] Free user: manual refresh still works (unchanged route)
- [x] Pro / trial user: still in batch (`premium_status` filter)
- [x] Free status change still suppresses email; Pro still notifies (unchanged notify gate)
- [x] Unit/integration test on queue filter
- [x] Stale >24h soft upsell for free users (`shouldShowStaleStatusUpsell`)
- [x] `/uscis/check-all` returns `skippedFree`

### Exit criteria

- [ ] Overnight job skips free cases (verified in logs + spot-check DB `last_checked_at`) — **Day 1 check after 2026-07-26 14:00 UTC batch**
- [x] Pricing copy matches behavior
- [ ] No spike in USCIS API errors from retries — **monitor after deploy**

### How this solves conversion

Users who care about case status must either refresh (friction) or pay (automation). Pro becomes necessary for the job-to-be-done, not optional.

### Risks

| Risk | Mitigation |
|------|------------|
| Backlash / “bait and switch” | Clear in-app notice; grandfather short grace (e.g. 7 days) optional |
| Support load | FAQ + settings copy ready before deploy |
| Users churn from product entirely | Keep manual check excellent; don’t degrade accuracy of refresh |

---

## Phase 2 — Honest packaging & copy fixes

### Goal

Every Free/Pro claim on pricing, landing, feature pages, and emails matches code.

### What changes Pro → Free (or stop claiming)

| Item | Action |
|------|--------|
| Partner offers as Pro | Remove from Pro column; list as Free or drop |
| Job tracker “5 jobs” hard limit | Either enforce server-side **or** set Free = Unlimited and remove from upsell |
| H-1B “100 companies” free | Change all copy to **25** (or raise code to 100 — prefer copy fix) |
| ATS “5/mo” free | Change all copy to **3/mo** |
| Dedicated attorney / 24-7 | Remove until real delivery; or hide Dedicated plan |

### What stays / minor Free → Pro clarifications

| Item | Action |
|------|--------|
| Document vault | Keep Pro; ensure upload route stays gated |
| 9AM emails | Keep Pro |
| “Smart suggestions & auto-tracking” | Define or remove vague bullet |
| Extension “priority alerts” | Ship or remove from Pro list |

### Implementation depth

1. Single source of truth: `apps/web/lib/pricing/plan-features.ts`  
2. Sync: landing features, PricingModal, PricingComparison, settings subscription, feature marketing pages (`/features/job-tracker` currently says 50 jobs — fix).  
3. Email templates in `transactional-emails.ts` that mention limits.  
4. Add/extend `plan-features.test.ts` so marketed numbers cannot drift from constants (`FREE_H1B_SPONSOR_LIMIT`, `FREE_ATS_SCAN_LIMIT`, resume free limit).  

### Jobs decision (resolved 2026-07-25)

**Option A selected:** Free unlimited jobs; remove the fake 5-job comparison/usage bar. Do not add an enforcement branch to `createApplication`.

### Exit criteria

- [x] Zero known marketing ≠ code mismatches on Free/Pro matrix (pricing, landing, case-status feature, how-it-works, disclaimer Dedicated section)
- [x] Dedicated claims honest (priority support + quotas; no attorney sessions sold)
- [x] Legal/pricing pages reviewed for Dedicated attorney claims

### How this solves conversion

Fake limits destroy trust. Real limits (auto-check) convert. Cleaning copy focuses attention on the one thing worth paying for.

---

## Phase 3 — Paywall moments that convert

### Goal

When a free user hits real desire (“I need to know when USCIS changes”), the path to trial/checkout is obvious and short.

### Current upsell triggers (30d)

| Trigger | Volume | Quality |
|---------|-------:|---------|
| `status_change_wedge` | ~65 | Best — keep & improve |
| `second_manual_refresh` | ~8 | Keep |
| Other / missing `trigger` | ~11 | Instrument properly |
| Pricing CTA | ~1 | Broken / unused |

### What to build

1. **Status-change wedge v2**  
   - Clear headline: “Your case status changed. Alerts + daily auto-checks are on Pro.”  
   - Primary CTA: Start 7-day trial  
   - Secondary: View status (if you keep status visible) / Refresh  
   - Fire `upgrade_prompt_shown` with `trigger`, `source`, `plan_suggested`  

2. **Stale-status upsell (new, after Phase 1)**  
   - If free and `last_checked_at` > 24h: banner “Status may be outdated. Auto-check daily with Pro.”  

3. **Second manual refresh**  
   - Keep; ensure it opens PricingModal with trial highlighted.  

4. **Receipt-added moment**  
   - After first receipt: “We’ll watch this case daily on Pro. Manual refresh is free.”  

5. **Remove soft/fake paywalls** that don’t convert (job limit banners if you choose Option A).  

### Free → Pro messaging (canonical)

Use one sentence everywhere:

> **Free:** track 1 case and refresh anytime.  
> **Pro:** we check USCIS for you every day and email you the moment anything changes.

### Exit criteria

- [ ] Upgrade prompt → checkout started ≥ 15% (30d rolling, after identify fix + deploy) — **metric, not code**
- [x] At least 3 instrumented triggers with non-null `trigger` (`status_change_wedge`, `second_manual_refresh`, `stale_status`, `receipt_added` + `plan_suggested`)
- [x] Trial CTA visible on case status for free users with a receipt (persistent strip + wedge/upsells → PricingModal with “Start 7-Day Free Trial”)

### Code shipped in Phase 3

- Status-change wedge v2: trial primary CTA opens PricingModal (`initialPlan=pro`)
- Second manual refresh + stale + receipt-added upsells open PricingModal (not bare checkout URL)
- Fake job-tracker “5 jobs” usage bar removed (unlimited Free)
- Canonical Free/Pro copy in `CASE_STATUS_MESSAGING`

### How this solves conversion

Phase 1 creates need; Phase 3 captures need. Without Phase 3, gated auto-check just creates silent frustration.

---

## Phase 4 — Activation & onboarding

### Goal

Fix the 81% drop between signup and `dashboard_viewed`, and the ~97% who never activate.

You cannot monetize users who never reach the case tracker.

### Work items

1. **Define activation** (product) — **done**  
   - `receipt_added` + at least one successful case status check (`last_checked_at` + real status, not pending).  
   - Tracked as `activation_completed` with `within_24h` vs signup. Onboarding is **not** required.  
   - Code: `apps/web/lib/posthog/activation.ts`, `ActivationCompletedTracker` (poll + visibility recheck for same-session activation).  
   - Person `activation_state`: `no_receipt` | `receipt_pending_status` | `activated`.

2. **Onboarding path** — **done**  
   - After auth: land on `/dashboard/case-status` (`DEFAULT_POST_AUTH_PATH`).  
   - Middleware logged-in `/login` → case-status; OAuth/magic-link fallback same; login default `redirect`/`returnTo` → case-status.

3. **Track why dashboard_viewed is low** — **done (instrumentation)**  
   - `DashboardViewTracker` mounted on **all** dashboard routes via `DashboardLayoutClient` (not hub-only).  
   - No longer gated on `onboarding_completed`.  
   - Session-once capture + stamps `first_dashboard_viewed_at` via `/api/profile/activity` (**no onboarding requirement**).  
   - Event includes `path` for extension vs web diagnosis.

4. **D1 / free-receipt reengagement** — **done**  
   - D1 cohort: free + `created_at` ≥24h ago + null `first_dashboard_viewed_at` (not onboarding-gated).  
   - D1 nudge CTA → Case Status; copy = add receipt → manual check → Pro trial.  
   - Free-receipt reengagement CTA → **Start 7-Day Free Trial** (`/premium/checkout?planId=pro`) + secondary Case Status link.

5. **PWA / install** — **done (minimal)**  
   - `PwaInstallTracker` → `pwa_installed` on `appinstalled` / standalone.  
   - `public/manifest.webmanifest` + root layout `manifest` / `appleWebApp` (no full offline PWA).

### Exit criteria

- [ ] Signup → dashboard_viewed ≥ 50% (or explain remaining gap with extension-only cohort) — **measure after deploy**  
- [ ] Signup → receipt_added ≥ 30% within 7 days — **measure after deploy**  
- [x] Activation definition documented and tracked  

### How this solves conversion

More users at the case-status moment = more people eligible for Phase 1/3 paywalls. Activation is volume; packaging is conversion rate.

---

## Phase 5 — Checkout reliability & payment recovery

### Goal

People who decide to pay should succeed. Today failures ≈ successes, and attribution is broken.

### Investigation note (2026-07-23)

PostHog last 90d: `payment_failed` **18 events / 2 unique people**; `payment_succeeded` **18 unique people**. The ~1:1 event ratio was **renewal dunning retries**, not 18 unique checkout declines. KPI should use **unique people**, not raw event count.

### Work items

1. **Investigate `payment_failed`** — **done (code + baseline)**  
   - Documented dunning vs checkout failure above.  
   - Webhook: `invoice.payment_failed` is canonical PostHog+email emitter; `payment_intent.payment_failed` skips when an invoice exists (stops double counts).  
   - Enrich `failure_code` from decline_code / charge.failure_code.  
   - Handle `checkout.session.expired` → mark pending `payment_transactions` as `expired`.

2. **Checkout recovery** — **done**  
   - `findCheckoutAbandoners` returns `stripeCheckoutSessionId` + billing interval.  
   - Resume **open** Stripe Checkout `session.url`; else fresh `/premium/checkout?planId&interval` (annual default).  
   - Vercel cron every 4h: `/api/cron/checkout-recovery-emails` (also still callable via cron-job.org).  
   - Event: `checkout_recovery_email_sent` includes `resume_kind`.

3. **Identity** — **done**  
   - PricingModal no longer fires client `checkout_started` before Stripe session (server `create-checkout` is sole funnel emitter).  
   - Webhook resolve remains metadata → `stripe_customer_id`.

4. **UX** — **done**  
   - Payment-failed email CTA → Stripe Customer Portal (or `/api/premium/portal` GET).  
   - Dashboard `PastDueBillingBanner` when `billingStatus` is `past_due`/`unpaid`.  
   - Cancelled checkout “Try again” → annual Pro checkout.  
   - Annual remains default in PricingModal / create-checkout.

5. **Trial → paid** — **done**  
   - Success page: trialing copy + trial end date; land on case-status.  
   - `invoice.paid` after recent trial end → `trial_converted` + subscription receipt email.  
   - Renewals also get receipt email (deduped by Stripe event).

### Exit criteria

- [ ] `payment_failed` / (`payment_succeeded` + `payment_failed`) trending down — **measure unique people after deploy**  
- [ ] Checkout recovery email open→pay measurable — **instrumented; needs volume after cron runs**  
- [ ] PostHog ordered checkout→payment > 40% when payments occur — **measure after identity fix**  

### How this solves conversion

Packaging gets intent; this phase captures revenue. Ignoring it wastes Phase 1–3 work.

---

## Phase 6 — Retention, Dedicated cleanup, pricing tests

### Goal

Keep the few payers; stop selling undeliverable Dedicated; test price after value is real.

### Stripe cancel signals

- `too_expensive`  
- `unused`  

Both improve only **after** Pro does something free does not (Phase 1).

### Work items

1. **Dedicated** — **done**  
   - Closed for new purchases (`DEDICATED_OPEN_FOR_NEW_PURCHASES = false`).  
   - Hidden from PricingModal, landing, pricing page CTAs, settings upgrades.  
   - `create-checkout` rejects new Dedicated; Stripe sync kept for grandfathered subs.  
   - In-app **Switch to Pro** (`DedicatedMigrationBanner` + settings + `downgradeDedicatedSubscriptionToPro`).

2. **Unused cancel win-back** — **done**  
   - Webhook captures Stripe `cancellation_details.feedback` on `subscription_canceled`.  
   - `feedback=unused` → `unused_cancel_winback` email (“Pro now auto-checks your case daily”).  
   - All other ends → updated `subscription_ended` with the same auto-check reopen CTA (annual Pro).

3. **Pricing experiments** — **done (hygiene; no price raise)**  
   - Annual-first already live (Phase 5).  
   - `trial_period_days` uses `PRO_TRIAL_DAYS` (flip 7↔3 in one constant).  
   - **Do not raise price** until Phase 1 auto-check conversion is measured in production.

4. **Quota fairness** — **done**  
   - Removed `premium_status` → Pro limit override.  
   - Resume + ATS limits resolve from `plan_tier` only; resume checks use service role like ATS.

### Exit criteria

- [ ] Active Stripe subs trending up month over month — **measure after deploy**  
- [ ] Cancel reason “unused” declining — **instrumented via `cancel_feedback`**  
- [ ] Dedicated claims match delivery — **new sales stopped; existing can migrate to Pro**

---

## 7. Success metrics & kill criteria

### North-star

**% of profiles with active paid subscription (Pro or Dedicated)** — move from **0.76%** toward a first target of **3–5%** within 90 days of Phase 1 launch (aggressive but plausible if case users convert).

### Leading indicators

| Metric | Baseline (approx) | 30d after Phase 1+3 target |
|--------|-------------------|----------------------------|
| Signup → dashboard | ~19% | ≥ 50% |
| Free case users seeing stale-status / upgrade CTA | low | majority of free case openers |
| Upgrade prompt → checkout | very low | ≥ 15% |
| Checkout → payment (same person) | ~0% attributed | ≥ 40% |
| Active Stripe subs | 13 | +50% |

### Kill / revisit criteria

- If Phase 1 causes large drop in DAU **and** no lift in checkout within 3 weeks → soften gate (e.g. auto-check every 3 days free, daily Pro) rather than full free auto-check.  
- If paywall UX increases prompts but not checkout → problem is price/trust (Phase 5–6), not awareness.  

### Deploy and measurement checkpoints

| Checkpoint | Date | Gate / error health | Event health | Product metrics / decision |
|------------|------|---------------------|--------------|----------------------------|
| Day 0 | 2026-07-25 | Production Ready; four crons registered; case-status/USCIS `$exception` = 0 events / 0 people in prior 24h | `checkout_recovery_email_sent`, `trial_converted`, `pwa_installed`, and `cancel_feedback` absent from taxonomy immediately after deploy; wait for real triggers | Pre-deploy `$pageview` DAU averaged **55.9/day** over 2026-07-11–24; public + authenticated PricingModal and cancelled-route smoke passed; success-route case-status landing passed; live-session trial success rendering not exercised |
| Day 1 | 2026-07-26 | Pending overnight DB/log spot-check and USCIS error comparison | Begin daily taxonomy/trigger checks | No product conclusion before the first full post-deploy day |
| Day 7 | 2026-08-01 | Pending | Confirm Phase 5–6 event emitters after observed triggers | Run unique-person activation, checkout, payment-failure, subscription, cancellation, and DAU checkpoint |
| Day 30 | 2026-08-24 | Pending | Confirm stable taxonomy | Rerun metrics; evaluate exit and kill criteria; record keep/soften-gate decision |

---

## 8. Code anchors

| Area | Path |
|------|------|
| Plan marketing matrix | `apps/web/lib/pricing/plan-features.ts` |
| Resume / ATS limits | `apps/web/lib/usage-limit.ts` |
| H-1B free cap | `apps/web/lib/career/h1b/constants.ts` (`FREE_H1B_SPONSOR_LIMIT = 25`) |
| Case limits | `apps/web/lib/case-status/case-limits.ts` |
| Free status-change wedge | `apps/web/lib/case-status/free-change-wedge.ts` |
| Job create (no limit) | `apps/web/app/dashboard/career/job-tracker/actions.ts` → `createApplication` |
| Auto-check cron | `apps/web/app/api/cron/check-case-status/route.ts` |
| Auto-check batch + wedge fields | `apps/api/src/uscis/uscis.processor.ts` |
| Alert gate | `apps/web/app/api/case-status/notify/route.ts` |
| Checkout | `apps/web/app/api/premium/create-checkout/route.ts` |
| Webhooks / premium sync | `apps/web/app/api/premium/webhook/route.ts`, `apps/web/lib/premium/*` |
| Checkout recovery | `apps/web/lib/billing/checkout-recovery.ts`, `app/api/cron/checkout-recovery-emails` |
| Past-due banner | `apps/web/components/billing/PastDueBillingBanner.tsx` |
| Stripe portal (GET email deep-link) | `apps/web/app/api/premium/portal/route.ts` |
| Dedicated sales gate | `apps/web/lib/pricing/dedicated-availability.ts` |
| Dedicated → Pro migration | `downgradeDedicatedSubscriptionToPro`, `DedicatedMigrationBanner.tsx` |
| Unused cancel win-back | `buildUnusedCancelWinbackEmailBodies` + webhook `cancel_feedback` |
| Resume / ATS quota fairness | `apps/web/lib/usage-limit.ts` (`plan_tier` only) |
| Activation definition | `apps/web/lib/posthog/activation.ts` |
| Post-auth landing | `apps/web/lib/auth/post-auth-landing.ts` (`DEFAULT_POST_AUTH_PATH`) |
| Dashboard view tracking | `apps/web/components/analytics/DashboardViewTracker.tsx` (layout-mounted) |
| PWA install tracking | `apps/web/components/analytics/PwaInstallTracker.tsx`, `public/manifest.webmanifest` |

---

## 9. Risks & mitigations

| Risk | Phase | Mitigation |
|------|------:|------------|
| Users feel bait-and-switched when auto-check becomes Pro | 1 | Notice + FAQ + grace period; manual refresh stays excellent |
| Support tickets spike | 1–3 | Macros: Free vs Pro one-pager |
| Conversion still flat after gate | 3–5 | Check trial CTA, price, payment_failed |
| Over-gating kills SEO/growth word-of-mouth | 1 | Keep calculators + manual check free forever |
| Dedicated legal/compliance exposure | 2, 6 | Remove undelivered attorney claims immediately |

---

## Appendix A — Recommended sprint order (first 30 days)

| Week | Focus |
|-----:|-------|
| 1 | Phase 0 baseline + Phase 1 auto-check filter + UI last-checked copy |
| 1–2 | Phase 2 copy alignment (H-1B 25, ATS 3, partners, jobs decision) |
| 2 | Phase 3 wedge v2 + stale-status banner + trial CTA |
| 2–3 | Phase 5 payment_failed investigation + recovery emails |
| 3–4 | Phase 4 onboarding to add-receipt; activation funnel |
| 4+ | Phase 6 Dedicated cleanup; cancel win-back; pricing tests |

---

## Appendix B — One-page decision log (fill as you ship)

| Date | Decision | Owner | Notes |
|------|----------|-------|-------|
| 2026-07-23 | Analysis: free auto-check is the #1 leak | Eng/Product | This doc |
| 2026-07-23 | Dedicated closed for new sales; Pro migration in-app | Eng | Phase 6 |
| 2026-07-23 | No price raise until Phase 1 conversion measured | Product | Phase 6 |
| 2026-07-25 | Jobs: Option A — unlimited free | Product | Fake 5-job bar removed; no `createApplication` limit |
| 2026-07-25 | No grandfather grace for free auto-check | Product | Gate and in-app notice already live via PR #23; no retroactive grace |
| 2026-07-25 | Dedicated remains legacy-only; closed to new sales | Product | Hidden from new purchase flows; retain sync and Pro migration until legacy subscribers move |

---

## Appendix C — Snapshot (2026-07-23)

```
profiles:                1841
free:                    1827
pro:                       10
dedicated:                  4
premium_status true:       14
stripe_customer_id set:    32
pro_free_trial_consumed:   20
ever purchased flag:       23
users with cases:         842
users with jobs:            8
users with resumes:        24
suppressed alert cases:    46
Stripe active:             12
Stripe trialing:            1
Stripe canceled:           22
```

---

*End of plan. Implement Phase 1 before spending more on ads that feed a free-forever core product.*
