# TrackMyOPT Freemium → Paid Conversion Plan

**Status:** Phases 0–2 complete in code · Phases 3–6 not started  
**Date:** 2026-07-23  
**Sources:** Supabase (`profiles`, `case_status`, `job_applications`, `resume_generations`), PostHog project `369087`, Stripe subscriptions, codebase gate audit  

**Companion canvas:** open [`freemium-conversion-analysis.canvas.tsx`](/Users/ashishdikonda/.cursor/projects/Users-ashishdikonda-Documents-Office-ZYENE-Our-Products-1-Trackmyopt-TrackMyOPT-TrackMyOPT/canvases/freemium-conversion-analysis.canvas.tsx) beside chat in Cursor

---

## Implementation status (code)

| Phase | Status | Notes |
|------:|--------|-------|
| **0** | **100% code** | Identify on auth; server identify-before-capture + `supabase_user_id`; PricingModal `pricing_cta_viewed` + client `checkout_started` re-identify; webhook user resolve via metadata → `stripe_customer_id` (no email required for analytics); `NORTH_STAR_FUNNEL_EVENTS`; PostHog board + baseline |
| **1** | **100% code · ops blocked** | Premium-only auto-check queue; `skippedFree` in `/uscis/check-all` response; free UI monitor CTA; packaging notice; Pro `nextCheckAt`; stale >24h upsell; manual refresh stays free. **Ops:** gate is **not live yet** — API changes are local/uncommitted; production still auto-checks free cases (2026-07-23 spot-check: 42 free cases refreshed in last 36h vs 1 premium) |
| **2** | **100% code** | H-1B 25, ATS 3, jobs unlimited; partners free; Dedicated = quotas + priority support; pricing/landing/emails/SEO/blog product claims aligned Free=manual / Pro=auto-check |
| 3–6 | Not started | Paywall UX polish, activation, checkout recovery, retention |

**PostHog dashboard:** [Freemium Conversion (Phase 0)](https://us.posthog.com/project/369087/dashboard/1897601)  
**North-star funnel:** [n8q5vuJU](https://us.posthog.com/project/369087/insights/n8q5vuJU) · **Checkout→payment:** [d66YwCNm](https://us.posthog.com/project/369087/insights/d66YwCNm)


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

- [ ] Overnight job skips free cases (verified in logs + spot-check DB `last_checked_at`) — **pending production deploy**
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

### Decision required (pick one for jobs)

**Option A (recommended):** Free unlimited jobs; remove from comparison table.  
**Option B:** Enforce 5 in `createApplication` + UI. Only if you want career tools as a future wedge — data says not now.

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

- [ ] Upgrade prompt → checkout started ≥ 15% (30d rolling, after identify fix)  
- [ ] At least 3 instrumented triggers with non-null `trigger`  
- [ ] Trial CTA visible on case status for free users with a receipt  

### How this solves conversion

Phase 1 creates need; Phase 3 captures need. Without Phase 3, gated auto-check just creates silent frustration.

---

## Phase 4 — Activation & onboarding

### Goal

Fix the 81% drop between signup and `dashboard_viewed`, and the ~97% who never activate.

You cannot monetize users who never reach the case tracker.

### Work items

1. **Define activation** (product)  
   - Recommended: `receipt_added` + at least one successful `case_status_check_completed` within 24h of signup.  

2. **Onboarding path**  
   - After auth: land on case status / “Add receipt” — not a generic empty dashboard.  
   - One primary CTA; defer career tools, insurance, etc.  

3. **Track why dashboard_viewed is low**  
   - Extension-only users?  
   - Auth callback redirect wrong?  
   - Event not firing on real dashboard?  
   - Cross-check with `first_dashboard_viewed_at` on profiles (D1 nudge already uses this).  

4. **D1 / free-receipt reengagement**  
   - You already have crons (`d1-activation-nudge`, `free-receipt-reengagement`). Audit send rates and copy to push **add receipt → first check → Pro trial**.  

5. **PWA / install**  
   - If “install” is a growth goal, instrument `pwa_installed` properly; currently ~0 tracked.  

### Exit criteria

- [ ] Signup → dashboard_viewed ≥ 50% (or explain remaining gap with extension-only cohort)  
- [ ] Signup → receipt_added ≥ 30% within 7 days  
- [ ] Activation definition documented and tracked  

### How this solves conversion

More users at the case-status moment = more people eligible for Phase 1/3 paywalls. Activation is volume; packaging is conversion rate.

---

## Phase 5 — Checkout reliability & payment recovery

### Goal

People who decide to pay should succeed. Today failures ≈ successes, and attribution is broken.

### Work items

1. **Investigate `payment_failed` (18 in 90d)**  
   - Stripe dashboard: decline codes, 3DS, card errors, incomplete subscriptions.  
   - Correlate with webhook handling in `apps/web/app/api/premium/webhook/route.ts`.  

2. **Checkout recovery**  
   - You have `checkout-recovery` cron/lib — verify it runs, emails fire, and links resume the right Stripe session / Customer Portal.  

3. **Identity**  
   - Same as Phase 0: one user ID from PricingModal → Stripe Checkout → webhook → PostHog.  

4. **UX**  
   - After failed payment: clear retry CTA, not silent return to dashboard.  
   - Prefer annual plan presentation if monthly cancels dominate (data: monthly cancels >> annual).  

5. **Trial → paid**  
   - Confirm trial users convert; if they cancel as “unused”, trial did not demonstrate auto-check value (ties to Phase 1).  

### Exit criteria

- [ ] `payment_failed` / (`payment_succeeded` + `payment_failed`) trending down  
- [ ] Checkout recovery email open→pay measurable  
- [ ] PostHog ordered checkout→payment > 40% when payments occur  

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

1. **Dedicated**  
   - Hide or rewrite plan.  
   - Offer existing Dedicated customers a clear Pro migration if attorney access is not real.  

2. **Unused cancel win-back**  
   - Email: “Pro now auto-checks your case daily — reopen alerts.”  

3. **Pricing experiments (only after Phase 1 stable)**  
   - Annual-first default  
   - Trial length (7 vs 3)  
   - Do **not** raise price until auto-check gate is live and understood  

4. **Quota fairness**  
   - Resume max gens skewed (some users >> free limit historically) — audit premium overrides / bugs so free limits actually apply.  

### Exit criteria

- [ ] Active Stripe subs trending up month over month  
- [ ] Cancel reason “unused” declining  
- [ ] Dedicated claims match delivery  

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
| Analytics helpers | `apps/web/lib/posthog-client.ts` |

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
| | Jobs: Option A (unlimited free) vs B (enforce 5) | Product | TBD |
| | Grandfather free auto-check for N days? | Product | TBD |
| | Hide Dedicated? | Product | TBD |

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
