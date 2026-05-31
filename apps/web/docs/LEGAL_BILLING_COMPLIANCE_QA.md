# Legal & billing compliance QA

**Not legal advice.** Have U.S. counsel review all public legal pages before launch.

## Public pages

- [ ] `/privacy` loads; version date matches `LEGAL_VERSION_ID` in `lib/legal/legal-config.ts`
- [ ] `/terms` loads; immigration disclaimer (§2A) visible; no government affiliation claims
- [ ] `/refund-policy` loads; Pro 7-day trial + Dedicated 3-day guarantee match code
- [ ] `/disclaimer` loads; not legal advice; no outcome guarantees
- [ ] `/cookie-policy` loads; lists PostHog/Vercel when used
- [ ] `/security` loads; no false SOC2/PCI claims

## Footer & navigation

- [ ] Footer links: Privacy, Terms, Refund, Disclaimer, Cookie, Security
- [ ] Signup checkbox links: Privacy, Terms, Disclaimer
- [ ] Billing FAQ links Refund + Terms

## Checkout & billing

- [ ] All paid checkout paths use `PricingModal` + `SubscriptionCheckoutDisclosures`
- [ ] Checkbox required; API returns 400 without `recurringBillingAccepted: true`
- [ ] Disclosure shows plan, price, interval, trial, cancel method, Terms/Refund/Privacy links
- [ ] `billing_consent_events` row created with policy versions + disclosures JSON
- [ ] Settings → Cancel subscription visible with access-through date
- [ ] Stripe portal cancel → confirmation email (if webhook configured)

## Copy consistency

- [ ] No “USCIS-approved,” “guaranteed approval,” or “fully compliant” language
- [ ] Contact page refund FAQ matches Refund Policy (not 14-day generic)
- [ ] Footer does not claim SOC 2 / PCI DSS unless certified

## Sensitive data accuracy

- [ ] Privacy describes receipt numbers, case history, document vault, Stripe, optional PostHog
- [ ] Privacy states vault passcode is not end-to-end encryption
- [ ] Cookie policy does not claim “no analytics” if PostHog env is set in production

## Admin / disputes

- [ ] `GET /api/admin/billing-evidence?email=` with `Authorization: Bearer ADMIN_SECRET`

## Policy change workflow

| Change | Action |
|--------|--------|
| Wording only | Bump version in `legal-config.ts` + DB seed |
| Material (price, trial, refund, cancel rights) | Email subscribers + in-app notice before effective date |

## Attorney review checklist

- [ ] Immigration disclaimers (Terms, Disclaimer, product UI)
- [ ] Subscription auto-renewal + California/FTC-style consent
- [ ] Refund windows and chargeback language
- [ ] Arbitration / governing law (Terms §14)
- [ ] Privacy: CCPA/CPRA + GDPR representations
- [ ] Dedicated attorney benefit description
- [ ] AI feature disclosures (Gemini resume tools)
