# Job-Scoped Resume Autofill: Audit and Rollout Master Plan

> Audit date: 2026-07-25  
> Audited base: `main` at `8abff97`  
> Rollout decision: ship the deterministic artifact-prefill core behind
> independent flags; keep AI screening drafts and cover letters off until their
> generation paths are real and production-safe.  
> Release state: merged code is unreleased; extension version is `0.1.11`.

## Executive finding

The deterministic resume-autofill core is substantially implemented. The
contracts, final-LaTeX snapshot extraction, immutable-source reconciliation,
30-minute validity boundary, exact job matching, session-only artifact store,
contact precedence, safe resume attachment, optional skills, Continuous mode,
repeatable history mapping, and conservative Workday/Greenhouse adapter
boundaries all have code and automated evidence.

The release is blocked by truthfulness and safety issues, not by a missing
core:

1. The generation prompt still tells the model to rewrite official job titles,
   and those titles can enter `snapshot.experience`.
2. AI generation quotas use a module-level `Map`, so Vercel instances do not
   share or durably enforce them. `resetsAt` is not populated.
3. Client and server sensitive-question patterns differ.
4. Screening-answer generation returns a hard-coded draft and does not use the
   job description as evidence.
5. Initial cover-letter generation emits fake PDF bytes.
6. Cover-letter payload and result wiring stops before the prefill engine can
   attach or report it.
7. Independent rollout flags, required telemetry dimensions, support error
   taxonomy, legal/support copy, and release fixtures are missing.

The safe rollout therefore separates deterministic prefill from the disabled
AI features. Real AI generation is a follow-up milestone, not a prerequisite
for releasing the working deterministic core.

## Repository facts

| Fact                               | Audited value                                                                                                     | Evidence                                                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Extension version                  | `0.1.11`                                                                                                          | `apps/extension/package.json:3`; `apps/extension/manifest.json:4`                                              |
| Tracked extension source files     | 53                                                                                                                | `git ls-files apps/extension/src` at audit time                                                                |
| Tracked extension test files       | 28                                                                                                                | `git ls-files apps/extension/tests` at audit time                                                              |
| Independent autofill feature flags | None                                                                                                              | The only current controls are mode and skills preferences in `apps/extension/src/autofill-preferences.ts:3-11` |
| Artifact persistence               | One bounded item in `chrome.storage.session`, never sync                                                          | `apps/extension/src/active-resume-artifact-store.ts:3-8`, `22-42`                                              |
| Job-portal frame access            | `all_frames` and `match_about_blank`, no new permission                                                           | `apps/extension/manifest.json:6-10`, `788-790`                                                                 |
| Finder duplicate cleanup           | Eight ignored `* 2.ts` files removed locally; seven were byte-identical, one divergent copy was not used as truth | `.gitignore:37` explains why they were absent from Git status                                                  |

## Status legend

- **Met** — implementation and a meaningful assertion cover the criterion.
- **Partial** — useful code exists, but a named acceptance or safety condition
  remains open.
- **Stub** — the surface looks wired but cannot truthfully perform the feature.
- **Missing** — no implementation exists.
- **Risk** — implemented behavior is unsafe for rollout until corrected.

## Criterion-by-criterion audit matrix

### Phase 1 — Core artifact and basic prefill

