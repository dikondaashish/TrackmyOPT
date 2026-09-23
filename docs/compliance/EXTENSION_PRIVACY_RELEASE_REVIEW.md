# Extension privacy/help release review

Prepared: September 22, 2026. Status: **owner authorized rollout; publication not yet verified; not legally certified**.

## Owner rollout decision

On September 22, 2026, the product owner explicitly approved making the updated
flow available to everyone and stated that no existing users have used this
saved-answer/password feature. Based on that owner-provided statement, an
existing-user consent migration is not a rollout requirement for this feature.
This records the owner's decision, not an independent production-data audit.
New saves retain the visible consent notice. No blanket approval of unrelated
code changes, legal certification, or successful publication is implied.

Publication attempt: Vercel access and the `trackmy-opt-web` production target
were verified. Chrome denied automation access to the Web Store publisher
dashboard, so neither a Store submission nor a coordinated web deployment was
performed. Store access, actual published version comparison, manual release QA,
and a publication-time policy version/date update remain outstanding. The owner
approval above is complete and does not need to be requested again.

This is an implementation-to-copy review, not a legal opinion. AI assistance is
not a substitute for review by a qualified human lawyer. No effective dates,
policy version IDs, consent records, deployed pages, or Store submissions were
changed by this documentation update.

## Behavior the draft now describes

| Feature | Current local behavior | Evidence |
| --- | --- | --- |
| Private answers | Explicit Prefill fetches saved answers; matching empty fields fill without a second approval. No fetch merely from opening the sidebar. | `apps/extension/src/private-prefill-request.ts`, `content-job-portal.ts` |
| Continuous | May reuse loaded private answers within the same application. Changed job identity or a page reload requires a new explicit click. Supported application frames may receive eligible answers, never the portal password. | `private-approval-session.ts`, `content-job-portal.ts`, `background.ts` |
| Portal login | The same explicit Prefill click fills saved email/password/confirmation on supported HTTPS top-level login/create-account forms, with no extra confirmation. No Continuous or frame credential delivery; no navigation/submission clicks. | `portal-login-prefill.ts`, `job-portal-login.ts`, `background.ts` |
| AI screening | Explicit Prefill can reuse a saved match or generate and insert a draft using the active job resume. Review markers remain; Remember my answer is optional account storage, separate from the encrypted private-data record. | `smart-answers.ts`, `apps/web/app/api/extension/screening-answer/route.ts`, `screening-answers/route.ts` |
| DOB, dropdowns, codes | Supported saved DOB and matching dropdown options may fill. SSN and verification codes are not filled. No inbox-code retrieval integration was added. | `sensitive-autofill.ts`, `smart-dropdown.ts`, `job-portal-login.ts` |
| Employer disclosure | Filled values are available to the employer/ATS page before submission. Never-submit is not a promise that the employer cannot read or autosave fields. | Native form input/change events in the filling routines |

Extension filenames in the evidence column are relative to `apps/extension/src/`
unless a full repository-relative path is shown.

## Source copy updated

- Shared privacy/help notices: `apps/web/lib/legal/legal-config.ts`.
- Public Privacy Policy section 2.8 and the private-data management link.
- Chrome Job Prefill setup page, settings explanation, save confirmation, and
  save-consent checkbox. Revealing values in website settings remains a separate
  explicit action; that is not the removed application approval step.
- Dashboard extension feature help and FAQs. Plan allowances now share the
  central plan configuration instead of duplicated help numbers.
- Extension README, pending implementation plan, and Store listing/asset source.

## Local verification

- One-click login implementation: 325 extension tests and 64 targeted web tests
  passed. Coverage includes sender/frame restrictions (including the legacy
  credential message), explicit-click entrypoints, conflicting entries,
  hidden/disabled controls, password confirmation, shadow-root labels,
  navigation/form replacement races, Escape, unavailable credentials,
  Guided navigation stopping at password forms, and settings secret lifecycle.
- Web and extension TypeScript checks, extension build, changed-component
  ESLint, and `git diff --check` passed.
- React Doctor findings were inspected: response bodies are parsed before the
  status check to display API errors, but status is checked before using saved
  values. Effect-based contact loading and settings complexity were not broadly
  refactored. A real load-failure issue was fixed and regression-tested: a failed
  contact load now shows an error and disables saving instead of allowing blank
  values to overwrite saved data.
- Chrome synthetic fixture filled email/password/confirmation (3 fields), with
  zero submissions and Guided navigation stopped. This browser fixture exercises
  the field filler; HTTPS and background-message boundaries are automated tests.
  Light/dark desktop setup layouts were inspected. Responsive viewport emulation
  did not take effect, so narrow-screen visual QA remains pending.
- All seven Store PNGs regenerated at their required dimensions. The updated
  private-answer/password image was inspected for clipping and obsolete approval
  wording; these remain illustrative marketing assets.
- These checks do not certify live Workday, Ashby, or every portal. No real
  employer account was created. No production web deployment, installed-extension
  reload, Store submission, or legal approval was performed.

## Release checks and remaining review

- [ ] Product owner confirms these behaviors against the **actual release
  package and deployed backend**, not just local source. Test the one-click
  private-answer path, Continuous transitions, frames, one-click credential
  filling and login-navigation stop, AI review markers, Stop, and final-submit boundaries.
- [x] Owner approved the new behavior for everyone and confirmed no existing
  users used this feature. No migration gate will be added on that basis.
  If this usage assumption proves incorrect before release, revisit notice and
  consent for affected users; future-save consent is not retroactive consent.
- [ ] Review the disclosure of sensitive categories (including DOB and EEO),
  employer/ATS exposure before submission, supported frame delivery, server-side
  encryption rather than end-to-end encryption, and shared-password reuse risk.
- [ ] Review explicit-Prefill AI processing with the configured provider,
  subprocessors, contractual retention/training terms, and data locations.
  Check saved-screening-answer access/deletion UX, account deletion, backups,
  logs, and retention in production. This task did not certify these controls.
- [ ] Review whether the in-product notices are sufficiently prominent, including
  AI drafting on Prefill. A collapsed help row or privacy page alone must not
  be treated as proof of adequate disclosure or consent.
- [ ] Approve the complete Store privacy-practices form, required Limited Use
  disclosure, permission inventory, and listing. Existing permission counts
  and unrelated marketing claims in the listing are not certified by this pass.
- [ ] Choose the approved policy version/effective date and any user notice.
  Current identifiers remain unchanged: general legal `2026-08-26`, privacy
  choices/privacy policy `2026-07-26`. Do not deploy the revised policy as a
  silently backdated update.
- [ ] Coordinate web/help deployment, final extension package, and Store assets
  so they describe the same build. Store images are illustrative mockups, not
  evidence that the release UI was tested; compare them with the shipped UI.

Record approver name, date, reviewed build/commit, publication version, and
supporting evidence before checking any item above. Nothing here is a sign-off.

## Reference material

- [Chrome Web Store user-data/privacy FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq): data-handling disclosures, in-product disclosure and consent, and minimum permissions.
- [FTC privacy and security guidance](https://www.ftc.gov/business-guidance/privacy-security): starting point for owner/counsel review of privacy representations.

These references guide review; they do not establish TrackMyOPT's compliance.
