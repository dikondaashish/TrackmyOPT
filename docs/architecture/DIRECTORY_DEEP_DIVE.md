# Directory deep-dive

Current monorepo map, verified against the filesystem and `git ls-files` on 2026-10-10.

## Root

- `apps/web/` — Next.js web product and server routes.
- `apps/api/` — NestJS API and Bull workers.
- `apps/extension/` — Manifest V3 Chrome extension.
- `.github/workflows/` — `test.yml`, `job-board-ingestion.yml` (manual,
  supervised job-board ingestion; supports `monitor_only`), and
  `official-processing-freshness.yml`.
- `scripts/` — repository utilities: `job-board/` (Python ATS fetcher and
  fixtures/tests), `operations/` (job-board ingestion trigger and test),
  IndexNow submitters, H1B filings migration, USCIS compliance check, and
  agent-skill sync.
- `supabase/` — `migrations/` (canonical, timestamped database changes),
  `schema/` (numbered reference SQL), `functions/` (Edge Functions),
  `tests/` (SQL tests), `admin/` (maintenance and forensic SQL), and `README.md`.
- `docs/` — living references: `architecture/`, `features/`, `plans/`, `ops/`,
  `compliance/`, `marketing/`, `seo/`, and `analytics/`, plus
  `pending-implementation-plan.md`.
- `.agents/` — tracked agent rules and skills (synced by
  `scripts/sync-agent-skills.sh`); `skills-lock.json` pins the installed skills.
- `render.yaml` — Nest API deployment; `docker-compose.yml` — local API/Redis
  support; `turbo.json`, `pnpm-workspace.yaml` — workspace configuration.
- `artifacts/` — tracked only as a `.gitkeep` placeholder.
- `brag-output-2026-09-26-narrated/` — the tracked source and README for the
  Chrome Web Store walkthrough video. Large render output is gitignored.

## Web (`apps/web`)

- `app/` — App Router pages, layouts, and `app/api/**/route.ts` handlers.
- `components/` — `dashboard/` (authenticated features and widgets) plus shared
  domains: `analytics`, `animations`, `billing`, `blog`, `career`,
  `compliance`, `features`, `landing`, `layout`, `legal`, `pricing`, `promo`,
  `research`, `seo`, `tools`, and `ui`.
- `lib/` — domain modules: `ai/` (Gemini and prompts), `answers`, `api`,
  `auth`, `aws/` (S3, Textract, virus scan), `billing`, `blog`, `career`,
  `case-status`, `community-opt`, `compliance`, `config`, `dashboard`,
  `documents`, `extension`, `immigration`, `insurance`, `job-board`, `legal`,
  `messaging`, `notifications/` (queueing, SMTP, templates, reminders), `offers`,
  `opt`, `posthog/` (taxonomy, consent-aware capture), `premium`, `pricing`,
  `resume`, `resume-credits`, `roadmap`, `security`, `seo`, `stripe`,
  `supabase`, `uscis`, and `validators`.
- `hooks/` — shared React hooks.
- `store/` — Zustand-style resume editor and history stores.
- `data/` — static content (glossary, `blog-series/`, and similar datasets).
- `templates/latex/` — resume LaTeX templates.
- `scripts/` — admin, data-seeding (`scripts/data/`), and freshness utilities.
- `e2e/` and `playwright*.config.ts` — Playwright specs and fixtures;
  `__tests__/` and colocated `*.test.ts(x)` — Vitest.
- `types/supabase.ts` — generated database types; regenerate after migrations.
- `proxy.ts` — request proxy (middleware) logic; `vercel.json` — production
  cron registration.

## API (`apps/api`)

- `src/ocr/` — S3/Textract OCR controller, service, Bull processor, and tests.
- `src/uscis/` — enrolled-case filtering, USCIS client/service, Bull processor,
  and tests.
- `src/resume/` — resume APIs/services.
- `src/job-board/` — ATS job ingestion: controller, Bull processors, ATS
  platform registry and Python scraper runner, scheduler run ledger and run
  supervision status, employer matching, visa signals, company discovery, and
  the `JobDataStore` contract with Supabase and Oracle implementations selected
  by `job-data-store.provider.ts`; Oracle backfill, shadow-sync, parity, and
  ingestion-repair code; colocated specs.
