# PostHog legacy events & billing analytics status

## Billing analytics (not validated — do not trust for revenue)

| Event / metric | Status |
|----------------|--------|
| `checkout_started` | Validated (client/server capture) |
| `trial_started`, `payment_succeeded`, `subscription_started`, `payment_failed`, `subscription_canceled`, `subscription_upgraded` | **Unvalidated** — Stripe webhook flows not tested in test mode |
| Revenue dashboard proxy (`amount_cents` sum) | **Proxy only** — not final revenue; duplicates possible |

**Deferred (P2 billing):** `payment_succeeded` dedupe, `payment_failed` dedupe, `subscription_upgraded` dedupe, revenue proxy cleanup.

## Legacy case-status enrollment event

| Event | Status | Migration |
|-------|--------|-----------|
| `case_status_enrolled` | **Removed (2026-06-13)** | Historical data only. Use `receipt_added` / `receipt_updated`. |
| `receipt_added` | **Preferred** | First save of a receipt for the user |
| `receipt_updated` | **Preferred** | Subsequent receipt or notification changes |

**New dashboards and funnels:** use `receipt_added` / `receipt_updated` only.
