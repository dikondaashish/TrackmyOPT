# Legal and billing compliance — pending manual QA

Automated implementation checks are present in code/tests. This checklist now
contains only work that still requires production/test-mode observation or
professional review.

**Not legal advice. Have U.S. counsel review public legal and billing terms.**

## 1. Public browser smoke

- [ ] Open `/privacy`, `/terms`, `/refund-policy`, `/disclaimer`,
  `/cookie-policy`, and `/security` in production.
- [ ] Confirm footer/signup/billing links reach the correct pages.
- [ ] Confirm consent-gated PostHog, GA4, and AdSense behavior matches the
  Privacy and Cookie policies.
- [ ] Confirm case-status results and immigration content show the
  educational/non-affiliation disclaimer.
- [ ] Confirm extension privacy/support links and autofill/AI disclosures are
  visible.

## 2. Stripe test-mode flow

Use [stripe-test-billing-validation.md](./stripe-test-billing-validation.md);
do not create a live charge.

- [ ] Eligible Pro checkout shows the 7-day trial.
- [ ] Trial-ineligible Pro checkout does not offer another trial.
- [ ] Recurring-billing consent is required and the evidence row includes
  request metadata, policy versions, and disclosures.
- [ ] Session metadata contains the same policy versions.
- [ ] Trial start/end, successful payment, failed payment, cancellation,
  subscription end, and refund emails/events are observed.
- [ ] Settings and Customer Portal cancellation show the correct access-through
  date and do not imply an unavailable refund.
- [ ] `GET /api/admin/billing-evidence?email=` returns consent, transaction, and
  billing-email evidence for the test user.

## 3. Production Stripe/DNS configuration

- [ ] Webhook endpoint and every handled event are enabled.
- [ ] Production price/promotion IDs match the intended plans.
- [ ] Customer Portal cancellation/change settings match product copy.
- [ ] Stripe receipts are enabled.
- [ ] SPF and DKIM pass for `@trackmyopt.com`.
- [ ] Supabase `policy_versions` matches the versions in the deployed code.

## 4. Counsel review

- [ ] Immigration/non-affiliation disclaimers and USCIS API language.
- [ ] Auto-renewal consent and applicable federal/state requirements.
- [ ] Trial, refund, cancellation, dispute, and chargeback language.
- [ ] Arbitration, governing law, CCPA/CPRA, and GDPR representations.
- [ ] Dedicated attorney benefit description and attorney compensation model.
- [ ] Gemini/autofill/answer-library/cover-letter privacy disclosures.
- [ ] The actual USCIS agreement checklist in
  [USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md](./USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md).

## Record

| Date | Environment | Tester/reviewer | Result | Evidence/follow-up |
|------|-------------|-----------------|--------|--------------------|
| _pending_ |  |  |  |  |
