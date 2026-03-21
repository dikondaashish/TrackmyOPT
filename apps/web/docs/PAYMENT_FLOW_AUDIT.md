# Payment flow audit (Stripe + Supabase)

**Scope:** Plan selection → Checkout Session → Payment → Success/failure → Webhooks → DB/session sync.  
**Code refs:** `app/api/premium/create-checkout`, `confirm-checkout`, `webhook`, `lib/premium/applyStripeCheckoutSession`, UI: `PricingModal`, `CheckoutModalClient`, `premium/success`, `components/pricing/pricing-module`.

---

## Post-audit fixes (resolved)

| Issue | Resolution |
|-------|------------|
| **Refunds did not revoke access** when `payment_transactions.stripe_payment_intent_id` was synthetic | Added `stripe_subscription_id` column + populate on checkout completion; `charge.refunded` now updates by PI, then `stripe_subscription_id`, then `stripe_checkout_session_id` (PI metadata / invoice metadata), then revokes `profiles.premium_status` for matched `user_id`s. |
| **Expiry not written to DB** | `GET /api/premium/status` now updates `profiles` (`premium_status: false`, `plan_tier: null`) when `subscription_expires_at` is in the past before returning. |
| **Duplicate Checkout Sessions (multi-tab)** | `create-checkout` reuses an **open** Stripe session if the user has a `payment_transactions` row with `status: pending` and `created_at` within 10 minutes **and** the session targets the same Stripe Price **and** the same `metadata.checkout_promo` (promo intent); otherwise creates a new session. Pending row insert dedupes multi-tab. `applyStripeCheckoutSession` **updates** that row on success (pending→succeeded). |
| **Promo / EARLYBIRD** | POST body optional `promoCode`: omitted = auto-apply `STRIPE_PROMO_CODE_PRO` or `STRIPE_PROMO_CODE_DEDICATED` by `planId` (both intervals for that plan); `null` = no `discounts`; string = `stripe.promotionCodes.list({ code, active: true, limit: 1 })`. Hosted Checkout does **not** use `allow_promotion_codes`. UI: `PromoCodeCheckoutBar` in `PricingModal` and `SubscriptionSettings`. |
| **Live vs test key in production** | `requireLiveStripeKeyInProduction()` in `lib/stripe/requireLiveKeyInProduction.ts` — throws if `NODE_ENV === 'production'` and `STRIPE_SECRET_KEY` does not start with `sk_live_`. Used in `create-checkout`, `confirm-checkout`, and webhook `getStripe()`. |

**DB migration:** `supabase/migrations/20260219_payment_transactions_subscription_id.sql` adds `stripe_subscription_id`. Apply in Supabase before relying on subscription-based refund matching.

---

## 1. Plan selection

| Status | Notes |
|--------|--------|
| **Working** (with fixes) | Server is source of truth: `POST /api/premium/create-checkout` accepts `planId` ∈ `pro` \| `dedicated` and `interval` ∈ `month` \| `year`, maps to `STRIPE_PRICE_*` env vars. Display prices on marketing UI are informational only. |
| **Was broken / risk** | `CheckoutModalClient` queried non-existent column `is_premium` instead of `premium_status`, so “current plan” UI could be wrong for paying users. **Fixed:** use `premium_status`. |
| **Was broken / risk** | Landing `PricingModule` CTAs were inert `<Button>`s with no navigation. **Fixed:** optional `buildPlanHref` → `LandingPricing` links to `/login?redirect=…/premium/checkout?planId=&interval=`. |

**Residual risk:** Marketing copy prices must stay aligned with Stripe Price IDs (manual discipline).

---

## 2. Checkout initiation

| Status | Notes |
|--------|--------|
| **Working** | `line_items: [{ price: priceId, quantity: 1 }]`, `mode: 'subscription'`, optional `discounts` from promo resolution, `metadata.supabase_user_id`, `metadata.planId`, `metadata.interval`, `metadata.checkout_promo` (reuse key), `subscription_data.metadata` for plan/interval, Pro trial via `trial_period_days: 7`. |
| **Partial / cosmetic** | Client sometimes sent `successUrl` / `cancelUrl` in JSON; **server ignored them** (success/cancel URLs are set only in `create-checkout`). **Fixed** client payloads to stop sending dead fields; server URLs remain canonical. |
| **Working** | Stale `stripe_customer_id` in DB: `customers.retrieve` failure clears ID and creates a new customer. |
| **Resolved** | See **Duplicate Checkout Sessions** above. |

