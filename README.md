<div align="center">

# TrackMyOPT

### Your OPT journey. Your career. One workspace.

OPT and STEM OPT timelines, job applications, tailored resumes, and important documents—connected across the web and Chrome.

[Visit TrackMyOPT](https://www.trackmyopt.com) · [Documentation](./docs/README.md) · [Local setup](#local-development) · [Chrome extension](#chrome-extension)

</div>

---

## Built for the journey from student to professional

TrackMyOPT helps F-1 students organize their employment timeline and career search without switching between disconnected tools.

| Workspace                   | What it helps you do                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| **OPT & STEM OPT**          | Track dates, filing windows, employment history, and unemployment-day estimates.            |
| **Job search & tracker**    | Research employers, save roles, and organize applications.                                  |
| **AI resume tools**         | Create job-specific resumes and review role fit and keyword gaps.                           |
| **Chrome companion**        | Capture jobs, prefill supported application fields, and use job-specific generated resumes. |
| **Case status & reminders** | Check USCIS case status and receive configured timeline and document reminders.             |
| **Document vault**          | Store and manage important documents with controlled access.                                |

> TrackMyOPT is an organizational tool, not legal advice. Confirm immigration dates, eligibility, and employment records with your DSO or a qualified immigration attorney. Review generated resumes and prefilled answers before submitting applications. Portal compatibility varies; see the [extension guide](./apps/extension/README.md).

## Inside the repository

```text
TrackMyOPT/
├── apps/
│   ├── web/          Next.js dashboard, public website, and web APIs
│   ├── extension/    Chrome extension and application-prefill tools
│   └── api/          NestJS backend and processing services
├── supabase/
│   └── migrations/   Canonical database migration history
├── scripts/          Operations, ingestion, and repository tooling
└── docs/             Architecture, operations, and compliance references
```

### Technology & services

| Layer                             | Technology                                                                                   |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| Web experience                    | Next.js, React, TypeScript, Tailwind CSS, Radix UI                                           |
| Browser extension                 | Chrome Manifest V3, TypeScript, esbuild                                                      |
| Backend                           | NestJS and background processing                                                             |
| Application data & authentication | Supabase PostgreSQL, Auth, and row-level security                                            |
| Job-data infrastructure           | Oracle integration; see the [cutover runbook](./docs/architecture/oracle-cutover-runbook.md) |
| AI & documents                    | Gemini through Vertex AI, AWS S3/Textract, private LaTeX compiler                            |
| Billing & email                   | Stripe and SMTP-based email delivery                                                         |
| Cache & queues                    | Upstash Redis for web features; Redis/Bull for backend queues                                |
| Analytics & hosting               | PostHog, Vercel for web, Render for backend                                                  |

Versions are defined in each application's `package.json`. This is a codebase overview, not confirmation that every external service is currently configured or healthy.

## Local development

### 1. Install dependencies

Use Node.js compatible with the repository's `>=20.9.0` requirement and **pnpm 10.18.2**, pinned in the root package manifest.

```bash
git clone https://github.com/dikondaashish/TrackmyOPT.git
cd TrackmyOPT
pnpm install --frozen-lockfile
```

### 2. Configure the web app

Copy the [environment template](./.env.example) into `apps/web/.env.local` if that file does not already exist. Do not overwrite an existing configuration.

For a new checkout:

```bash
cp -n .env.example apps/web/.env.local
```

Replace placeholders with development credentials. Start with:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server only
- `JWT_SIGNING_SECRET` — a random secret of at least 32 characters
- `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_APP_URL` — `http://localhost:3000`

Use a development Supabase project with the required migrations. Feature-specific integrations need their own credentials; copying the template alone does not enable them. Remove or comment out unused optional settings instead of leaving invalid placeholders or empty values—some optional fields still validate their format when present.

### 3. Start the web app

```bash
pnpm --filter web dev
```

Open [localhost:3000](http://localhost:3000). Run the backend separately when working on backend-dependent features:

```bash
pnpm --filter api start:dev
```

Configure the backend in `apps/api/.env` before starting it. Its [startup validation](./apps/api/src/app.module.ts) requires an API secret, Supabase service credentials, AWS settings, and USCIS credentials. It also needs a reachable Redis instance. Give it a different port from the web app and set the web app's `NEXT_PUBLIC_API_URL` accordingly. Do not use the Upstash HTTP REST endpoint as a backend Redis connection URL.

### Chrome extension

For extension development against your local web app:

```bash
pnpm --filter extension dev:local
```

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select `apps/extension/dist`.
3. Configure the development extension ID and authentication/CORS settings using the [extension guide](./apps/extension/README.md) and [CORS policy](./docs/ops/CORS_POLICY.md).
4. Reload the extension after a rebuild and refresh the application tab when testing content-script changes.

**Important:** Default extension `dev` and `build` commands target the live website. Use `dev:local` when testing locally. Root `pnpm dev` starts packages with a `dev` script; it does not start the NestJS backend.

## Configuration by feature

See [`.env.example`](./.env.example) for configuration groups and [`apps/web/lib/env.ts`](./apps/web/lib/env.ts) for validation. Keep server credentials out of `NEXT_PUBLIC_*` variables, browser bundles, screenshots, and commits.

| Feature                     | Configuration to review                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Resume AI                   | Vertex AI project, location, and server credentials. `GEMINI_API_KEY` is an intentional local fallback when Vertex is disabled. |
| Documents & resume PDFs     | AWS credentials, S3 bucket, malware-scanner URL/token, and private LaTeX compiler URL/token.                                    |
| Billing                     | Stripe keys, webhook secret, and price IDs. Use test-mode credentials locally.                                                  |
| Email                       | SMTP host, port, username, `SMTP_PASS`, and a verified sender address.                                                          |
| Case status                 | USCIS API credentials; production must not rely on mock responses.                                                              |
| Web cache & rate limits     | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, or supported Vercel `KV_REST_API_*` equivalents.                         |
| Private application answers | Server-side `PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY`.                                                                       |
| Scheduled work              | `CRON_SECRET`, service-specific credentials, and required feature flags.                                                        |

Never carry development-only security bypasses such as `DOCUMENT_SCAN_MODE=disabled` into production.

## Development checks

Run commands from the repository root:

| Command                                   | Scope                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `pnpm lint`                               | Workspace lint scripts                                                     |
| `pnpm typecheck`                          | Web, API, and extension type checks                                        |
| `pnpm test`                               | Web unit tests                                                             |
| `pnpm build`                              | Web production build                                                       |
| `pnpm --filter extension test`            | Extension unit tests                                                       |
| `pnpm --filter extension build`           | Extension bundle                                                           |
| `pnpm --filter api exec jest --runInBand` | Backend unit tests                                                         |
| `pnpm test:e2e`                           | Web Playwright tests; requires browser installation and test configuration |
| `pnpm --filter web test:watch`            | Web unit tests in watch mode                                               |
| `pnpm --filter web test:coverage`         | Web coverage report                                                        |

The [CI workflow](./.github/workflows/test.yml) defines release checks, including additional backend and ingestion tests. A passing web build alone does not verify extension behavior or external integrations.

For date-logic changes, run the [immigration tests](./apps/web/lib/immigration/__tests__/) and review boundary cases. For prefill changes, also test real application forms without submitting them.

## Deployment & operations

- **Web:** Vercel configuration lives in [`apps/web/vercel.json`](./apps/web/vercel.json). Verify the connected production branch, environment variables, and deployment result in Vercel.
- **Backend:** [`render.yaml`](./render.yaml) describes backend and queue infrastructure. Check actual service settings and health after deployment.
- **Database:** [`supabase/migrations`](./supabase/migrations/) is the source of truth. Review and apply pending migrations to the intended project; do not initialize from legacy schema snapshots or reset a production database.
- **Scheduled jobs:** Check committed Vercel cron configuration and the [cron runbook](./docs/ops/CRON_SETUP.md) before registering external schedules. Avoid duplicate scheduling; Vercel cron expressions use UTC.
- **Releases:** Confirm CI, migrations, service health, and relevant user flows before calling a deployment complete. Chrome extension releases have a separate checklist in the [extension guide](./apps/extension/README.md).

## Documentation map

| Need                           | Start here                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| System architecture            | [Architectural overview](./docs/architecture/ARCHITECTURAL_OVERVIEW.md)                   |
| Codebase navigation            | [Directory deep dive](./docs/architecture/DIRECTORY_DEEP_DIVE.md)                         |
| Database structure             | [Database inventory](./docs/architecture/DATABASE_INVENTORY.md)                           |
| OPT calculation implementation | [Immigration module](./apps/web/lib/immigration/README.md)                                |
| Email delivery & schedules     | [Email templates](./docs/ops/EMAIL_TEMPLATES.md) · [Cron setup](./docs/ops/CRON_SETUP.md) |
| Compliance review              | [Legal & billing QA](./docs/compliance/LEGAL_BILLING_COMPLIANCE_QA.md)                    |
| Remaining work                 | [Pending implementation plan](./docs/pending-implementation-plan.md)                      |
| All documentation              | [Documentation index](./docs/README.md)                                                   |

## Contributing

1. Create a focused branch from the latest `main`.
2. Keep changes scoped and add tests for changed behavior.
3. Run the relevant checks above and open a pull request.
4. Give immigration calculations, authentication, billing, and sensitive-data handling extra review.
5. Update documentation when configuration or behavior changes. Never commit secrets or real applicant data.

## License

Proprietary. © Zyene, Inc. This repository is not offered under an open-source license.