| Criterion                                               | Status   | Implementation evidence                                                                                                                                                                              | Test evidence / gap                                                                                                                                                                                  |
| ------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Preserve official job titles                            | **Risk** | The prompt explicitly instructs title replacement in `apps/web/lib/ai/prompts/generate.ts:41-47`; titles are not listed in `<never_change>` at `101-110`                                             | No test prevents a rewritten title from reaching `snapshot.experience[].title`                                                                                                                       |
| Versioned snapshot and artifact schemas with caps       | **Met**  | Extension contract: `apps/extension/src/resume-autofill-contract.ts:8-78`; server schema and caps: `apps/web/lib/resume/autofill-schema.ts:3-17`, `137-214`                                          | Schema caps and malformed payload rejection: `apps/web/lib/resume/__tests__/autofill-schema.test.ts:84-140`                                                                                          |
| Extract snapshot from final compiled/repaired LaTeX     | **Met**  | Repair precedes extraction in `apps/extension/src/background.ts:967-1015`; exact final content is hashed in `apps/web/lib/resume/extract-autofill-snapshot.ts:370-418`                               | Final-LaTeX hash and extraction: `apps/web/lib/resume/__tests__/extract-autofill-snapshot.test.ts:62-84`; missing end-to-end repair fixture remains a Stage 3 test gap                               |
| Reconcile immutable facts to the selected source resume | **Met**  | Company, title, dates, school, degree, and contact reconciliation: `apps/web/lib/resume/extract-autofill-snapshot.ts:270-320`                                                                        | Cross-resume contamination: `apps/web/lib/resume/__tests__/extract-autofill-snapshot.test.ts:86-99`                                                                                                  |
| Return exact PDF, hash, and snapshot together           | **Met**  | Artifact builder hashes final LaTeX and PDF together: `apps/extension/src/resume-artifact-lifecycle.ts:73-137`; generation installs the result at `apps/extension/src/background.ts:1032-1060`       | Hash-locked builder: `apps/extension/tests/resume-artifact-lifecycle.test.ts:105-156`; extraction failure keeps PDF: `apps/extension/tests/resume-generation-result.test.ts:16-47`                   |
| Exact 30-minute validity boundary                       | **Met**  | `RESUME_ARTIFACT_TTL_MS` and `now >= expiresAt`: `apps/extension/src/resume-artifact-lifecycle.ts:10`, `140-159`                                                                                     | 29:59 valid and 30:00 expired: `apps/extension/tests/resume-artifact-lifecycle.test.ts:49-65`                                                                                                        |
| URL/company/role invalidation                           | **Met**  | Exact normalized matching: `apps/extension/src/resume-autofill-contract.ts:233-288`                                                                                                                  | Context-change cases: `apps/extension/tests/resume-artifact-lifecycle.test.ts:68-82`; Workday route identity: `apps/extension/tests/prefill-payload-resolver.test.ts:138-226`                        |
| No historical-resume fallback                           | **Met**  | Resolver returns profile-only and never queries a resume: `apps/extension/src/prefill-payload-resolver.ts:16-81`                                                                                     | Missing/expired/mismatch/hash cases: `apps/extension/tests/prefill-payload-resolver.test.ts:74-136`                                                                                                  |
| Session-only, bounded active artifact                   | **Met**  | One fixed session key and 9 MiB cap: `apps/extension/src/active-resume-artifact-store.ts:3-8`, `22-42`                                                                                               | No sync write and bounded replacement: `apps/extension/tests/active-resume-artifact-store.test.ts:42-77`; worker restart: `apps/extension/tests/background-artifact-session-restart.test.ts:203-245` |
| Artifact-first contact precedence                       | **Met**  | `apps/extension/src/prefill-contact-source.ts:13-48`                                                                                                                                                 | Snapshot-first and missing-only fallback: `apps/extension/tests/prefill-contact-source.test.ts:23-54`                                                                                                |
| Empty-input-only resume attachment                      | **Met**  | Positive Resume/CV classifier, PDF acceptance, existing-file guard: `apps/extension/src/easy-apply-engine.ts:396-427`                                                                                | Source safety assertions exist in `apps/extension/tests/phase1b1c-dedicated-safety.test.ts:33-37`; a real DOM attachment fixture is still missing                                                    |
| Skills default off and dedicated-field only             | **Met**  | Default off: `apps/extension/src/autofill-preferences.ts:8-11`; bounded values: `apps/extension/src/skills-prefill.ts:1-29`; dedicated classifier: `apps/extension/src/easy-apply-matchers.ts:72-87` | `apps/extension/tests/skills-prefill.test.ts:7-16`; exclusion ordering: `apps/extension/tests/phase1-prefill-safety.test.ts:12-17`                                                                   |
| Step-by-step and Continuous use the same safety engine  | **Met**  | Continuous gate: `apps/extension/src/continuous-prefill.ts:10-18`; both paths resolve then call `runPrefill`: `apps/extension/src/content-job-portal.ts:329-385`                                     | Opt-in/idempotence: `apps/extension/tests/continuous-prefill.test.ts:4-37`; no generation/click in Continuous: `apps/extension/tests/phase1-prefill-safety.test.ts:19-33`                            |
| Child-frame payload is explicit and bounded             | **Met**  | Relay validation and bounded PDF filename/payload: `apps/extension/src/background.ts:217-259`; ephemeral dispatch: `apps/extension/src/content-job-portal.ts:379-384`                                | Child-frame safety is asserted in `apps/extension/tests/phase1-prefill-safety.test.ts:30-33`                                                                                                         |
| Missing/expired/changed/invalid user guidance           | **Met**  | Resolver-on-mount and profile-only fallback: `apps/extension/src/content-job-portal.ts:270-300`, `329-377`; fallback copy: `apps/extension/src/artifact-fallback-ui.ts:8-12`, `92-104`               | `apps/extension/tests/artifact-fallback-ui.test.ts:27-61`; no clear/refill on expiry: `apps/extension/tests/resume-artifact-lifecycle.test.ts:85-103`                                                |
| Grouped resume/contact/skills/history coverage          | **Met**  | `apps/extension/src/prefill-coverage.ts:1-108`                                                                                                                                                       | `apps/extension/tests/prefill-coverage.test.ts:7-59`                                                                                                                                                 |
| No sensitive fill, overwrite, navigation, or submission | **Met**  | Engine invariants: `apps/extension/src/easy-apply-engine.ts:12-27`; sensitive-first classifier: `apps/extension/src/easy-apply-matchers.ts:32-48`, `68-75`                                           | No engine click and exclusion ordering: `apps/extension/tests/phase1-prefill-safety.test.ts:12-29`                                                                                                   |

