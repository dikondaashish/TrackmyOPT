# TrackMyOPT Codebase Audit — Phase 1

**Audit date:** 2026-07-25  
**Audited revision:** `04225e0` on `codex/autofill-guided-autopilot-stage4`  
**Status:** Analysis only. No product code, database schema, dependencies, or public APIs were changed.

## Executive summary

The repository contains three deployable products, not four:

- `apps/web`: Next.js/React web application and most HTTP APIs
- `apps/extension`: Manifest V3 Chrome extension
- `apps/api`: NestJS resume/OCR service
- `supabase`: database schema and migrations

No React Native/mobile application, `ios` project, `android` project, mobile package, or mobile build configuration exists in this checkout. The requested mobile audit therefore cannot be completed from this repository. This is a scope gap, not evidence that the mobile application is healthy.

The available repository contains 1,411 tracked files (about 70.7 MB). Every tracked file was included in repository inventory, reference searches, secret-pattern scans, and applicable compiler/linter/dependency tooling. High-risk authentication, billing, resume, OCR, immigration, extension, and database paths were then reviewed manually.

I found:

- **9 Critical findings** requiring Phase 2 attention
- **22 Medium findings** involving security hardening, broken contracts, dead code, configuration drift, and duplication
- **7 Low findings** involving maintainability and documentation
- No committed production credentials matching the scanned key/token/private-key patterns
- Three likely-dead tracked web modules, four runtime-unreachable extension modules, and 16 ignored Finder-style duplicate files
- A clean web and extension typecheck, passing web/extension/API unit tests, but a broken API end-to-end test

The highest-risk issues are cross-user resume access through the web-to-Nest proxy, unsafe legacy Supabase function privileges, Stripe webhooks acknowledging failed entitlement updates, ineffective serverless authentication rate limits, partial account creation, an SSRF/memory-exhaustion path, incorrect OPT/STEM unemployment calculations, and a broken bearer-token profile contract used by the extension.

## Scope and method

Reviewed inputs included:

- All tracked source and test files under `apps/web`, `apps/extension`, `apps/api`, and `supabase`
- Root and app-level `package.json` files and `pnpm-lock.yaml`
- TypeScript, Next.js, NestJS, Vitest, Jest, Playwright, ESLint, extension, Vercel, and CI configuration
- All tracked README and architecture documentation
- `.env.example`, `apps/web/.env.local.example`, and `apps/web/.env.test.local.example`
- Supabase schema files, migrations, generated database types, RLS policies, functions, and grants
- Cross-product routes, bearer/cookie authentication, resume/OCR flows, Stripe webhooks, and extension payloads

No `AGENTS.md` file is present in the repository.

### Important limitations

1. **Mobile is absent.** A React Native audit requires the missing source repository or folder.
2. **Cloud state was not changed or assumed.** Live Supabase grants, deployed environment variables, Stripe state, S3 contents, and Vercel configuration were not modified. Findings about source-controlled SQL are qualified where live ACLs could differ.
3. **External dependency advisories could not be refreshed.** The environment blocked an npm-registry audit because it would disclose the dependency manifest externally without a separate authorization. Lockfile metadata and locally installed dependency graphs were still inspected.
4. **No live destructive or billable flows were exercised.** No Stripe charge, production account mutation, resume deletion, or database migration was performed.
5. Static “unused” tools are heuristic. Results were cross-checked against framework conventions, extension entry points, tests, and string references before being classified.

## System and data flow

```text
Chrome extension
  ├─ extension callback/custom bearer token
  ├─ /api/me, /api/extension/*, /api/resume-generator/*
  ├─ session-only job/resume artifacts
  └─ job-portal DOM autofill
               │
               ▼
Next.js web application and API routes
  ├─ cookie-based Supabase auth for the website
  ├─ custom bearer verification for the extension
  ├─ Stripe webhooks and subscription/profile updates
  ├─ USCIS, email, PostHog, and AI integrations
  └─ /api/proxy/* forwards to NestJS with an internal API key
               │
        ┌──────┴─────────┐
        ▼                ▼
Supabase/Postgres      NestJS resume/OCR API
  profiles, cases,       service-role Supabase
  jobs, artifacts,       S3, Textract, OCR
  quotas, RLS
```

The most important trust boundary is `/api/proxy/[...path]`: a user authenticates to Next.js, Next.js authenticates itself to NestJS, and NestJS then uses service-role credentials. User ownership must therefore be enforced explicitly at the proxy or NestJS layer; RLS cannot protect service-role queries.

