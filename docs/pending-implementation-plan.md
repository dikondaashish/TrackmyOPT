# TrackMyOPT pending implementation plan

**Last reviewed:** 2026-10-10 (items verified against code; item 1 is written against extension 0.2.4)  
**Code reviewed:** web app, Nest API, Chrome extension, Supabase migrations,
configuration, tests, and repository README files.

This is the single ordered backlog for work that is not yet complete. Completed
implementation plans and duplicate completion reports were removed from
`docs/`. Operational references, legal evidence, and reusable campaign copy
remain because they are needed even when their supporting code exists.

## Execution order

### 1. Release the Chrome extension safely

This is the highest-priority remaining product task. The extension is at
version `0.2.4` (`apps/extension/manifest.json` and `package.json` match). The
local production ZIP and synthetic browser fixtures are recorded in
[the 0.2.4 status report](../apps/extension/docs/competitor-architecture-roadmap-0.2.4.md);
that report states the ZIP has not been uploaded and that synthetic checks alone
are not enough to publish. The Store copy and assets were prepared for 0.2.1
(`apps/extension/store-assets/LISTING-0.2.1.md`) and have not been re-issued for
0.2.4. **Web Store publication unverified:** the repository records the item as
last published at 0.1.18, and the privacy review notes that Store access and the
actually published version were never confirmed.

- [ ] Confirm the current published Web Store version and whether the 0.2.1
  listing draft was ever submitted; update the listing/privacy declarations for
  0.2.4 if they differ.
- [ ] Test in a fresh Chrome profile: sign in, token refresh, sign out, service
  worker restart, and full browser restart. The 0.2.4 report validated only an
  isolated Chromium fixture and did not install the build in a signed-in
  profile against the production API.
- [ ] Run the sanitized Workday matrix with a controlled test account:
  multi-step contact, resume, work history, education, skills, screening drafts,
  sensitive answers, cover letter, Guided navigation, Review stop, and
  final-submit stop. The report notes Workday was only inspected up to an
  account-creation/terms step.
- [ ] Run the equivalent Greenhouse single-page matrix, and the remaining
  live checks the report lists for Lever, Ashby, SmartRecruiters (custom history
  rows), and LinkedIn Easy Apply, using controlled data and never submitting.
- [ ] Confirm existing values and existing files are never overwritten.
- [ ] Review the user-facing autofill/privacy disclosure with the owner or
  counsel. Source copy is updated; publication and sign-off remain pending in
  [the privacy release review](compliance/EXTENSION_PRIVACY_RELEASE_REVIEW.md),
  including the publication-time policy version/date update.
- [x] Record the Chrome Web Store justification for `all_frames` and
  `match_about_blank`; confirm no new permission is unnecessary.
- [ ] Rebuild the final package, confirm it matches the reviewed source, upload
  it to the Chrome Web Store, review the listing, and use a staged rollout.

**Done when:** the live browser matrices pass with sanitized data, the package
matches the reviewed source, and the owner submits the staged release.

### 2. Close the USCIS agreement and evidence actions

- [ ] Confirm that the external `scan-nearby-cases` scheduler is paused and add
  its timestamp to `compliance/evidence-log.md`.
- [ ] Complete
  `compliance/USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md` with the actual
  agreement/approval email and counsel.
- [ ] Implement only the attribution, retention, commercial-use, or copy
  changes that the agreement review requires.
- [ ] Keep nearby/sequential receipt scanning disabled; do not re-enable it as
  part of routine case monitoring.

**Done when:** the evidence log has the operator confirmation and every launch
gate in the agreement checklist has an owner decision.

### 3. Run legal and billing production QA

- [ ] Complete the manual browser and Stripe test-mode checks in
  `compliance/LEGAL_BILLING_COMPLIANCE_QA.md`.
- [ ] Run the no-live-charge workflow in
  `compliance/stripe-test-billing-validation.md`.
- [ ] Verify production Stripe webhook subscriptions, price IDs, Customer
  Portal configuration, receipts, and SMTP SPF/DKIM.
- [ ] Verify a billing-evidence export contains consent, transaction, and email
  records.
- [ ] Obtain counsel review for immigration disclaimers, subscription renewal
  consent, refund language, privacy representations, arbitration, and AI
  disclosures.

**Done when:** the manual checklist is dated, evidence is retained, and counsel
comments are either resolved or explicitly accepted.

### 4. Complete analytics operations

- [ ] Verify PostHog error-tracking symbol sets against the next production
  deployment.
- [ ] Verify `checkout_started` has no client duplicate on a real checkout.
- [ ] Connect the Stripe data warehouse in PostHog using a read-only credential
  entered directly in the PostHog UI.
- [ ] Validate weekly digest delivery and continue week-one retention and
  exception monitoring.
- [ ] Keep `AT_RISK_REENGAGEMENT_ENABLED` off until the owner explicitly
  approves a live campaign.