### Phase 1B — Screening-question drafts

| Criterion                                           | Status      | Implementation evidence                                                                                                                                                 | Test evidence / gap                                                                                                                                                 |
| --------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate sensitive-first detector                   | **Met**     | `apps/extension/src/screening-question-drafts.ts:18-40`                                                                                                                 | Sensitive prompt never becomes a client AI request: `apps/extension/tests/phase1b1c-dedicated-safety.test.ts:7-13`                                                  |
| Authenticated route and request contract            | **Met**     | Contract: `apps/web/lib/ai/screening-answer-contract.ts:3-19`; auth and snapshot validation: `apps/web/app/api/extension/screening-answer/route.ts:15-27`               | Route-level rejection tests are missing                                                                                                                             |
| Real JD/snapshot-grounded AI generation             | **Stub**    | The route constructs a fixed string at `apps/web/app/api/extension/screening-answer/route.ts:28-32`; `job.jobDescription` is validated but never used in the draft      | `apps/web/lib/ai/prompts/screening-answer.ts` does not exist                                                                                                        |
| Preview, explicit insertion, and needs-review state | **Met**     | `apps/extension/src/screening-question-review-ui.ts:34-96`, `117-126`                                                                                                   | Explicit action and trusted-edit assertions: `apps/extension/tests/screening-question-review-ui.test.ts:6-17`                                                       |
| Deliberate confirmation of an unedited draft        | **Partial** | `confirmDraftReview()` exists at `apps/extension/src/screening-question-drafts.ts:54-60`                                                                                | No UI action calls it; an untouched inserted draft cannot be explicitly confirmed                                                                                   |
| Exact-question saved-answer library with RLS        | **Met**     | Migration and policies: `supabase/migrations/20260716120000_create_screening_answers.sql:4-62`; extension client: `apps/extension/src/saved-screening-answers.ts:13-40` | RLS/privacy assertions: `apps/extension/tests/saved-screening-answers.test.ts:5-18`                                                                                 |
| Saved answer first and regenerate fresh             | **Met**     | `apps/extension/src/screening-question-review-ui.ts:98-115`                                                                                                             | UI assertions: `apps/extension/tests/screening-question-review-ui.test.ts:14-16`; exact-only reuse: `apps/extension/tests/phase1b1c-dedicated-safety.test.ts:24-30` |
| Never auto-generate in Continuous mode              | **Met**     | Continuous executes only resolved prefill: `apps/extension/src/content-job-portal.ts:3988-4027`                                                                         | Source assertion: `apps/extension/tests/phase1-prefill-safety.test.ts:24-29`                                                                                        |
| Production-safe quota and reset time                | **Risk**    | Module-level `Map`: `apps/web/lib/ai-generation-limits.ts:6-18`; the comment admits it needs a transactional store at line 9                                            | Limits do not survive serverless instances; `resetsAt` is never returned                                                                                            |
| Shared client/server sensitive pattern              | **Risk**    | Client pattern: `apps/extension/src/easy-apply-matchers.ts:32-33`; narrower route-local pattern: `apps/web/app/api/extension/screening-answer/route.ts:8`               | Server misses client terms including `work permit`, `equal opportunity`, and standalone `eligib`                                                                    |
| Bounded question text before network                | **Partial** | Database caps normalized text at 2,000 chars: `supabase/migrations/20260716120000_create_screening_answers.sql:15-18`                                                   | Background posts unbounded `String(input.questionText)` at `apps/extension/src/background.ts:737-756`                                                               |