# Critical findings

## C-01 — Authenticated users can access or alter other users' resumes

**Evidence**

- `apps/web/app/api/proxy/[...path]/route.ts:100-155` verifies that some user is signed in, but forwards caller-supplied query parameters and bodies unchanged.
- The allowlist includes resume list, lookup, save, delete, download URL, and direct OCR operations.
- `apps/api/src/resume/resume.controller.ts:21-93` accepts `userId`, resume IDs, and object keys from the request.
- `apps/api/src/resume/resume.service.ts:73-76` uses a Supabase service-role client.
- `apps/api/src/resume/resume.service.ts:223-264` looks up a resume without an owner constraint and creates a signed URL for a caller-supplied S3 key.

**Impact**

Any signed-in user who learns or guesses another user's ID, resume ID, or storage key can potentially list, read, overwrite, delete, or obtain a signed download URL for that user's resume. Because the Nest service uses service-role credentials, Supabase RLS does not stop this.

**Phase 2 direction**

Derive the user ID exclusively from the verified Next.js identity, pass it in a trusted header or signed internal claim, ignore caller-supplied ownership fields, and enforce `id + user_id` on every Nest lookup/mutation. Constrain signed URLs to a verified resume record owned by that user. Add cross-user denial tests.

## C-02 — Legacy Supabase `SECURITY DEFINER` functions may be executable by public roles

**Evidence**

- `supabase/schema/004_functions.sql:67-86` defines `upgrade_user_to_premium(user_id)` as `SECURITY DEFINER`.
- `supabase/schema/004_functions.sql:106-132` defines a function that returns premium users' email addresses and names.
- `supabase/schema/007_grants.sql:87-89` grants selected functions to `service_role`, but the schema does not first revoke default function execution from `PUBLIC`, `anon`, or `authenticated`.
- These legacy definer functions do not set a fixed `search_path`.
- `supabase/README.md` instructs a fresh installation to run these schema files.

**Impact**

PostgreSQL functions grant `EXECUTE` to `PUBLIC` by default. If the deployed ACL matches this source, an anonymous/authenticated caller may be able to upgrade an arbitrary profile or extract premium-user PII through Supabase RPC. An unfixed `search_path` also weakens definer-function safety.

**Phase 2 direction**

First inspect production `proacl` values. Add an idempotent migration that revokes all public execution, grants only the intended service role, schema-qualifies objects, and fixes `search_path`. Add database permission tests. Do not assume an out-of-band production revoke exists.

## C-03 — Stripe webhooks acknowledge failed entitlement updates

**Evidence**

- `apps/web/app/api/stripe/webhook/route.ts:141-256` returns HTTP 500 only when an error reaches the outer handler.
- Primary handlers log and swallow database/entitlement failures, including checkout completion around `:287-296` and `:466-468`, invoice paid around `:1135-1137`, subscription updated around `:1237-1239`, and subscription deleted around `:1324-1326`.
- The route then returns `{ received: true }` with HTTP 200.

**Impact**

Stripe sees the event as delivered and does not retry. A payment can succeed while TrackMyOPT fails to activate premium access, or a cancellation can fail to remove it. This creates billing/support incidents and inconsistent subscription state.

**Phase 2 direction**

Rethrow failures from primary billing and entitlement mutations so Stripe retries. Keep analytics/email failures best-effort. Make handlers idempotent and add tests proving a failed primary mutation produces a non-2xx response.

## C-04 — Authentication rate limits do not survive serverless execution

**Evidence**

- `apps/web/lib/auth/api-rate-limit.ts:86-104` stores counters in a module-level `Map` and explicitly notes that serverless instances do not share state.
- `apps/web/lib/auth/rate-limit.ts:7-31` implements a second in-memory limiter.
- These limit login, signup, password reset, user-existence checks, and other public/cost-bearing endpoints.
- The codebase already has a durable Upstash-based limiting pattern for other routes.

**Impact**

An attacker can bypass limits across Vercel instances and cold starts, enabling credential stuffing, email bombing, account creation abuse, enumeration, and provider-cost attacks.

**Phase 2 direction**

Move authentication and password-reset limits to the durable limiter with IP plus normalized account identifiers. Preserve fail-safe behavior and add multi-instance-style tests. Treat non-auth public endpoints as a subsequent hardening task.

## C-05 — Manual signup can create confirmed but incomplete accounts

**Evidence**