- `src/document-security/` — LaTeX-to-PDF compile and upload virus/type scan
  controllers, bearer-token check, and tests.
- `src/common/` — `guards/` (API-key protection) and `decorators/`
  (`@Public()`).
- `src/app.module.ts` — configuration, Redis/Bull registration, and modules.
- `scripts/oracle-*.ts` — manual Oracle job backfill, shadow-sync, and store
  smoke commands (see [Oracle shadow sync](oracle-shadow-sync.md)).
- `sql/oracle/` — Oracle schema and bootstrap SQL for the job store.
- `requirements.job-board.txt` — Python dependencies for the ATS fetcher.
- `test/` — API end-to-end tests.

There is no separate `src/queues/` or `src/mail/` tree; queue processors live
inside their feature modules, and product email currently lives in `apps/web`.

## Extension (`apps/extension`)

The source is a TypeScript module tree under `src/`. The files directly in
`src/` are the esbuild entry points (their output names are referenced by
`manifest.json`, so they stay at the root); everything else lives in a feature
folder:

- `src/background.ts`, `popup.ts`, `sidepanel.ts`, `content.ts`,
  `content-job-portal.ts`, `content-job-portal-bootstrap.ts`,
  `easy-apply-fill.ts`, `job-portal-login-entry.ts`,
  `job-tracker-review-entry.ts`, `feedback-modal-entry.ts`, `tour.ts` — entry
  points built by `esbuild.config.js`.
- `src/background/` — authentication-isolated network access, artifacts,
  profile, screening, and job-tracker handlers behind `background.ts`.
- `src/job-portal/` — job-page widget, ATS adapters, Guided Autopilot
  (allowlisted Next/Continue/Done navigation and final-action rejection),
  portal activation, and login prefill.
- `src/job/` — job description scraping, posting capture, fit, and job tracker
  review.
- `src/easy-apply/` — empty-field/file-safe filling engine, matchers, and the
  LinkedIn Easy Apply dialog.
- `src/prefill/` — prefill coverage, undo, relay/session guards, smart answers
  and dropdowns, sensitive autofill, and repeatable-record handling.
- `src/resume/` — job-scoped resume artifacts, validation, lifecycle, and the
  cover-letter review.
- `src/screening/` — screening question drafts, evidence, and saved answers.
- `src/private/` — private application answer delivery and approval.
- `src/widget/` — shared widget DOM, platform, and preference helpers.
- `src/tour/` — first-install tour content and guide.
- `src/popup/` — popup screens (home, locked, onboarding, navigation, sign-out).
- `src/shared/` — config, token store, icons, lifecycle, feedback, and other
  cross-cutting helpers.
- `src/agent/` — run client, protocol, session, console, and panel templates.
- `src/design/` — design tokens, theme CSS, primitives, and accessibility
  helpers.
- `src/pages/` — OPT/STEM apply, clock, and countdown pages.
- `public/` — popup, side-panel, and tour HTML/CSS and `icons/`.
- `scripts/` — build/package and test utilities (`package-store.mjs`,
  `run-unit-tests.mjs`, browser release checks); `scripts/preview/` holds
  sidebar/tour preview scripts.
- `store-assets/` — Chrome Web Store listing copy, asset renderer, and
  `source/`; the rendered `output/` screenshots are tracked.
- `docs/` — extension architecture and roadmap status reports.
- `tests/` and `tests/fixtures/` — Node/DOM tests and policy invariants.
- `licenses/`, `THIRD_PARTY_NOTICES.md`, `DESIGN.md`, `PRODUCT.md`,
  `manifest.json`, `esbuild.config.js` — metadata and build configuration.

## Conventions

- TypeScript modules generally use kebab-case; React components use PascalCase
  exports.
- Web imports prefer the `@/` alias.
- Database changes go through timestamped migrations.
- New server logging must use sanitized/structured logging and must not include
  resume or answer content.