### Phase 1C — Cover-letter generation and attachment

| Criterion                                         | Status      | Implementation evidence                                                                                                                                                                                                                    | Test evidence / gap                                                                                 |
| ------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Hash-locked request/artifact contract             | **Met**     | Request and attachment schemas: `apps/web/lib/resume/autofill-schema.ts:153-214`, `224-242`                                                                                                                                                | Hash mismatch rejection: `apps/web/lib/resume/__tests__/cover-letter-artifact-safety.test.ts:22-25` |
| Real initial generation and PDF compile           | **Stub**    | Fake PDF is built with `Buffer.from('%PDF-1.4...')` at `apps/web/app/api/resume-generator/cover-letter/route.ts:13-16`                                                                                                                     | No prompt file, model call, LaTeX compile, repair, or PDF validation                                |
| Correct first-generation quota semantics          | **Risk**    | Route always calls `consumeAiGeneration(..., true)` at `apps/web/app/api/resume-generator/cover-letter/route.ts:11`                                                                                                                        | First generation incorrectly consumes per-item regeneration budget                                  |
| Non-blocking review/download/edit/regenerate UI   | **Met**     | Review controller/actions: `apps/extension/src/cover-letter-review.ts:50-121`, `136-256`                                                                                                                                                   | UI and invalidation assertions: `apps/extension/tests/cover-letter-review-ui.test.ts:6-17`          |
| Edit invalidates old PDF before recompilation     | **Met**     | `apps/extension/src/cover-letter-review.ts:97-120`; compile route reuse in `apps/extension/src/background.ts:829-864`                                                                                                                      | Existing UI test covers synchronous invalidation and hash check                                     |
| Artifact stores the reviewed attachment           | **Met**     | `apps/extension/src/background.ts:803-817`, `855-864`                                                                                                                                                                                      | Schema hash-lock test exists; end-to-end compile-to-artifact test is missing                        |
| Empty/type/no-overwrite attachment guards         | **Met**     | `apps/extension/src/easy-apply-engine.ts:430-442`                                                                                                                                                                                          | Source assertions: `apps/extension/tests/phase1b1c-dedicated-safety.test.ts:33-37`                  |
| Hash enforced at attachment boundary              | **Partial** | Schema and background check hashes, but `attachGeneratedCoverLetter()` accepts an attachment without the parent artifact hash at `apps/extension/src/easy-apply-engine.ts:430-442`                                                         | Add a direct mismatch rejection test                                                                |
| Resolver and child-frame relay carry cover letter | **Missing** | Response type permits it at `apps/extension/src/resume-autofill-contract.ts:120-130`, but resolver omits it at `apps/extension/src/prefill-payload-resolver.ts:70-81`; relay schema omits it at `apps/extension/src/background.ts:222-253` | Cover-letter attachment is unreachable from a resolved prefill run                                  |
| Separate resume and cover-letter coverage         | **Missing** | `coverLetterResult` is computed then discarded at `apps/extension/src/easy-apply-engine.ts:703-707`; coverage groups have no cover-letter group at `apps/extension/src/prefill-coverage.ts:1-14`                                           | Add separate outcome and DOM test                                                                   |

