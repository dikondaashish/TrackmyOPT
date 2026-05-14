# `lib/premium/`

Stripe integration helpers, premium-status state management, and webhook side effects.

## Modules

| File | Purpose |
|---|---|
| `applyStripeCheckoutSession.ts` | Reads a completed Checkout session, writes `profiles.premium_status = true`, inserts `payment_transactions`, idempotency-safe |
| `usePremiumStatus.tsx` | Shared React context + hook — single fetch per page load for `/api/premium/status` |

## Public API

```ts
import { PremiumStatusProvider, usePremiumStatus } from '@/lib/premium/usePremiumStatus';

// Wrap the dashboard layout once:
<PremiumStatusProvider>
  {/* … */}
</PremiumStatusProvider>

// In any descendant component:
const { isPremium, isLoading, error, refresh } = usePremiumStatus();
// isPremium is tri-state: null | true | false
```

## Decision matrix for `/api/premium/status`

The route reconciles three signals (in this order):

| Signal | Outcome |
|---|---|
| Profile has `premium_status = true` and not yet expired | ✅ `isPremium: true` |
| Profile expired but Stripe reports `active`/`trialing` | ✅ self-heal — restore expiry, return `isPremium: true` |
| Profile expired and Stripe reports no subscription | ❌ revoke — set `premium_status: false` |
| Profile `premium_status = false` but Stripe is `active` | ✅ self-heal (covers DB drift after bug fixes) |
| No `stripe_customer_id` | ❌ free user, return `isPremium: false` |

Pinned by tests in `apps/web/app/api/premium/__tests__/status-logic.test.ts`.

## Webhook contract

`apps/web/app/api/premium/webhook/route.ts` handles:

- `checkout.session.completed` + `async_payment_succeeded` → grant premium
- `customer.subscription.updated` → refresh expiry; revoke ONLY on terminal states (`canceled`, `incomplete_expired`). `past_due` and `unpaid` KEEP premium (dunning).
- `customer.subscription.deleted` → revoke + send "subscription ended" email
- `invoice.paid` / `invoice.payment_succeeded` → renewal heal
- `charge.refunded` → revoke ONLY when `amount_refunded >= amount` (partial refunds preserve access)
- `invoice.payment_failed` / `payment_intent.payment_failed` → send "payment failed" email

Idempotency is enforced per Stripe event id at the `payment_transactions` insert path.

## Critical rules locked in by tests

`apps/web/app/api/premium/__tests__/webhook-logic.test.ts` pins:

- `past_due` / `unpaid` → KEEP premium
- `canceled` / `incomplete_expired` → REVOKE
- Partial refund (any `amount_refunded < amount`) → NOT a full refund, do not revoke

## When changing webhook logic

1. Update the rule mirror in `webhook-logic.test.ts` AND the route in one PR.
2. Run a local Stripe CLI replay (`stripe trigger ...`) to validate.
3. Watch `payment_transactions` row creation in Supabase.