- `apps/web/app/api/manual/signup/route.ts:41` relies on the in-memory limiter.
- It calls `admin.createUser({ email_confirm: true })` around `:81-87`.
- Date parsing/validation occurs later around `:117-133`, so invalid input can return 400 after auth creation.
- Profile and OPT-status upserts around `:105` and `:136` do not enforce their returned errors.
- No compensating deletion/rollback runs after a partial failure.

**Impact**

Invalid or failed signups can leave confirmed auth users without profiles or compliance data. The public endpoint can also be used to create confirmed accounts or trigger email/account abuse.

**Phase 2 direction**

Validate all input first, use durable rate limiting, check every database result, and implement a transaction/compensation strategy so account creation is all-or-nothing. Reconsider immediate `email_confirm: true`.

## C-06 — URL processing permits SSRF variants and unbounded response buffering

**Evidence**

- `apps/web/app/api/resume-generator/process-url/route.ts:20-47` blocks only a subset of private IPv4 addresses and `::1`.
- IPv6 ULA (`fc00::/7`), link-local (`fe80::/10`), mapped/reserved forms, and DNS rebinding are not safely handled.
- The route buffers full responses with `arrayBuffer()`/`text()` around `:168` and `:200` before applying a byte limit.
- No durable request limit protects the endpoint.

**Impact**

An authenticated caller can probe internal/link-local services through unblocked address forms or make the server download very large responses, causing memory pressure and provider cost.

**Phase 2 direction**

Use a vetted URL/IP policy, resolve and validate every address immediately before connection, reject redirects to disallowed networks, stream with a hard byte cap and timeout, restrict content types/ports, and add durable rate limits plus SSRF test cases.

## C-07 — OPT/STEM unemployment clocks can give materially wrong compliance guidance

**Evidence**

- `apps/extension/src/pages/clock.ts:452` asks for an OPT start date; `apps/extension/src/pages/clock-tracker.ts:201-203` treats “start date + 90 days” as the unemployment deadline without employment periods.
- `apps/extension/src/pages/stem-clock.ts:452` asks for a STEM start date; `apps/extension/src/pages/stem-clock-tracker.ts:201-203` uses “STEM start + 60 days,” ignoring unemployment already used during initial OPT and the cumulative 150-day limit.
- The correct shared calculation exists in `apps/web/lib/immigration/optCalculations.ts:248-370`.
- `apps/web/app/api/send-daily-reminders/route.ts:403-430` calculates cumulative STEM unemployment correctly, but `apps/web/lib/email/templates/partials/stem-clock.ts:8-10` and `:41-64` labels/displays it against 60 days.

**Impact**

F-1 users may be told that they have more or fewer unemployment days than they actually do. This is high-stakes immigration guidance and can affect status-maintenance decisions.

**Phase 2 direction**

Use one tested calculation contract across web, extension, and email. The extension clock must incorporate employment periods and STEM carryover, not derive a compliance deadline from EAD start alone. Add boundary, overlapping-employment, initial-OPT, and cumulative-STEM tests, and include a clear non-legal-advice explanation.

## C-08 — The extension's bearer-token `/api/me` contract is broken

**Evidence**

- `apps/web/app/api/me/route.ts:92-138` validates the extension's custom bearer JWT and obtains a user ID.
- Subsequent profile queries around `:144-148` and `:207` still use a cookie-backed anonymous Supabase client rather than a client authorized as that bearer user or a scoped service-role query.
- A missing RLS result is treated as a missing profile and triggers a service-role insert around `:151-174`.
- The response uses the cookie Supabase user's value around `:313-324`, which is null for a true bearer-only request.
- The extension calls this endpoint with `credentials: "omit"` in `apps/extension/src/popup.ts:46-53` and the corresponding background profile flow.

**Impact**

The core signed-in extension profile/autofill flow can return 500, attempt duplicate profile creation, or return the wrong auth shape when no website cookie happens to mask the problem.

**Phase 2 direction**

Implement one identity resolver, then query the verified user's exact row through a securely scoped server client. Never infer “missing profile” from an RLS-hidden result. Add a bearer-only integration test with no cookies.

## C-09 — A production XML parser is lockfile-marked as having critical issues

**Evidence**

- `pnpm-lock.yaml` resolves `@xmldom/xmldom@0.8.11` and carries the package's “critical issues” deprecation warning.
- It enters the production graph through `mammoth`.
- `apps/api/src/ocr/ocr.controller.ts:47-51` parses user-uploaded DOCX content with Mammoth.