### Phase 3 — Experience and education engine

| Criterion                                         | Status      | Implementation evidence                                                                                                                                                                                        | Test evidence / gap                                                                                                                                                      |
| ------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section-aware history mappings                    | **Met**     | Generic classifier: `apps/extension/src/section-aware-classifier.ts:82-153`; adapter classifier: `apps/extension/src/ats-prefill-adapters.ts:96-139`                                                           | Two-record engine fixture: `apps/extension/tests/repeatable-record-engine.test.ts:63-106`                                                                                |
| Preserve date precision                           | **Met**     | Month fill requires month precision and text dates are not converted: `apps/extension/src/repeatable-record-engine.ts:124-138`                                                                                 | `apps/extension/tests/repeatable-record-engine.test.ts:96-100`                                                                                                           |
| Stable display-order mapping                      | **Met**     | DOM ordering and record indices: `apps/extension/src/repeatable-record-engine.ts:44-82`                                                                                                                        | Employer-row pairing: `apps/extension/tests/history-prefill-coverage.test.ts:32-44`                                                                                      |
| Visible, empty, native controls only              | **Met**     | Visibility/custom-control guard: `apps/extension/src/repeatable-record-engine.ts:31-42`, `85-103`                                                                                                              | Non-empty and combobox assertions: `apps/extension/tests/repeatable-record-engine.test.ts:57-61`, `98-100`                                                               |
| Skills do not widen history matching              | **Met**     | Skills stay a separate section/field: `apps/extension/src/section-aware-classifier.ts:1-25`, `138-139`                                                                                                         | Default-off skills tests remain separate from history tests                                                                                                              |
| Remaining records shown; Add another stays manual | **Met**     | Planning exposes remaining count and has no button input: `apps/extension/src/history-prefill-coverage.ts:68-85`; copy at `46-55`                                                                              | No host click and remaining-row assertions: `apps/extension/tests/history-prefill-coverage.test.ts:46-53`                                                                |
| Referral/website/manager organization traps       | **Partial** | Section-aware classifier guards these terms at `apps/extension/src/section-aware-classifier.ts:118-120`; ATS adapter company rule lacks the same guard at `apps/extension/src/ats-prefill-adapters.ts:117-119` | Add shared `ORG_TRAP_RE` and adapter parity test                                                                                                                         |
| Workday/Greenhouse adapter DOM classification     | **Partial** | Adapter boundaries exist at `apps/extension/src/ats-prefill-adapters.ts:197-220`                                                                                                                               | Current test covers `matches()` and generic classification only: `apps/extension/tests/ats-prefill-adapters.test.ts:32-112`; sanitized platform DOM fixtures are missing |

### Phase 5 — Rollout, monitoring, legal, and release

| Criterion                                        | Status          | Evidence / gap                                                                                                                                                                                                |
| ------------------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Independent feature flags                        | **Missing**     | No flag module exists; `apps/extension/src/autofill-preferences.ts:3-11` only stores mode and skills preferences                                                                                              |
| Stub routes unreachable while flags are off      | **Missing**     | Both AI routes are callable from background message handlers in `apps/extension/src/background.ts:289-305`                                                                                                    |
| Required low-cardinality dimensions              | **Partial**     | Current event allowlist has only site/outcome/count basics in `apps/extension/src/widget-platform.ts:120-179`; adapter, mode, source, expiry/mismatch, review, feature state, and per-group counts are absent |
| Matching server allowlist                        | **Partial**     | Server accepts only its current normalized widget event contract through `apps/web/app/api/extension/widget-event/route.ts:46-72`; extend the shared normalizer and tests                                     |
| User-facing error taxonomy                       | **Missing**     | No shared enum distinguishes extraction failure, unsupported control, draft-review pending, and attachment failure                                                                                            |
| Privacy and support copy                         | **Missing**     | `apps/web/lib/legal/legal-config.ts:36-40` contains only generic extension copy; the privacy/support surfaces do not describe autofill, Continuous, answer reuse, cover letters, or skills                    |
| Resume empty-input DOM test                      | **Missing**     | Existing tests inspect source rather than exercising a file input and `DataTransfer`                                                                                                                          |
| Compile-repair-to-snapshot-hash integration test | **Missing**     | Unit tests cover each side, but not the repaired final LaTeX through artifact hashing                                                                                                                         |
| Extension release version/checklist              | **Missing**     | Version remains `0.1.11`; `apps/extension/README.md:192-220` has only a generic publication checklist                                                                                                         |
| Frame-scope store review                         | **Open review** | Document why `all_frames` and `match_about_blank` are needed at `apps/extension/manifest.json:788-790`; verify no new permission was added and cross-origin relay remains explicit                            |

