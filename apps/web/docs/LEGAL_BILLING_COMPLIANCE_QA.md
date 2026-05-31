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

- [ ] Footer links: Privacy, Terms, Refund, Disclaimer, Cookie, Security, Contact
- [ ] `/security` included in `app/sitemap.ts` legal pages
- [ ] `robots.txt` does not block `/privacy`, `/terms`, `/security`, etc.
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
- [ ] USCIS features use `USCIS_API_DISCLOSURE` / “USCIS Case Status API access” wording (not “authorized access” or product endorsement)
- [ ] Extension page does not claim “zero personal data” or “no analytics”
- [ ] Case-status dashboard + `/features/case-status` show delay/verification disclaimer
- [ ] Contact page refund FAQ matches Refund Policy (not 14-day generic)
- [ ] Footer does not claim SOC 2 / PCI DSS unless certified
- [ ] No “bank-grade,” “encrypted at rest” (product-wide), or E2E encryption claims without evidence

## Sensitive data accuracy

- [ ] Privacy describes receipt numbers, USCIS API case status, case history, document vault, Stripe, optional PostHog/Gemini
- [ ] Privacy states vault passcode is not end-to-end encryption
- [ ] Cookie policy does not claim “no analytics” if PostHog env is set in production
- [ ] Extension feature page links Privacy, Terms, Disclaimer, Cookie Policy

## Automated checks

- [ ] `npm run test` — `legal-config.test.ts` + `marketing-copy-compliance.test.ts` pass
- [ ] `policy_versions` migration seeds: refund, subscription_billing_terms, privacy, terms, disclaimer, cookie, security_page

## Checkout (re-verify)

- [ ] No “14-day refund” marketing copy remains
- [ ] Pro: 7-day trial; Dedicated: immediate charge + 3-day first-month guarantee only
- [ ] Checkout requires `recurringBillingAccepted: true`

## Admin / disputes

- [ ] `GET /api/admin/billing-evidence?email=` with `Authorization: Bearer ADMIN_SECRET`

## Policy change workflow

| Change | Action |
|--------|--------|
| Wording only | Bump version in `legal-config.ts` + DB seed |
| Material (price, trial, refund, cancel rights) | Email subscribers + in-app notice before effective date |

## Attorney-confirmed launch checklist (final pass)

- [ ] Removed “authorized access” from customer-facing copy
- [ ] Removed “official USCIS API” from customer-facing copy
- [ ] USCIS API wording uses “USCIS Case Status API access”
- [ ] Non-affiliation notice appears with USCIS data-source copy
- [ ] Privacy Policy includes dormant account clause (24 months)
- [ ] Privacy Policy includes business transfer/acquisition clause
- [ ] Privacy Policy includes breach notification clause
- [ ] Payment copy no longer says end-to-end encryption (Stripe PCI DSS Level 1 over encrypted connection)
- [ ] PostHog email opt-out described in Privacy + Cookie Policy
- [ ] Case-status disclaimer appears beside each status result
- [ ] Dedicated plan uses “Attorney Session” (not “Lawyer Session”)
- [ ] No “immigration experts verified” marketing claims on About/Compliance
- [ ] USCIS API agreement manually reviewed — see `USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md`
- [ ] Vercel deploy uses final commit
- [ ] Supabase `policy_versions` still aligned
- [ ] Checkout consent still creates `billing_consent_events` row

## Attorney review checklist

- [ ] Immigration disclaimers (Terms, Disclaimer, product UI)
- [ ] Subscription auto-renewal + California/FTC-style consent
- [ ] Refund windows and chargeback language
- [ ] Arbitration / governing law (Terms §14)
- [ ] Privacy: CCPA/CPRA + GDPR representations
- [ ] Dedicated attorney benefit description
- [ ] AI feature disclosures (Gemini resume tools)
