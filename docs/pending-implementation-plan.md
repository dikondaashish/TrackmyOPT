# TrackMyOPT pending implementation plan

**Audit date:** 2026-07-25  
**Code reviewed:** web app, Nest API, Chrome extension, Supabase migrations,
configuration, tests, and repository README files.

This is the single ordered backlog for work that is not yet complete. Completed
implementation plans and duplicate completion reports were removed from
`docs/`. Operational references, legal evidence, and reusable campaign copy
remain because they are needed even when their supporting code exists.

## What is already implemented

The following large workstreams are present in code and have automated coverage.
They are not backlog items:

- Job-scoped resume generation and safe empty-field autofill.
- Resume, contact, employment, education, and opt-in skills autofill.
- Job/resume-grounded screening-answer drafts with mandatory review.
- Generated, compiled, hash-locked cover-letter PDF attachment.
- Step-by-step, Continuous, and opt-in Guided Autopilot modes.
- Guided clicks for allowlisted non-final Next, Continue, and Done controls.
- Permanent stop before Review, Submit, Apply, Finish, or another final action.
- Dedicated Chrome-extension job-portal profile for contact, full address,
  social URLs, visa type, annual/hourly compensation, work preferences, date
  of birth, and optional DEI answers.
- Sensitive/private answers are stored separately with authenticated
  encryption and require explicit review and approval for each application.
- Visual filling progress, field highlights, success/error states, and Stop UI.
- Durable Supabase AI quotas and user-owned screening-answer storage.
- Workday/Greenhouse adapter fixtures and extension unit tests.
- Freemium purchase gate, pricing changes, checkout recovery, activation
  nudges, and measurement instrumentation.
- PostHog phases 0–5 instrumentation, dashboards, funnels, and server event
  allowlists.
- Billing consent/version evidence, Stripe webhook handling, legal pages, and
  transactional billing emails.
- NestJS API, Redis/Bull workers, S3/Textract OCR, and USCIS premium-only batch
  filtering.

## Execution order

### 1. Release the Chrome extension safely

This is the highest-priority remaining product task. The candidate is built as
version `0.1.14`, but it has not completed the manual release gate.

- [ ] Test in a fresh Chrome profile: sign in, token refresh, sign out, service
  worker restart, and full browser restart.
- [ ] Run the sanitized Workday matrix: multi-step contact, resume, work
  history, education, skills, screening drafts, sensitive answers, cover
  letter, Guided navigation, Review stop, and final-submit stop.
- [ ] Run the equivalent Greenhouse single-page matrix.
- [ ] Confirm existing values and existing files are never overwritten.
- [ ] Review the user-facing autofill/privacy disclosure with the owner or
  counsel.
- [ ] Record the Chrome Web Store justification for `all_frames` and
  `match_about_blank`; confirm no new permission is unnecessary.
- [ ] Build the final package, upload it to the Chrome Web Store, review the
  listing, and use a staged rollout.

**Done when:** the two browser matrices pass with sanitized data, the package
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

### 4. Finish the freemium measurement checkpoints

Use `marketing/freemium-conversion-metrics.md`; do not infer missing values.

- [ ] **Day 1, after 2026-07-26 14:00 UTC:** verify free cases did not move
  overnight, premium cases refreshed, `skippedFree > 0`, and USCIS exceptions
  did not rise from the 0/0 baseline.
- [ ] **Daily through 2026-08-01:** confirm recovery, trial conversion, PWA,
  cancellation feedback, and server-only checkout events arrive only when
  their triggers occur.
- [ ] **Day 7, 2026-08-01:** record unique-person funnel metrics, Stripe
  active/trialing count, cancellation reasons, and DAU versus 55.9/day.
- [ ] **Day 30, 2026-08-24:** rerun the checkpoint and record keep versus
  soften-gate. If DAU falls sharply and checkout does not improve, recommend
  free auto-check every three days; do not fully revert.

**Done when:** every dated row contains source-backed values and the Day 30
decision is recorded.

### 5. Complete analytics operations

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

### 6. Pay down verified code-maintenance debt

Do these as separate small changes; none is required to submit the extension.

1. **Regenerate Supabase types.** The checked-in type snapshot contains 35
   tables and 6 views, while applied migrations add nine more tables. Generate
   types from the live project and review the diff.
2. **Split Settings.** `SettingsSection.tsx` is about 2,560 lines. Follow
   `apps/web/components/dashboard/settings/README.md`: extract one tab per
   change, keep orchestration in the parent, and test after each extraction.
3. **Finish email modularization.** Extract remaining templates from the
   2,564-line `transactional-emails.ts`, migrate direct SMTP flows to
   `email_queue`, and add notification-email double opt-in if the product still
   wants it.
4. **Require signed email links in production.** Make
   `EMAIL_LINK_SIGNING_SECRET` a production requirement, plan the legacy-link
   transition, and test click tracking.
