# Phase 4 — Data Platform Maturity

**Date:** 2026-07-05  
**PostHog project:** [369087](https://us.posthog.com/project/369087)  
**Status:** 100% complete (code + PostHog config)

---

## 4.1 — Stripe ↔ PostHog LTV

### Layer A — Person property sync (shipped)

Supabase `payment_transactions` → PostHog person properties (no PII):

| Property | Source |
|----------|--------|
| `lifetime_revenue_cents` | Sum of succeeded payments |
| `lifetime_payment_count` | Count of succeeded payments |
| `first_payment_date` | Earliest succeeded payment |
| `last_payment_date` | Latest succeeded payment |
| `ltv_currency` | Latest payment currency |

| File | Role |
|------|------|
| `lib/posthog/ltv-sync.ts` | Aggregate + `identifyServerUser` |
| `app/api/cron/posthog-ltv-sync/route.ts` | Nightly batch (env-gated) |
| `app/api/premium/webhook/route.ts` | Real-time refresh after `payment_succeeded` |

**Enable cron:**

```bash
POSTHOG_LTV_SYNC_ENABLED=true
```

**Vercel cron:** daily 06:00 UTC → `/api/cron/posthog-ltv-sync`

### Layer B — Stripe warehouse (connect when ready)

No Stripe warehouse source exists yet in project 369087. Connect via PostHog UI:

1. Open [Stripe connect page](https://us.posthog.com/project/369087/data-warehouse/connect?kind=Stripe) (credentials entered in PostHog UI only — never in chat).

Person-property sync works immediately; warehouse adds refund/charge-level drill-down once connected.

### Dashboard

| Asset | Link |
|-------|------|
| LTV & Partner Analytics | [Dashboard 1802593](https://us.posthog.com/project/369087/dashboard/1802593) |
| Revenue sum insight | [LTV — revenue](https://us.posthog.com/project/369087/insights/5tx1SaWK) |

---

## 4.2 — Group analytics (university partners)

Group type: `university_partner` (referral codes from `referrals` table / `profiles.referred_by`).

| File | Role |
|------|------|
| `lib/posthog/university-partner-groups.ts` | Partner lookup + property mapping |
| `lib/posthog-server.ts` | `identifyServerGroup`, `associateUserWithServerGroup` |
| `lib/posthog-client.ts` | `associateUniversityPartnerGroup` (browser) |
| `components/analytics/PostHogIdentify.tsx` | Client group on dashboard load |
| `app/api/analytics/partner-group/route.ts` | Auth'd server group upsert |
| `app/api/cron/posthog-partner-groups-sync/route.ts` | Weekly referral stats refresh |

**Event:** `partner_group_associated` (server, on group link)

**Enable cron:**

```bash
POSTHOG_PARTNER_GROUPS_SYNC_ENABLED=true
```

**Vercel cron:** Mondays 07:00 UTC → `/api/cron/posthog-partner-groups-sync`

**PostHog setup:** Enable group analytics for `university_partner` in [Project settings → Group analytics](https://us.posthog.com/project/369087/settings/project#group-analytics) if not auto-created on first `$groupidentify`.

| Insight | Link |
|---------|------|
| Partner associations | [OcEBUgJR](https://us.posthog.com/project/369087/insights/OcEBUgJR) |

---

## 4.3 — Autocapture scope reduction

Dashboard routes no longer emit `$autocapture`, `$rageclick`, or `$dead_click`. Marketing (`/`, `/login`, `/blog`, etc.) unchanged.

| File | Mechanism |
|------|-----------|
| `lib/posthog/posthog-browser.ts` | `before_send` drops autocapture on `/dashboard*` and `/api*` |

Custom events + masked session replay remain the source of truth for product analytics.

---

## 4.4 — Automated weekly analytics digest

Two subscriptions created (complementary):

| Subscription | Type | Schedule | Recipient |
|--------------|------|----------|-----------|
| [86775](https://us.posthog.com/project/369087/subscriptions/86775) | North Star dashboard + AI summary | Weekly Mondays | zyene.inc@gmail.com |
| [86774](https://us.posthog.com/project/369087/subscriptions/86774) | AI prompt digest (activation + revenue + retention) | Weekly | zyene.inc@gmail.com |

North Star dashboard: [1802474](https://us.posthog.com/project/369087/dashboard/1802474)

---

## Phase 4 exit criteria — met

| Step | Status |
|------|--------|
| 4.1 Stripe ↔ PostHog LTV | ✅ Person-property sync + LTV dashboard; warehouse connect documented |
| 4.2 Group analytics (university partners) | ✅ `university_partner` groups + cron + insight |
| 4.3 Autocapture scope reduction | ✅ Dashboard `/api` paths filtered |
| 4.4 Weekly analytics digest | ✅ Dashboard + AI prompt subscriptions |

---

## Deploy checklist

1. Deploy app code (LTV sync, partner groups, autocapture filter).
2. Set `POSTHOG_LTV_SYNC_ENABLED=true` and `POSTHOG_PARTNER_GROUPS_SYNC_ENABLED=true`.
3. Run initial LTV backfill: `curl .../api/cron/posthog-ltv-sync?limit=200&offset=0` (repeat until `hasMore: false`).
4. Connect Stripe warehouse in PostHog when read-only Stripe key is available.
5. Confirm group type `university_partner` in PostHog project settings.
6. Verify first weekly digest arrives Monday 2026-07-07 / 2026-07-13.
