# TrackMyOPT

A SaaS platform that helps F-1 students manage their OPT, STEM OPT, and US immigration journey — compliance clocks, USCIS case status, document vault, AI resume generator, H-1B sponsor research, and a companion Chrome extension.

---

## Tech stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Database / Auth**: Supabase (Postgres + RLS + Auth)
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand
- **AI**: Google Gemini, AWS Textract (OCR)
- **Payments**: Stripe
- **Email**: SMTP (Resend) + custom queue
- **Analytics**: PostHog
- **Hosting**: Vercel (web), Render (Nest API)
- **Background jobs**: Vercel Cron (case status batch only) + cron-job.org (everything else)

---

## Repository layout

```
.
├── apps/
│   ├── web/                Next.js App Router (the SaaS frontend + APIs)
│   ├── extension/          Chrome extension (job tracker, case status checker)
│   └── api/                NestJS backend on Render (USCIS batch scrape)
├── docs/                   Architecture, ops, compliance, PostHog playbooks
├── supabase/               Top-level migrations + RLS policies (source of truth)
├── scripts/                Repo-wide tooling (IndexNow submitter, etc.)
└── apps/web/vercel.json    Vercel case-status cron only (all other crons → cron-job.org)
```

For architecture details, see [`docs/architecture/ARCHITECTURE.md`](./docs/architecture/ARCHITECTURE.md).

---

## Quick start

```bash
# 1. Install
pnpm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — at minimum: Supabase URL + keys + JWT_SIGNING_SECRET.

# 3. Run dev server (Next + extension dev script in parallel)
pnpm dev
```

The web app boots at `http://localhost:3000`.

---

## Scripts (monorepo root)

| Script | What it does |
|---|---|
| `pnpm dev` | Run all packages in dev mode (parallel) |
| `pnpm build` | Production build of `apps/web` |
| `pnpm lint` | ESLint for `apps/api` (Nest) + `apps/web` |
| `pnpm lint:fix` | ESLint autofix on `apps/web` |
| `pnpm typecheck` | `tsc --noEmit` for `apps/web` + `apps/extension` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright e2e tests |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check (CI-friendly, no writes) |

Each script can also be called inside `apps/web` directly (e.g., `pnpm -C apps/web test`).

---

## Environment variables

Every variable used in the codebase is documented in [`./.env.example`](./.env.example).
Validation lives in [`apps/web/lib/env.ts`](./apps/web/lib/env.ts) using zod schemas.

**Required to boot any environment:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `JWT_SIGNING_SECRET` (≥ 32 chars)

**Required to enable specific features** — missing values fail closed at the route level with a friendly error, NOT at boot:
- Billing: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- USCIS case status: `USCIS_CLIENT_ID`, `USCIS_CLIENT_SECRET` (live by default; `USCIS_MOCK=true` ignored in prod)
- Document Vault + OCR: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`
- AI resume generator: `GEMINI_API_KEY`
- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- Cron protection: `CRON_SECRET` (cron-job.org auth header; also used by Vercel case-status cron)
- Admin bulk notifications API: `ADMIN_SECRET` (server only; never `NEXT_PUBLIC_*`)

> **Note** — `lib/env.ts` validates these lazily so partial preview deployments still boot.

---

## Architecture decisions

| Decision | File / location |
|---|---|
| Phase-aware OPT/STEM unemployment math (90 + cumulative 150) | [`apps/web/lib/immigration/opt-calculations.ts`](./apps/web/lib/immigration/opt-calculations.ts) + tests |
| Stripe self-heal (premium status reconciles with Stripe even after DB drift) | [`apps/web/app/api/premium/status/route.ts`](./apps/web/app/api/premium/status/route.ts) |
| Webhook idempotency + 5xx-on-error so Stripe retries | [`apps/web/app/api/premium/webhook/route.ts`](./apps/web/app/api/premium/webhook/route.ts) |
| USCIS mock cannot run in production | [`apps/web/app/api/case-status/check/route.ts`](./apps/web/app/api/case-status/check/route.ts) |
| Standard API response envelope | [`apps/web/lib/api/response.ts`](./apps/web/lib/api/response.ts) |
| Premium shared via React context (no duplicate fetches) | [`apps/web/lib/premium/usePremiumStatus.tsx`](./apps/web/lib/premium/usePremiumStatus.tsx) |
| Document Vault forgot-passcode self-service | [`apps/web/app/api/documents/passcode/forgot/`](./apps/web/app/api/documents/passcode/forgot/) |
| OCR job state durable in Supabase (not in-memory) | [`apps/web/app/api/resume-generator/ocr/`](./apps/web/app/api/resume-generator/ocr/) |

---

## Testing

```bash
pnpm test               # vitest unit tests
pnpm test:watch         # watch mode
pnpm test:coverage      # coverage report
pnpm test:e2e           # Playwright (requires browsers installed)
```

Critical tests live in [`apps/web/lib/immigration/__tests__/opt-calculations.test.ts`](./apps/web/lib/immigration/__tests__/opt-calculations.test.ts) and cover the entire OPT/STEM compliance model. **Do not change `calculateUnemploymentDays` without rerunning these.**

---

## Deployment

### Web app — Vercel (project: `trackmy-opt-web`)

Pushing to `main` triggers a production deploy. No manual step needed.

```bash
# To force a redeploy without code changes:
vercel --prod
```

### Database — Supabase (project: `deknauqkqqzwuvopqott`)

Migrations live in `supabase/migrations/`. Apply via the Supabase CLI or MCP.

### Cron jobs

| Job | Trigger | Schedule |
|---|---|---|
| USCIS case status batch | **Vercel Cron only** | `0 14 * * *` (daily 14:00 UTC / 9 AM ET) |
| Daily reminders | cron-job.org | 9 AM ET |
| Document expiry reminders | cron-job.org | daily |
| STEM OPT window alert | cron-job.org | daily |
| D1 activation nudge | cron-job.org | hourly |
| At-risk reengagement | cron-job.org | weekly |
| PostHog LTV / partner sync | cron-job.org | daily / weekly |
| Retry pending emails | cron-job.org | every 30 min |

All cron-triggered routes require `Authorization: Bearer ${CRON_SECRET}`. Full setup: [`docs/ops/CRON_SETUP.md`](./docs/ops/CRON_SETUP.md).

---

## Production-readiness checklist (run before every release)

```bash
pnpm lint        # 0 errors expected; warnings OK
pnpm typecheck   # must pass
pnpm test        # must pass
pnpm build       # must succeed
```

CI on GitHub runs the same four. If anything is red, do not promote.

---

## Contributing

1. Branch from `main`.
2. Run `pnpm typecheck` + `pnpm test` before pushing.
3. PRs that touch `lib/immigration/`, `app/api/premium/`, or `app/api/case-status/` require attorney-style review for compliance correctness — see `docs/COMPLIANCE.md` if it exists, or open a discussion.
4. Never commit secrets. Use `.env.local` (gitignored).

---

## License

Proprietary. © Zyene, Inc.