5. **Decide the final backend boundary.** OCR and USCIS workers already use
   Nest/Bull, but several resume, email, document, and cron routes remain in
   Next.js. Move only workloads with measured timeout/reliability problems;
   do not perform a speculative rewrite.
6. **Replace stale non-`docs/` README content.** In particular,
   `apps/api/README.md` is still Nest starter text, and Supabase/root setup
   instructions should be reconciled with the canonical migrations and current
   SMTP variable names.

**Done when:** each change has focused tests, no public API change is hidden,
and the repository documentation matches the resulting boundary.

### 7. Finish measured autofill hardening

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

### 8. Clean up remaining SEO implementation debt

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

### 9. Execute growth work after measurement and compliance

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

## Documentation audit disposition

| Area | Result |
|------|--------|
| Architecture | Current reference docs retained and corrected; completed proposal/roadmap docs removed. |
| Autofill | Completed 1,700+ line specs and rollout report removed; genuine release and telemetry follow-ups are above. |
| Archive | Completed phase reports removed; the still-pending USCIS agreement checklist moved to `compliance/`. |
| Compliance | Evidence and safe test runbooks retained; duplicate resolved audits removed; manual QA condensed. |
| Marketing | Campaign assets retained; implemented content/freemium phases reduced to pending work only. |
| Operations | Living CORS, cron, and email catalogs retained; email roadmap reduced to unresolved gaps. |
| PostHog | Completed phase reports removed; outstanding operational actions are above. |
| SEO | Living setup guides retained; completed OG instructions removed; entity plan reduced to real pending work. |

### Removed because complete or superseded

The following 26 documents were fully implemented, were duplicate historical
reports, or had their small remaining actions transferred into this plan:

- `architecture/ARCHITECTURE.md`
- `architecture/BACKEND_IMPLEMENTATION.md`
- `architecture/EXTENSION_WIDGET_ROADMAP.md`
- `architecture/job-scoped-resume-autofill/AUDIT-AND-ROLLOUT-MASTER-PLAN.md`
- `architecture/job-scoped-resume-autofill/README.md`
- `archive/EXCEPTION-SPIKE-REMEDIATION-PHASES.md`
- `archive/FULL-AUDIT-REMEDIATION-PHASES.md`
- `archive/PHASE-0-COMPLETION.md`
- `archive/PHASE-0-FOUNDATION-TECHNICAL-SEO.md`
- `archive/PHASE-1-COMPLETION-REPORT.md`
- `archive/PHASE-1-IMPLEMENTATION-SUMMARY.md`
- `archive/PHASE2-COMPLETE-SUMMARY.md`
- `archive/PHASE2-FIXES-SUMMARY.md`
- `archive/RESUME-GENERATOR-REMEDIATION-PHASES.md`
- `compliance/BILLING_COMPLIANCE_QA.md`
- `compliance/PAYMENT_FLOW_AUDIT.md`
- `compliance/USCIS-TORCH-EMERGENCY-REMEDIATION.md`
- `marketing/100-DAY-GROWTH-PLAN.md`
- `marketing/PHASE-1-CONTENT-ENGINE-LAUNCH.md`
- all six completed `posthog/POSTHOG-*.md` phase/audit reports
- `seo/OG_IMAGE_METADATA_UPDATES.md`

### Retained or rewritten because still useful

- `README.md` — rewritten index.
- `architecture/ARCHITECTURAL_OVERVIEW.md` — corrected to the current system.
- `architecture/DATABASE_INVENTORY.md` — corrected to migration-backed counts.
- `architecture/DIRECTORY_DEEP_DIVE.md` — corrected to the real folder layout.
- `archive/USCIS_API_AGREEMENT_REVIEW_CHECKLIST.md` — moved to
  `compliance/` because it is still pending.
- `compliance/LEGAL_BILLING_COMPLIANCE_QA.md` — reduced to manual/counsel work.
- `compliance/evidence-log.md` — retained as immutable evidence.
- `compliance/stripe-test-billing-validation.md` — retained as a safe runbook.
- `marketing/freemium-conversion-metrics.md` — reduced to Day 1/7/30 metrics.
- `marketing/community-engagement-playbook.md` — pending campaign asset.
- `marketing/email-sequences-playbook.md` — pending copy; provider/opt-out gate.
- `marketing/paid-ads-playbook.md` — pending campaign asset.
- `ops/CORS_POLICY.md`, `ops/CRON_SETUP.md`, and
  `ops/EMAIL_TEMPLATES.md` — living operational references.
- `ops/EMAIL_ROADMAP.md` — reduced to unresolved email work.
- `seo/ENTITY-OPTIMIZATION-SETUP.md` — reduced to real entity/profile work.
- `seo/GOOGLE-SEARCH-CONSOLE-SETUP.md` — reduced to recurring operations.
- `seo/INDEXNOW-SETUP.md` — retained and corrected as an operating reference.
