# Billing & refund compliance QA checklist

**Attorney review:** Have US counsel review `legal-config.ts`, Refund Policy, Terms subscription section, and checkout copy before marketing changes.

## Policy change workflow (dev rule)

| Change type | Action |
|-------------|--------|
| Wording cleanup only (no change to price, trial, refund windows, cancellation rights) | Update page + bump `LEGAL_POLICY_VERSIONS` in `apps/web/lib/billing/legal-config.ts` + migration seed |
| **Material** change (price, renewal, cancellation, refund rights) | Email active subscribers (`sendMaterialPolicyChangeEmail`), in-app banner, effective date in future |

## Signup & checkout

- [ ] Pro checkout shows 7-day trial disclosure when eligible; no trial when `proFreeTrialConsumed`
- [ ] Dedicated checkout states immediate charge + 3-day first-month money-back guarantee
- [ ] Checkbox required; API rejects `recurringBillingAccepted: false`
- [ ] `billing_consent_events` row created with IP/UA, policy versions, `disclosures_json`
- [ ] Stripe session metadata includes policy version IDs

## Trial conversion

- [ ] Trial started email after checkout (`trial_started`)
- [ ] Trial ending reminder (`trial_ending` via Stripe `trial_will_end`)
- [ ] First charge sends receipt or welcome path

## Cancellation

- [ ] Settings → Billing shows **Cancel subscription** with access end date
- [ ] Portal cancel triggers confirmation email with access-through date
- [ ] `subscription_cancel_initiated` audit event
- [ ] No refund implied after trial/guarantee windows

## Refund exceptions

- [ ] Billing error / fraud / major outage paths documented in Refund Policy + FAQ
- [ ] Charge.refunded webhook + acknowledgment email still work

## Policy versioning

- [ ] `policy_versions` includes `refund_policy` and `subscription_billing_terms`
- [ ] User `policy_consents` recorded at checkout

## Admin / disputes

- [ ] `GET /api/admin/billing-evidence?email=` with `Authorization: Bearer ADMIN_SECRET` returns packet
- [ ] Packet includes consents, transactions, billing emails

## Copy consistency

- [ ] Refund Policy, Terms § subscriptions, Subscription FAQ match `legal-config.ts`