**Impact**

User-controlled documents reach a dependency whose own lockfile metadata says it has critical issues. The exact current advisory and safe upgrade path could not be refreshed without external registry access.

**Phase 2 direction**

Authorize a registry/advisory lookup, upgrade Mammoth/xmldom to a supported patched graph, and run malicious/oversized document tests. Until validated, isolate parsing, enforce strict size/time limits, and treat uploaded files as hostile.

# Medium findings

## Security, privacy, and reliability

### M-01 — PII is stored in Chrome sync storage

The four OPT/STEM clock/countdown pages write `subscribedEmail` to `chrome.storage.sync` (for example `apps/extension/src/pages/clock-tracker.ts:477` and `:581`). This synchronizes an email address through the user's Google account even though the privacy page says sync is for non-sensitive display preferences. The value appears unnecessary because the app can fetch the profile again.

### M-02 — Extension CORS trusts every Chrome extension ID

`apps/web/lib/api/cors-policy.ts:32-37` reflects any `chrome-extension://...` origin. Sensitive extension endpoints should allow only the published extension ID(s), with explicit development IDs where required.

### M-03 — OCR status ownership fails open

`apps/web/app/api/resume-generator/ocr/status/route.ts:48-98` checks ownership only when a cached database row exists. If it does not, the route queries Textract using the caller's job ID. Job IDs are high entropy, but missing persistence must not remove ownership enforcement.

### M-04 — Public lead-table inserts bypass application rate limits

Some public contact/partnership/insurance tables permit broad anonymous inserts through RLS. Application-level in-memory limits can be bypassed by calling Supabase directly. If direct inserts are intentional, add database-side abuse controls and monitoring; otherwise route them only through a durably limited server endpoint.

### M-05 — Raw provider/database errors can enter logs or responses

Production source contains approximately 337 `console.error`, 29 `console.warn`, 28 `console.log`, and 7 `console.info` calls outside test/script folders. Next production config strips log/info/warn but preserves error. Several routes log whole provider/database error objects instead of sanitized `secureLog` fields; a few return `error.message`/details to clients. This creates PII, token-fragment, and internal-schema exposure risk.

### M-06 — Extension HTML interpolates an email without escaping

Clock UI files interpolate the email address into `innerHTML` (for example `apps/extension/src/pages/clock-tracker.ts:481-487`). MV3 CSP reduces script execution risk, but markup/resource injection remains possible. Build DOM nodes and assign `textContent` instead.

### M-07 — Large proxy responses are buffered without a response cap

`apps/web/app/api/proxy/[...path]/route.ts:155` buffers the full Nest response with `arrayBuffer()`. Add streaming or a strict upper limit, especially for document/OCR operations.

### M-08 — Fire-and-forget session bookkeeping is unreliable

`apps/web/app/api/me/route.ts:127-137` starts a session/profile side effect without awaiting it or scheduling it with Next.js `after()`. Serverless execution can terminate before completion, producing inconsistent session telemetry.

### M-09 — User-existence endpoint enables enumeration

The public check-user route returns a direct `exists` answer and is protected only by the ineffective in-memory limiter. Use a neutral response where possible and durable abuse controls.

### M-10 — Non-auth public and AI routes use the second in-memory limiter

Contact, partnerships, extension feedback/jobs/widget events, and some resume generation/fix routes rely on `apps/web/lib/auth/rate-limit.ts`. This does not survive serverless scaling and leaves spam/provider-cost protection inconsistent.

## Broken contracts and configuration drift

### M-11 — The web calls a route that does not exist

`apps/web/components/dashboard/OptToolsSection.tsx:23` calls `/api/opt-status`, but no route exists under `apps/web/app/api`. The component silently fails to load the intended status/banner data.

### M-12 — Referral and sponsor RPC contracts are missing from source SQL

Application/generated types reference `increment_referral_clicks`, `increment_referral_signups`, `increment_referral_conversions`, and `get_sponsor_intelligence`, but their function definitions are absent from `supabase/schema` and `supabase/migrations`. A backfill migration notes that the original referral migration was never captured. Several caller errors are ignored, allowing an endpoint to appear successful without recording a conversion.

### M-13 — Fresh-database instructions conflict with the migration source of truth

The root documentation says migrations are authoritative, while `supabase/README.md` tells operators to run legacy `schema/000...007` files. Those legacy files create only a subset of the current database (roughly 12 tables versus 28 in the documented inventory) and contain the definer-function issue above. A fresh environment is therefore not reproducible safely from the documented procedure.

