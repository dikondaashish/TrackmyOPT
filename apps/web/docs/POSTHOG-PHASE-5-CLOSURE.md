# Phase 5 — Taxonomy Closure

**Date:** 2026-07-05  
**PostHog project:** [369087](https://us.posthog.com/project/369087)  
**Status:** 100% complete (code + PostHog config)

Closes remaining audit items: missing events (M1), legacy event archive (Q5), blog funnel (M4), extension cohort (L6), error ↔ replay (Issue 5.2 / Q6), post-checkout NPS (L2), and canonical taxonomy docs.

---

## 5.1 — Remaining client events

| Event | File | When |
|-------|------|------|
| `premium_checkout_viewed` | `app/premium/checkout/CheckoutModalClient.tsx` | Checkout modal opens |
| `premium_checkout_completed` | `app/premium/success/PremiumSuccessClient.tsx` | Success page with Stripe session |
| `extension_detected` | `components/analytics/ExtensionAnalyticsTracker.tsx` | Extension present on dashboard (once/session) |
| `activation_completed` | `components/analytics/ActivationCompletedTracker.tsx` | Onboarding + receipt + live status |

Helpers in `lib/posthog-client.ts`; activation logic in `lib/posthog/activation.ts`.

Trackers mount in `DashboardLayoutClient.tsx` alongside `PostHogIdentify`.

---

## 5.2 — Legacy event archive

| Event | Action |
|-------|--------|
| `case_status_enrolled` | **Hidden** in PostHog — [event definition](https://us.posthog.com/project/369087/data-management/events/case_status_enrolled) |

Use `receipt_added` / `receipt_updated` in all new funnels.

---

## 5.3 — Blog → signup dashboard (M4)

| Asset | Link |
|-------|------|
| Dashboard | [Blog → Signup Conversion](https://us.posthog.com/project/369087/dashboard/1802603) |
| Funnel insight | [Blog CTA → Signup](https://us.posthog.com/project/369087/insights/sztU304L) |
| Volume trend | [Blog CTA clicks](https://us.posthog.com/project/369087/insights/BCAmIe8i) |

`blog_product_cta_clicked` was already instrumented in `BlogProductCTA.tsx`.

---

## 5.4 — Extension cohort & activation (L6)

| Asset | Link |
|-------|------|
| Cohort | [Extension users](https://us.posthog.com/project/369087/cohorts/396240) — `extension_detected` ≥1 in 90d |
| Funnel insight | [Extension → Activation](https://us.posthog.com/project/369087/insights/5er0tgqW) |

Extension version resolved from `data-trackmyopt-extension` / `tmo_extension_version`.

---

## 5.5 — Error ↔ replay (Issue 5.2, Q6)

| Change | Detail |
|--------|--------|
| Panel boundaries | `CaseTimelineErrorBoundary.tsx` + `CaseStatusPanelErrorBoundary` call `captureErrorBoundaryTriggered` |
| Session link | `$session_id` attached via `posthog.get_session_id()` in `captureErrorBoundaryTriggered` |
| Weekly digest | [Subscription 86776](https://us.posthog.com/project/369087/subscriptions/86776) — UX/Bug dashboard, Mondays 15:00 UTC, AI summary |

Insights in digest: JS exceptions, rage clicks, error boundary (dashboard [1707550](https://us.posthog.com/project/369087/dashboard/1707550)).

---

## 5.6 — Post-checkout NPS (L2)

| Asset | Link |
|-------|------|
| Survey | [NPS after premium checkout](https://us.posthog.com/project/369087/surveys/019f347f-8f11-0000-3265-519683f516e7) |

- **Type:** Popover, schedule `once`
- **Trigger:** `premium_checkout_completed` (client on success page)
- **Cooldown:** 30 days since any survey

---

## 5.7 — Taxonomy documentation

| Doc | Purpose |
|-----|---------|
| [EVENT_TAXONOMY.md](../lib/posthog/EVENT_TAXONOMY.md) | Canonical event + cohort + survey reference |
| [LEGACY_EVENTS.md](../lib/posthog/LEGACY_EVENTS.md) | Deprecated events + billing validation status |

---

## Verification (Phase 5)

After deploy, confirm in PostHog Live Events:

1. Open `/premium/checkout` → `premium_checkout_viewed`
2. Complete checkout → `/premium/success` → `premium_checkout_completed` (+ NPS popover)
3. Dashboard with extension → `extension_detected`
4. Activated user on dashboard → `activation_completed` (once, localStorage key `tmo:activation_completed_captured`)
5. Force case-status panel error → `error_boundary_triggered` with `$session_id`

---

## Related phases

- [POSTHOG-PHASE-4-DATA-PLATFORM.md](./POSTHOG-PHASE-4-DATA-PLATFORM.md)
- [POSTHOG-COMPREHENSIVE-AUDIT-AND-ROADMAP.md](./POSTHOG-COMPREHENSIVE-AUDIT-AND-ROADMAP.md)
