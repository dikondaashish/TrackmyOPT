# Directory deep-dive

Current monorepo map, verified against the filesystem on 2026-07-25.

## Root

- `apps/web/` — Next.js web product and server routes.
- `apps/api/` — NestJS API and Bull workers.
- `apps/extension/` — Manifest V3 Chrome extension.
- `supabase/migrations/` — canonical database changes.
- `scripts/` — data, indexing, deployment, and verification utilities.
- `docs/` — living references and pending work.
- `render.yaml` — Nest API deployment.
- `docker-compose.yml` — local API/Redis support.

## Web (`apps/web`)

- `app/` — App Router pages, layouts, and `app/api/**/route.ts` handlers.
- `components/dashboard/` — authenticated dashboard features and widgets.
- `components/pricing/`, `components/legal/`, `components/analytics/` — shared
  product domains.
- `lib/ai/` and `lib/ai/prompts/` — Gemini integration and generation policy.
- `lib/aws/` — S3, Textract, and virus-scan integrations.
- `lib/auth/`, `lib/api/`, `lib/security/` — authentication, rate limits, CORS,
  safe fetches, and request guards.
- `lib/notifications/` — queueing, SMTP transport, templates, and reminders.
- `lib/posthog/` — event taxonomy, consent-aware capture, server capture, and
  tests.
- `types/supabase.ts` — generated database types; regenerate after migrations.
- `vercel.json` — production cron registration.

## API (`apps/api`)

- `src/ocr/` — S3/Textract OCR controller, service, Bull processor, and tests.
- `src/uscis/` — enrolled-case filtering, USCIS client/service, Bull processor,
  and tests.
- `src/resume/` — resume APIs/services.
- `src/common/guards/` — API-key protection.
- `src/app.module.ts` — configuration, Redis/Bull registration, and modules.
- `test/` — API end-to-end tests.

There is no separate `src/queues/` or `src/mail/` tree; queue processors live
inside their feature modules, and product email currently lives in `apps/web`.

## Extension (`apps/extension`)

The source is a flat TypeScript module tree rather than separate
`content-scripts/`, `popup/`, and `background/` directories.

- `src/background.ts` — authentication-isolated network access, artifacts, and
  runtime messages.
- `src/content-job-portal.ts` — job-page widget, job capture, prefill launch,
  review UI, and Guided Autopilot orchestration.
- `src/easy-apply-engine.ts` — empty-field/file-safe filling engine.
- `src/guided-autopilot.ts` — allowlisted Next/Continue/Done navigation and
  final-action rejection.
- `src/ats-prefill-adapters.ts` — generic, Workday, and Greenhouse adapters.
- `src/*artifact*`, `src/*snapshot*`, `src/*cover-letter*`,
  `src/*screening*` — job-scoped resume, cover-letter, and question flows.
- `src/home.ts` — extension home/popup UI.
- `tests/` — Node/DOM fixtures and policy invariants.
- `manifest.json` and `public/` — extension metadata and assets.

## Conventions

- TypeScript modules generally use kebab-case; React components use PascalCase
  exports.
- Web imports prefer the `@/` alias.
- Database changes go through timestamped migrations.
- New server logging must use sanitized/structured logging and must not include
  resume or answer content.
