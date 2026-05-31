# USCIS API / Torch agreement review checklist

**Manual pre-launch requirement.** Do not mark complete until counsel has reviewed the actual USCIS API/Torch agreement or approval email.

## Before launch

- [ ] Review actual USCIS API/Torch agreement or approval email
- [ ] **Publicity** — confirm what we may say publicly about API access
- [ ] **Endorsement** — confirm we may not imply USCIS/DHS endorsement (customer copy uses “USCIS Case Status API access” + non-affiliation notice)
- [ ] **Use of Agency Name** — confirm permitted references to USCIS/DHS
- [ ] **Attribution / required notice** — implement any mandatory attribution in product or legal pages
- [ ] **Commercial use** — confirm subscription/commercial use is permitted
- [ ] **Data retention** — align Privacy Policy retention with agreement limits
- [ ] **API key security** — keys only in server env; not exposed client-side
- [ ] **Required Terms/Privacy language** — Privacy/Terms/Disclaimer aligned with agreement
- [ ] **Restrictions on storing USCIS response data** — receipt numbers, status history, logs
- [ ] **Change notification** — process if product, company, terms, or privacy change materially

## Product copy gate

- [ ] Confirmed no customer-facing copy violates USCIS API agreement or required attribution language
- [ ] No “authorized access,” “official USCIS API,” “USCIS approved,” or government endorsement in marketing/UI
- [ ] Case-status disclaimer visible beside status results (not footer-only)

## Attorney / Dedicated plan (separate)

- [ ] Attorney engagement uses flat retainer where possible — **do not** use revenue share or % of Dedicated plan revenue without bar/counsel sign-off
- [ ] Per-session model confirmed with immigration counsel

## Post-launch (non-blocking)

- [ ] Settings → Privacy analytics opt-out toggle within 30 days if PostHog enabled client-side (`posthog.opt_out_capturing()`)