## Stage 0 — Record truth

- [x] Create this audit matrix with implementation and test evidence.
- [x] Correct Phase 1/1B/1C/3 README checkboxes.
- [x] Label the two fake generation paths as non-functional stubs.
- [x] Record merged-but-unreleased status, version `0.1.11`, and missing flags.
- [x] Record the `all_frames` / `match_about_blank` Web Store review item.
- [x] Run the full repository test suite and TypeScript checks.
- [x] Commit the docs-only stage on its own branch.

Stage 0 exit: reviewers can distinguish implemented deterministic behavior,
partial wiring, stubs, and missing rollout work without reading source.

Validation on 2026-07-25:

- Web: 84 test files, 397 tests passed.
- Extension: all scripted assertions plus 24 Node test cases passed.
- API: two suites, four tests passed.
- Web, extension, and API `tsc --noEmit` checks passed.
- Two stale ignored `.next/types/* 2.ts` build artifacts were removed after they
  caused duplicate declaration errors; they were generated files, not source.

## Stage 1 — P0 truthfulness and safety blockers

### Title truthfulness

- [ ] Remove the aggressive job-title rewrite instruction.
- [ ] Add official job titles, companies, schools, degrees, fields of study, and
      dates to the prompt's `<never_change>` rules.
- [ ] Add a regression test proving a model-proposed rewritten title cannot
      enter the autofill snapshot.

### Durable quotas

- [ ] Add an atomic Supabase quota function/table keyed by user/day and
      user/item/day.
- [ ] Apply 25/day and three regenerations per item transactionally.
- [ ] Return the next UTC reset as `resetsAt` on success and failure.
- [ ] Make initial generation consume daily capacity but not regeneration
      capacity.
- [ ] Fix cover-letter `isRegeneration` semantics.
- [ ] Add concurrency, day rollover, first-generation, and item-cap tests.

### Sensitive-question parity

- [ ] Move the sensitive-question pattern to a shared package/module importable
      by extension and web code.
- [ ] Use the same pattern in deterministic matching, client screening
      detection, and the server route.
- [ ] Add route tests proving `work permit`, `equal opportunity`, eligibility,
      visa, sponsorship, work authorization, citizenship, EEO, salary, DOB,
      SSN, disability, veteran, and clearance prompts are rejected before
      authentication/quota/model work.

Stage 1 exit: no generated application field can misrepresent an official
title; quotas are atomic across serverless instances; all sensitive screening
questions fail closed on the server.

## Stage 2 — Gate stubs and complete dormant wiring

### Independent flags

- [ ] Add one typed feature-flag module with defaults:
      `artifactPrefill=true`, `skills=false`, `continuousMode=false`,
      `aiScreeningDrafts=false`, `coverLetter=false`, `historyFields=true`,
      `atsAdapters=true`.
- [ ] Gate UI, background message handlers, resolver, and engine paths at the
      nearest safe boundary.
- [ ] Keep profile-only prefill available when every new flag is off.

### Stub containment

- [ ] Return `501 Not Implemented` from initial cover-letter generation while
      `coverLetter=false`; never emit fake PDF bytes.