---

## 3. Payment processing (Stripe)

| Status | Notes |
|--------|--------|
| **Working** | Uses official Stripe SDK, env `STRIPE_SECRET_KEY`, API version `2025-09-30.clover`. |
| **Working** | Errors mapped to HTTP 400/500 with messages where possible (promo, price, API key). |
| **Resolved** | Production must use `sk_live_` — see **Live vs test key** above. |

---

## 4. Success & failure states

| Status | Notes |
|--------|--------|
| **Working** | Success redirect: `/premium/success?session_id={CHECKOUT_SESSION_ID}&planId=…`. |
| **Working** | `POST /api/premium/confirm-checkout` verifies: same user as `session.metadata.supabase_user_id`, `session.status === complete`, `payment_status` ∈ `paid` \| `no_payment_required` (covers $0 trial start). |
| **Working** | Success page retries confirm up to **5** times with backoff (handles webhook delay / race). Shows copy if sync fails. |
| **Working** | `applyStripeCheckoutSession` idempotent via `payment_transactions.stripe_checkout_session_id`; pending rows are updated to succeeded. |
| **Improved** | Cancel URL was `/premium/checkout?canceled=true` with no handling. **Now:** `cancel_url` → `/premium/cancelled` (dedicated page). |
| **Improved** | `PricingModal` / `SubscriptionSettings` now surface **API error strings** and send `credentials: 'include'`. |

---

## 5. Webhooks

| Status | Notes |
|--------|--------|
| **Working** | Raw body + `stripe-signature` verified with `STRIPE_WEBHOOK_SECRET`. |
| **Working** | `checkout.session.completed` and `checkout.session.async_payment_succeeded` call `applyStripeCheckoutSession` (duplicate safe). |
| **Working** | `customer.subscription.updated` / `deleted` adjust `profiles` (premium revoke path). |
| **Resolved** | `charge.refunded` matches transactions by PI, `stripe_subscription_id`, or `stripe_checkout_session_id`, then revokes premium on matched users. `payment_intent.*` may still miss subscription-only synthetic PI ids if no row updated — subscription/refund path covers entitlement. |

---

## 6. Edge cases

| Scenario | Assessment |
|----------|------------|
| **Network timeout** | Success page retries confirm-checkout; user may land on dashboard before sync — mitigated by retries + webhook. |
| **Duplicate submission** | **Mitigated:** open session reuse + pending row within 10 minutes (see post-audit fixes). |
| **Back button** | Returning to success page re-runs confirm; idempotent. |
| **Declined card** | Checkout does not complete; user stays in Stripe; no profile upgrade. |
| **Async payment methods** | `checkout.session.async_payment_succeeded` / `async_payment_failed` handled in webhook. |

---

## 7. Database / session sync

| Status | Notes |
|--------|--------|
| **Working** | `applyStripeCheckoutSession` sets `profiles.premium_status`, `plan_tier`, `subscription_expires_at`, Stripe IDs, inserts/updates `payment_transactions` including `stripe_subscription_id`. |
| **Resolved** | Expired subscriptions: `GET /api/premium/status` persists `premium_status: false` / `plan_tier: null` when past `subscription_expires_at`. |
| **Session** | Premium for UI comes from `/api/premium/status` and client fetches after navigation; no JWT claim for premium. |

---

## Ops checklist (cannot verify in repo)

- [ ] Stripe Dashboard: Webhook endpoint URL matches deployment + events enabled for all handled types.
- [ ] All `STRIPE_PRICE_*` and optional `STRIPE_PROMO_CODE_*` env vars set in production.
- [ ] Stripe Customer Portal configured for plan changes/cancel (used by `/api/premium/portal`).
- [ ] Run migration `20260219_payment_transactions_subscription_id.sql` on production Supabase.

---

*Last updated: post-audit fixes (refunds, expiry persist, checkout dedupe, live key guard).*