### M-14 — Environment examples and runtime validation are incomplete

Code references at least 23 variables absent from the tracked examples, including ClamAV/virus scan, OCR flags, LaTeX compiler, Chrome extension/store IDs, VAPID, PostHog project/personal/sourcemap values, and re-engagement controls. `SMTP_PASS` versus `SMTP_PASSWORD` is inconsistent. `apps/web/lib/env.ts` validates only a subset, so missing production configuration can fail late.

### M-15 — API configuration validates too little and fails late

The Nest `AppModule` validates only a small group of API/CORS/Redis values, while resume/OCR services require Supabase and AWS configuration. `ResumeService` constructs clients immediately from possibly empty strings; this is why the API e2e test fails before it reaches `/`.

### M-16 — Supported Node version is inconsistent

The root package declares Node `>=18.17`, while installed Next.js 16 requires Node `>=20.9.0`; CI currently uses Node 20. Align the declared engine and developer documentation with the actual framework requirement.

### M-17 — CI omits two products and cannot trigger its E2E job

`.github/workflows/test.yml` lint/typechecks/tests/builds only `apps/web`; it does not verify the extension or Nest API. Its E2E job requires `github.event_name == 'workflow_dispatch'`, but `workflow_dispatch` is not listed as a workflow trigger, so the job cannot run.

### M-18 — API lint mutates files

The API lint script uses ESLint `--fix`, which makes a validation command mutate the worktree. Provide separate check and fix commands, and use the non-mutating command in CI.

## Dead code, bloat, and duplication

### M-19 — Likely-dead tracked web files

Reference analysis found no runtime/test consumers for:

- `apps/web/lib/billing/notifyMaterialPolicyChange.ts`
- `apps/web/lib/documents/pdf-parser.ts`
- `apps/web/lib/notifications/marketing-emails.ts`

The last file also contains a campaign date that expired on 2026-03-31. These are Phase 3 removal candidates after an owner confirms no external/manual import depends on them.

### M-20 — Four extension modules are absent from every production bundle

Building the actual six extension entry points with a metafile showed that 58 of 62 source modules are reachable. These four contain runtime values used only by tests or source-string checks:

- `apps/extension/src/cover-letter-review-ui.ts` — superseded by `cover-letter-review.ts`
- `apps/extension/src/history-prefill-coverage.ts`
- `apps/extension/src/saved-screening-answers.ts` — background code separately duplicates the API calls
- `apps/extension/src/section-aware-classifier.ts` — production imports only erased TypeScript types

Do not delete them until the tests are moved to the live implementation or the intended runtime wiring is restored.

### M-21 — Sixteen ignored local Finder duplicates exist

The worktree contains 16 ignored files named `* 2.*`, including eight blog pages, `layout 2.tsx`, `JobTrackerUsageBar 2.tsx`, copied tests, a usage-limit copy, and a migration copy. Seven are byte-identical; nine differ or are stale. They are not tracked or built, but they can confuse searches and future edits. Review and remove them locally in Phase 3; do not treat the differing copies as a source of truth.

### M-22 — Important business logic is duplicated and already diverging

- OPT/STEM extension clock, tracker, and countdown files repeat roughly 600–680 lines each.
- Extension and web date/unemployment calculations do not share the proven `optCalculations.ts` contract.
- Cookie/bearer identity resolution is manually repeated; `/api/me` has already diverged from safer helpers.
- Resume/screening API calls are duplicated between extension utility modules and background code.
- Multiple filing-window/date calculations exist outside the named source-of-truth helper.

Consolidation belongs in Phase 3 only after Critical behavior is protected by characterization tests.

# Low findings

## L-01 — Web lint reports 870 warnings

There are no lint errors, but 283 files produce 870 warnings: 613 unused variables/imports, 130 explicit `any`, 69 raw `<img>` uses, and 58 React hooks/compiler warnings. Some compiler warnings are optimization/style issues rather than correctness bugs, so they should be reduced in small verified batches rather than auto-fixed.

## L-02 — Large exported-surface cleanup candidates

Static analysis reports about 165 unused exports and 147 unused exported types in the web app. Many are framework, test, or future public surfaces. Treat the list as a review queue, not a deletion list.

## L-03 — Dependency cleanup candidates need framework-aware confirmation