- [ ] Keep screening generation UI and route unreachable while
      `aiScreeningDrafts=false`.
- [ ] Preserve the contracts so real generation can land later without
      weakening the deterministic release.

### Cover-letter wiring

- [ ] Populate `coverLetter` in the prefill resolver.
- [ ] Validate and relay it through `PREFILL_CHILD_FRAMES`.
- [ ] Pass parent `generatedContentHash` into attachment and reject mismatches at
      that boundary.
- [ ] Consume `coverLetterResult`.
- [ ] Add a `cover_letter` coverage group and report resume/cover-letter
      attachment separately.

### Review and classifier gaps

- [ ] Add an explicit Confirm action that calls `confirmDraftReview()`.
- [ ] Cap normalized `questionText` client-side before POST.
- [ ] Export `ORG_TRAP_RE` and reuse it in flat, section-aware, and ATS adapter
      classification.
- [ ] Add regression tests for unedited confirmation, input cap, and
      manager/referral/company-website traps.

Stage 2 exit: disabled AI surfaces cannot be reached; no fake PDF can be
produced; dormant cover-letter transport is safe for future enablement; review
and organization-trap behavior is consistent.

## Stage 3 — Phase 5 rollout completion

### Telemetry and errors

- [ ] Extend prefill telemetry with only bounded enums/counts: feature state,
      adapter ID, mode, source type, expiry/mismatch reason, review state, and
      filled/skipped counts per field group.
- [ ] Extend the server allowlist and rejection tests.
- [ ] Add a shared user-facing error taxonomy for extraction failure,
      unsupported control, review pending, and attachment failure.
- [ ] Prove names, employers, titles, dates, URLs, question/answer text, cover
      letter text, resume text, hashes, and PDFs are rejected from analytics.

### Legal and support

- [ ] Update `legal-config.ts` with reviewed extension-autofill disclosure copy.
- [ ] Update privacy/support pages for deterministic autofill, Continuous mode,
      exact-question answer reuse, disabled/future AI drafts, cover letters, and
      optional skills.
- [ ] Preserve the attorney-review marker and bump policy version/effective date
      only if the product owner approves the material legal change.

### Missing test fixtures

- [ ] Add sanitized Workday `classifyRepeatableSections` DOM fixture.
- [ ] Add sanitized Greenhouse `classifyRepeatableSections` DOM fixture.
- [ ] Add resume empty-input/existing-file/accept-type DOM attachment tests.
- [ ] Add compile-repair-to-final-snapshot-hash integration test.
- [ ] Retain every existing no-overwrite/no-click/no-sensitive/no-sync-storage
      assertion.

### Release

- [ ] Bump both extension package and manifest versions together.
- [ ] Expand `apps/extension/README.md` with a job-scoped autofill production
      checklist, flag defaults, privacy verification, manual Workday/Greenhouse
      matrix, rollback controls, and frame-scope Web Store justification.
- [ ] Run the full suite and `tsc --noEmit`.
- [ ] Produce the local release handoff; Chrome Web Store submission remains an
      owner action.

Stage 3 exit: the deterministic slice can be released behind independent
controls with adequate privacy disclosures, support signals, platform fixtures,
and rollback guidance.

## Invariants that no stage may weaken

- Never select a historical or merely “latest” resume as an autofill fallback.
- Never fill from an expired or job-mismatched artifact.
- Never overwrite a non-empty field, existing tag, or existing file.
- Never generate or insert an answer for a sensitive question.
- Never click Add another, Next, Review, Done, Submit, or another host-page
  navigation action.
- Never place resume, question, answer, or cover-letter content in analytics,
  logs, or `chrome.storage.sync`.
- Never attach a cover letter whose source hash differs from the active resume
  artifact.
- Keep Step-by-step as the default; Continuous and skills remain explicit
  opt-ins.

## Local branch and handoff policy

Each stage is isolated as one local `codex/` branch and one reviewable commit
series. The stages are sequential; a later stage may be based on the preceding
stage for local validation, but its eventual PR targets the then-current
`main`. No branch is pushed and no PR is opened until the owner asks.
