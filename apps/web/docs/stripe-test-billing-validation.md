# Stripe test-mode billing validation

Safe local workflow for validating TrackMyOPT billing webhooks → PostHog → Revenue dashboard **without live charges**.

**Do not** add test Stripe keys to Vercel Production or Preview (production requires `sk_live_*`).  
**Do not** run this guide against production checkout with real cards.

Related: [PAYMENT_FLOW_AUDIT.md](./PAYMENT_FLOW_AUDIT.md) · PostHog project **369087** · Revenue dashboard **1707552**

---

## Prerequisites

- Stripe account with **Test mode** access
- [Stripe CLI](https://docs.stripe.com/stripe-cli/install) installed (`stripe login`)
- Local `.env.local` with Supabase + PostHog (already used for dev)
- Copy `.env.test.local.example` → `.env.test.local` and fill **test-only** Stripe values (gitignored)

---

## A. Stripe Dashboard setup (Test mode)

1. Open [Stripe Dashboard](https://dashboard.stripe.com) and toggle **Test mode** (top-right).
2. **Developers → API keys** — copy (do not commit):
   - Secret key → `sk_test_...`
   - Publishable key → `pk_test_...`
3. **Products** — create or mirror TrackMyOPT plans in **test mode** (names/prices can match production; IDs will differ):

   | App plan | Billing interval | Env variable |
   |----------|------------------|--------------|
   | Pro | Monthly | `STRIPE_PRICE_PRO_MONTHLY` |
   | Pro | Yearly | `STRIPE_PRICE_PRO_YEARLY` |
   | Dedicated | Monthly | `STRIPE_PRICE_DEDICATED_MONTHLY` |
   | Dedicated | Yearly | `STRIPE_PRICE_DEDICATED_YEARLY` |

   For each product, add a recurring price and copy the **test** `price_...` ID into `.env.test.local`.

4. **Optional promos** (if testing EARLYBIRD auto-apply):
   - Create promotion codes in test mode
   - Set `STRIPE_PROMO_CODE_PRO` / `STRIPE_PROMO_CODE_DEDICATED` to test `promo_...` IDs

5. **Pro trial** — ensure the Pro price used at checkout has a **7-day trial** configured if you are testing the trial funnel (matches production `trial_period_days: 7` in `create-checkout`).

### Test cards (Test mode only)

| Scenario | Card number |
|----------|-------------|
| Success | `4242 4242 4242 4242` |
| Decline | `4000 0000 0000 0002` |

Use any future expiry, any CVC, any ZIP.

---

## B. Local env setup

### Template

```bash
cd apps/web
cp .env.test.local.example .env.test.local
# Edit .env.test.local — placeholders only in the example file; put real test values in .env.test.local
```

### Required variables in `.env.test.local`

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Test secret (`sk_test_*`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test publishable (`pk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or test webhook endpoint (`whsec_*`) |
| `STRIPE_PRICE_PRO_MONTHLY` | Test price ID |
| `STRIPE_PRICE_PRO_YEARLY` | Test price ID |
| `STRIPE_PRICE_DEDICATED_MONTHLY` | Test price ID |
| `STRIPE_PRICE_DEDICATED_YEARLY` | Test price ID |
| `STRIPE_PROMO_CODE_PRO` | Optional test promo |
| `STRIPE_PROMO_CODE_DEDICATED` | Optional test promo |

### PostHog

Reuse project **369087** from `.env.local`:

- `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` (or `NEXT_PUBLIC_POSTHOG_KEY`)
- `NEXT_PUBLIC_POSTHOG_HOST` (e.g. `https://us.i.posthog.com`)

Only add these to `.env.test.local` if they are missing from `.env.local`.

### Supabase warning

Local `.env.local` typically points at **production Supabase**. Test checkouts will write to real `profiles`, `payment_transactions`, and may send transactional emails if SMTP is configured.

**Safer options:**

- Use a **dedicated test user** account (not a real customer), or
- Override `NEXT_PUBLIC_SUPABASE_*` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.test.local` with a **staging** Supabase project

---

## C. Stripe CLI webhook forwarding

Terminal 1 — forward test webhooks to local Next.js:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/premium/webhook
```

Copy the printed signing secret (`whsec_...`) into `.env.test.local` as `STRIPE_WEBHOOK_SECRET`.

Restart the dev server after updating the webhook secret.

**Verify:** CLI shows `200` responses when events fire. Unsigned POSTs to the webhook should return `400` (expected).

---

## D. Run local dev with test Stripe overrides

Next.js loads `.env.local` automatically but **does not** load `.env.test.local`. Override Stripe vars by sourcing both files (test file second):

```bash
cd apps/web
set -a
source .env.local
source .env.test.local   # overrides STRIPE_* only
set +a
npm run dev
```

Alternative with dotenv-cli:

```bash
npx dotenv-cli -e .env.local -e .env.test.local -- npm run dev
```

### Before checkout — confirm TEST mode

On the **first** billing API call, server logs should show:

```
[create-checkout] STRIPE_SECRET_KEY is TEST (sk_test_*). Safe for Stripe test cards (e.g. 4242…).
[create-checkout] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is TEST (pk_test_*).
```

If you see **LIVE (sk_live_*)** warnings, stop — `.env.test.local` is not overriding `.env.local`.

### Safety rules

- Never use real cards when `sk_test_*` is not active
- Never paste `sk_test_*` / `whsec_*` into Vercel Production or Preview env
- Never commit `.env.test.local`
- Record a **test start timestamp** (UTC) before flows for PostHog queries

---

## Billing validation checklist

Use a dedicated test user. Note `TEST_START_UTC` before flow A.

### A. Checkout started

1. Log in → start Pro checkout (do not complete yet if testing reuse separately).
2. **PostHog** — `checkout_started`:
   - `distinct_id` = Supabase user UUID
   - Properties: `plan_tier`, `interval`, `is_upgrade`, `session_reused`, `had_trial`
   - **Must not include:** email, Stripe customer/subscription/session IDs, card data

### B. Pro trial checkout

1. Complete checkout with `4242 4242 4242 4242` (Pro with trial eligible).
2. **PostHog** (webhook-driven, may take a few seconds):
   - `trial_started`
   - `subscription_started`
   - `payment_succeeded` — **may also fire** on first invoice / checkout path (document count for P2 dedupe)
3. **Revenue dashboard** — Trial → subscription funnel should show data after refresh.

### C. Paid checkout (non-trial or Dedicated)

1. Use Dedicated or Pro without trial / trial already consumed.
2. **PostHog**:
   - `payment_succeeded` — `amount_cents`, `currency`, `plan_tier`, `interval`
   - `subscription_started`
3. No Stripe customer ID, subscription ID, or invoice ID in event properties.

### D. Failed payment

1. Start checkout; pay with `4000 0000 0000 0002` (if flow reaches payment).
2. **PostHog**:
   - `payment_failed`
   - `failure_code` when available
3. Webhook returns **2xx**; app does not crash.

### E. Cancellation

1. Cancel test subscription via Settings → billing / Customer Portal / Stripe test dashboard.
2. **PostHog**:
   - `subscription_canceled`
   - `plan_tier`

### F. Optional upgrade (Pro → Dedicated)

1. Start from active Pro test subscription → upgrade to Dedicated.
2. **PostHog**:
   - `checkout_started` with `is_upgrade: true` (and `from_plan` / `to_plan` when applicable)
   - `subscription_upgraded` — **may fire from API and webhook** (document duplicates for P2)

### Duplicate behavior to document (do not fix in this pass)

| Event | Known duplicate risk |
|-------|----------------------|
| `payment_succeeded` | `checkout.session.completed` + `invoice.paid` |
| `payment_failed` | `async_payment_failed`, `payment_intent.payment_failed`, `invoice.payment_failed` |
| `subscription_upgraded` | `create-checkout` instant upgrade + `subscription.pending_update_applied` webhook |
| `checkout_started` | New session vs reused open session (`session_reused: true`) |

---

## PostHog verification (HogQL)

Replace `TEST_START_UTC` with your test start time, e.g. `2026-06-14 18:00:00`.

Project: **369087** → SQL / HogQL

### Event counts since test start

```sql
SELECT
  event,
  count() AS events,
  count(DISTINCT distinct_id) AS unique_users,
  min(timestamp) AS first_seen,
  max(timestamp) AS last_seen
FROM events
WHERE timestamp >= toDateTime('TEST_START_UTC')
  AND event IN (
    'checkout_started',
    'trial_started',
    'payment_succeeded',
    'subscription_started',
    'payment_failed',
    'subscription_canceled',
    'subscription_upgraded'
  )
GROUP BY event
ORDER BY event
```

### Latest properties per billing event

```sql
SELECT
  event,
  distinct_id,
  timestamp,
  properties.plan_tier,
  properties.interval,
  properties.is_upgrade,
  properties.session_reused,
  properties.had_trial,
  properties.amount_cents,
  properties.currency,
  properties.failure_code,
  properties.from_plan,
  properties.to_plan
FROM events
WHERE timestamp >= toDateTime('TEST_START_UTC')
  AND event IN (
    'checkout_started',
    'trial_started',
    'payment_succeeded',
    'subscription_started',
    'payment_failed',
    'subscription_canceled',
    'subscription_upgraded'
  )
ORDER BY timestamp DESC
LIMIT 50
```

### Privacy — forbidden properties (should return zero rows)

```sql
SELECT
  event,
  distinct_id,
  timestamp,
  properties
FROM events
WHERE timestamp >= toDateTime('TEST_START_UTC')
  AND event IN (
    'checkout_started',
    'trial_started',
    'payment_succeeded',
    'subscription_started',
    'payment_failed',
    'subscription_canceled',
    'subscription_upgraded'
  )
  AND (
    properties.email IS NOT NULL
    OR properties.stripe_customer_id IS NOT NULL
    OR properties.stripe_subscription_id IS NOT NULL
    OR properties.stripe_checkout_session_id IS NOT NULL
    OR properties.invoice_id IS NOT NULL
    OR properties.payment_intent_id IS NOT NULL
    OR properties.card_last4 IS NOT NULL
    OR properties.payment_method IS NOT NULL
    OR properties.monthly_income IS NOT NULL
    OR properties.receipt_number IS NOT NULL
  )
```

### Duplicate check — multiple `payment_succeeded` per user in a short window

```sql
SELECT
  distinct_id,
  count() AS payment_succeeded_count,
  groupArray(timestamp) AS timestamps,
  groupArray(properties.plan_tier) AS plans
FROM events
WHERE timestamp >= toDateTime('TEST_START_UTC')
  AND event = 'payment_succeeded'
GROUP BY distinct_id
HAVING payment_succeeded_count > 1
ORDER BY payment_succeeded_count DESC
```

### UUID `distinct_id` check (invalid IDs)

```sql
SELECT DISTINCT distinct_id
FROM events
WHERE timestamp >= toDateTime('TEST_START_UTC')
  AND event IN (
    'checkout_started',
    'trial_started',
    'payment_succeeded',
    'subscription_started',
    'payment_failed',
    'subscription_canceled',
    'subscription_upgraded'
  )
  AND NOT match(distinct_id, '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
```

### Revenue dashboard

After flows complete, refresh [Revenue dashboard 1707552](https://us.posthog.com/project/369087/dashboard/1707552):

- Funnel A: Dashboard → paid
- Funnel B: Checkout → payment
- Funnel C: Trial → subscription
- Payment succeeded by plan
- Payment failure by code
- Subscription canceled
- Revenue proxy (`amount_cents` sum) — proxy only until P2 dedupe

---

## Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `sk_live_*` in dev logs | `.env.test.local` not sourced or missing |
| Checkout 500 / invalid price | Live `price_...` IDs with `sk_test_*` — use **test** price IDs |
| Webhook 400 signature | `STRIPE_WEBHOOK_SECRET` mismatch — use `stripe listen` secret |
| No PostHog billing events | Webhook not forwarded; PostHog token missing server-side |
| Production deploy rejects test keys | Expected — `requireLiveStripeKeyInProduction()` in production only |

---

## Code references

- Checkout: `app/api/premium/create-checkout/route.ts`
- Webhook + analytics: `app/api/premium/webhook/route.ts`
- Key safety: `lib/stripe/requireLiveKeyInProduction.ts` (`guardStripeKeyForBilling`)
