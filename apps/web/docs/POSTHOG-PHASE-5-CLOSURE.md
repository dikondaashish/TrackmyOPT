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

---

## Production ops status

**Verified:** 2026-07-06 (PostHog MCP + production cron curl; Stripe CLI unavailable in this environment)

| Item | Status | Notes |
|------|--------|-------|
| `CRON_SECRET` (Vercel prod) | **DONE** | Bearer auth accepted on `www.trackmyopt.com` cron routes (2026-07-06) |
| `AT_RISK_REENGAGEMENT_ENABLED` | **PENDING** | Not `true` in prod — weekly sends disabled by design |
| `POSTHOG_LTV_SYNC_ENABLED` | **PENDING** | Prod curl returns `skipped` — 0 persons with `lifetime_revenue_cents` |
| `POSTHOG_PARTNER_GROUPS_SYNC_ENABLED` | **PENDING** | Not verified in prod; 0 `partner_group_associated` events in taxonomy |
| `POSTHOG_SOURCEMAPS_ENABLED` | **PENDING** | Set in Vercel + `POSTHOG_PERSONAL_API_KEY` + `POSTHOG_PROJECT_ID=369087` for symbol upload |
| `POSTHOG_PERSONAL_API_KEY` | **PENDING** | Required for `@posthog/nextjs-config` source map upload |
| `POSTHOG_PROJECT_ID` | **PENDING** | Should be `369087` when source maps enabled |
| LTV backfill cron | **PENDING** | Enable `POSTHOG_LTV_SYNC_ENABLED`, then `curl .../posthog-ltv-sync?limit=200&offset=N` until `hasMore: false` |
| Stripe Data Warehouse | **PENDING** | No Stripe tables in project 369087 data warehouse (connect in [PostHog UI](https://us.posthog.com/project/369087/data-warehouse/connect?kind=Stripe)) |
| `university_partner` group analytics | **PENDING** | Enable in [Group analytics settings](https://us.posthog.com/project/369087/settings/project#group-analytics); 0 groups in `groups` table |
| Heatmaps (Homepage, Login, Dashboard) | **DONE** | All 3 saved heatmaps `status: completed` (2026-07-06 MCP) |
| Weekly digest subs 86774, 86775, 86776 | **PENDING** | Created 2026-07-05; first Monday delivery not yet confirmed in this pass |
| Error tracking symbol sets | **PENDING** | Requires prod build with `POSTHOG_SOURCEMAPS_ENABLED=true` — verify in PostHog Error Tracking after deploy |

### Cron dry-run output (prod, 2026-07-06)

`at-risk-reengagement?dry_run=true` (before deploy of dry-run fix — returns `skipped` when flag off; after fix, re-run for eligible count):

```json
{"ok":true,"skipped":true,"reason":"AT_RISK_REENGAGEMENT_ENABLED is not true — set it to enable the weekly at-risk retention cron."}
```

`posthog-ltv-sync?limit=5&offset=0`:

```json
{"ok":true,"skipped":true,"reason":"POSTHOG_LTV_SYNC_ENABLED is not true."}
```

**Do not** set `AT_RISK_REENGAGEMENT_ENABLED=true` without explicit approval.