Likely unused web development dependencies include `@eslint/eslintrc`, `@eslint/js`, `@types/bcryptjs`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-prettier`, and `typescript-eslint`. API candidates include `@eslint/eslintrc`, `@types/bull`, `@types/multer`, `source-map-support`, and `ts-loader`. Some test/build dependencies are loaded implicitly, so each must be removed and tested individually.

`@types/bcryptjs` and `@types/bull` are deprecated stub type packages. Transitive lockfile warnings also include old `uuid`, `glob`, `inflight`, and related packages.

## L-04 — Stale comments and commented-out tests remain

Examples include the disabled block in `apps/web/e2e/routing.spec.ts:53-54`, an effect with comments but no behavior in a history page, old “removed Supabase client” comments, and a commented Sidebar state declaration.

## L-05 — Documentation still names Next.js 14

`apps/web/README.md`, an upload-route comment, and `docs/architecture/DIRECTORY_DEEP_DIVE.md` say Next.js 14 while the package uses Next.js 16.

## L-06 — ESLint/browser metadata maintenance is stale

ESLint reports that `.eslintignore` is no longer the supported ignore mechanism, and Browserslist reports `caniuse-lite` data about six months out of date.

## L-07 — One extension production debug statement remains

`apps/extension/src/content-job-portal.ts:4732` has a production `console.log`. Extension production code otherwise contains only a small number of console statements.

# Secret and credential review

No committed value matched the scanned patterns for:

- Stripe live/test secret keys or webhook secrets
- AWS access keys
- Google API keys
- GitHub or Slack tokens
- PEM/private-key blocks
- Supabase service-role JWT-shaped secrets

Matches that were inspected were CI/test placeholders, documentation examples, or variable names. Real `.env` files are ignored and were not printed. This is a positive source-code result, not proof that previously committed history or deployed environment variables are clean; a history-aware tool such as Gitleaks should be run when external tooling is authorized.

# Tool false positives explicitly excluded

- `apps/web/public/sw.js` is **not dead**; `WebPushEnableButton.tsx` registers it.
- `sharp` is **not classified as unused**; Next.js image optimization can load it at runtime without a static import.
- Framework entry files, Playwright/Jest configuration targets, generated database types, and test-only exported contracts were not automatically labeled dead.
- The absence of a module from a single test import graph was not enough to classify it; extension dead-module results come from all six real bundle entry points.

# Verification results

| Check | Result | Notes |
|---|---:|---|
| Web TypeScript | Pass | `tsc --noEmit` |
| Web ESLint | Pass with warnings | 0 errors, 870 warnings |
| Web unit tests | Pass | 92 files, 460 tests |
| Extension TypeScript | Pass | `tsc --noEmit` |
| Extension tests | Pass | All package test commands passed; final TAP suite 31/31 |
| API ESLint (non-mutating invocation) | Pass | No errors |
| API build | Pass | Nest build completed |
| API unit tests | Pass | 2 suites, 4 tests |
| API E2E | **Fail** | `ResumeService` throws `supabaseUrl is required`; Jest also reports an open handle and does not exit |
| Web Playwright E2E | Not run | Requires a configured running app; CI's manual E2E trigger is currently unreachable |
| Fresh external vulnerability audit | Blocked | Registry access/manifest disclosure was not authorized in this environment |

The API E2E failure is a repository test/configuration defect, not a production assertion. Its test imports the full app without providing or mocking required Supabase/AWS/Redis dependencies.

# Recommended Phase 2 order

No fixes have been made. After approval, Critical work should be split into small, reviewable changes:

1. **Protect user data:** C-01 resume ownership and C-02 database function grants
2. **Protect billing state:** C-03 Stripe webhook retry behavior
3. **Protect accounts:** C-04 durable auth limits and C-05 atomic signup
4. **Protect infrastructure:** C-06 SSRF/streaming limits and C-09 document-parser dependency
5. **Correct user-facing contracts:** C-08 extension bearer profile flow
6. **Correct compliance guidance:** C-07 shared, tested OPT/STEM calculation behavior
7. Run the full verification matrix after every isolated fix; do not mix Medium/cleanup changes into Critical patches

For Phase 2, each finding should be presented with its proposed diff and behavior impact before moving to the next file, as requested. Phase 3 dead-code and dependency cleanup must wait until the Critical fixes are reviewed and approved.

## Approval gate

**Phase 1 is complete. Stop here.** Review this report and explicitly approve Phase 2 before any source code, schema, dependency, or test fixture is changed.
