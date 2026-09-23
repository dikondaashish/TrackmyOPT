# TrackMyOPT API

NestJS backend for document processing, resume storage, USCIS background jobs,
and authorized job-board ingestion. Start with the repository's
[setup instructions](../../README.md#local-development).

## Structure

- `src/main.ts`: HTTP bootstrap, validation, CORS, and shutdown handling.
- `src/app.module.ts`: module registration and environment validation.
- `src/common/`: shared API-key guard and route decorators.
- `src/document-security/`: malware scanning and LaTeX compilation endpoints.
- `src/ocr/`: document extraction and resume parsing.
- `src/resume/`: user-owned resume storage and downloads.
- `src/uscis/`: case-status client and Bull workers.
- `src/job-board/`: ATS adapters, ingestion, employer matching, and data stores.
- `test/`: test environment and HTTP integration tests. Unit tests live beside
  their implementations as `*.spec.ts`.

## Commands

Run from the repository root after `pnpm install --frozen-lockfile`:

```bash
pnpm --filter api start:dev
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api exec jest --runInBand
pnpm --filter api exec jest --config ./test/jest-e2e.json --runInBand
pnpm --filter api build
pnpm --filter api start:prod
```

`typecheck` includes tests; `build` uses `tsconfig.build.json` and excludes them.
The root `pnpm typecheck` also checks this package.

Runtime configuration is defined by `appConfigValidationSchema` in
[`src/app.module.ts`](src/app.module.ts). Normal startup requires the configured
Redis, Supabase, AWS, and USCIS services. The test environment uses fixtures and
omits background-worker registration. HTTP listens on `PORT` (default `3000`);
choose distinct ports when running the web app alongside it.

Python ATS dependencies are pinned in
[`requirements.job-board.txt`](requirements.job-board.txt). The repository's
[CI workflow](../../.github/workflows/test.yml) runs their raw-payload fixtures
alongside the JavaScript checks. Deployment configuration lives in
[`render.yaml`](../../render.yaml) and [`Dockerfile`](Dockerfile).