**Done when:** the symbol set is visible, the warehouse sync is healthy, event
dedupe is proved, and the monitoring owner is recorded.

### 5. Pay down verified code-maintenance debt

Do these as separate small changes; none is required to submit the extension.

1. **Regenerate Supabase types.** The checked-in type snapshot contains 35
   tables and 6 views, while applied migrations add nine more tables. Generate
   types from the live project and review the diff.
2. **Simplify remaining Settings orchestration.** Tab components and focused
   hooks already exist. Follow `apps/web/components/dashboard/settings/README.md`
   when separating remaining shared loading and action state; preserve callback
   contracts and avoid duplicate profile requests.
3. **Finish email modularization.** Email families already live under
   `apps/web/lib/notifications/transactional/`. Separate remaining rendering
   from delivery, migrate direct SMTP flows to `email_queue`, and add
   notification-email double opt-in if the product still wants it.
4. **Require signed email links in production.** Make
   `EMAIL_LINK_SIGNING_SECRET` a production requirement, plan the legacy-link
   transition, and test click tracking.
5. **Decide the final backend boundary.** OCR and USCIS workers already use
   Nest/Bull, but several resume, email, document, and cron routes remain in
   Next.js. Move only workloads with measured timeout/reliability problems;
   do not perform a speculative rewrite.
6. **Review remaining setup guidance.** API, root, Settings, and notification
   template READMEs now reflect their current structure. Reconcile Supabase
   operational instructions with canonical migrations and current SMTP names.
7. **Review React diagnostics by behavior.** The September structural scan
   still reports effect-driven state updates, nested component definitions,
   and hook dependency warnings. Prioritize `useCaseStatusController.ts`,
   `SettingsSection.tsx`, and the resume editor hooks. Add focused behavioral
   coverage before changing request ordering or component state lifetimes.

**Done when:** each change has focused tests, no public API change is hidden,
and the repository documentation matches the resulting boundary.

8. **Make the Supabase migrations folder replayable from empty.** Core tables
   come from the legacy `schema/` snapshot and `20260322_enforce_core_rls.sql` runs
   before the tables it targets. Plan and constraints (production must not be
   modified): `docs/plans/supabase-migration-replay.md`.

### 6. Finish measured autofill hardening

These are data-driven follow-ups, not release blockers:

- [ ] Establish rates for artifact expired, job changed, resume missing after
  reload, unsupported control, and attachment failure.
- [ ] Add more continuity/storage machinery only if those outcomes correlate
  with abandonment or support requests.
- [ ] Certify custom date/tag controls per ATS before enabling them broadly.
- [ ] Use privacy-safe telemetry to choose the next adapter (Lever, Ashby,
  iCIMS, or another ATS).

**Done when:** telemetry justifies a specific change and that change passes a
sanitized browser fixture plus the no-overwrite/no-submit invariants.

### 7. Clean up remaining SEO implementation debt

- [ ] After the redirects have been stable for at least 30 days, delete the
  redirect-source page directories for
  `/blog/can-you-travel-on-opt` and
  `/blog/form-i983-stem-opt-training-plan-guide`.
- [ ] Replace redundant client-side `CanonicalURL` injection with server
  metadata where the route already supports metadata.
- [ ] Confirm pricing testimonials are real, attributable, and eligible for
  Product review/aggregate-rating schema; otherwise remove that schema.
- [ ] Run Rich Results and schema validation on the homepage, pricing, five
  representative blogs, and answer pages.
- [ ] Validate GSC 404/401/redirect fixes, export “Crawled – currently not
  indexed,” and keep the monthly post-deploy SEO verification.

**Done when:** no internal links or sitemap URLs target redirect sources and
the production validators report no actionable structured-data errors.

### 8. Execute growth work after measurement and compliance

The reusable campaign documents remain in `marketing/` and `seo/`.

- [ ] Complete Google Search Console and Bing setup/monitoring.
- [ ] Create/verify TrackMyOPT social and entity profiles, then add only real
  profile URLs to schema and the site.
- [ ] Execute the community plan using helpful, non-spam participation.
- [ ] Choose a marketing-email provider and implement unsubscribe/suppression
  before sending the prepared email sequences.
- [ ] Launch paid ads only after conversion events and legal copy are verified.
- [ ] Build backlinks, university partnerships, original research, video,
  lead magnets, and programmatic pages in measured batches.

**Done when:** each channel has an owner, budget, compliant opt-out path where
needed, tracked conversion event, and a stop/continue decision based on data.

## Non-negotiable invariants

- Never auto-submit a job application.
- Never overwrite non-empty fields, existing tags, or existing files.
- Never generate sensitive/EEO/visa answers with AI.
- Never store resume, question, answer, cover-letter, or sensitive-answer
  content in analytics or `chrome.storage.sync`.
- Never use a historical resume as an autofill fallback.
- Never attach a cover letter that does not match the active resume hash.
- Never re-enable sequential/neighbor USCIS receipt scanning.
- Never use live Stripe charges for routine validation.
