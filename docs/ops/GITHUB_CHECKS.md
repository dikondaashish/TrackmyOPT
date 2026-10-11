# GitHub checks

The repository uses two kinds of checks:

- **Repository jobs:** GitHub Actions runs `Lint · Typecheck · Test · Build` and
  `Playwright E2E` for pull requests to `main`, pushes to `main`, manual runs,
  and the nightly schedule. The Playwright job starts the web app itself and
  uploads its report when a test fails.
- **GitHub App checks:** CodeRabbit and Vercel Preview Comments run for pull
  requests. They do not create review/comment checks for a direct push to
  `main`; open a pull request when those checks are required before merging.

## Required external configuration

The CodeRabbit, GitGuardian, and Vercel apps are installed for this repository.
Their checks are created by their services after GitHub delivers the event, so
they cannot be enabled or required in workflow YAML.

1. In GitGuardian, keep this repository in the monitored perimeter and enable
   real-time pull-request checks. GitGuardian's GitHub App handles the scan and
   status; do not commit an API key to this repository.
2. In CodeRabbit, keep automatic review and review status enabled. The
   `.coderabbit.yaml` file records the repository-level behavior.
3. In Vercel project settings, keep Git integration and Comments enabled for
   preview deployments. Resolve all Vercel comments before merging.
4. In GitHub's branch-protection or ruleset settings for `main`, require the
   completed checks by their exact names after each provider has reported one:
   `Lint · Typecheck · Test · Build (20.x)`, `Playwright E2E`, CodeRabbit's
   review status, GitGuardian's security status, and `Vercel Preview Comments`.

## Current branch protection on `main` (verified 2026-10-11)

- Required status check: `Lint · Typecheck · Test · Build (20.x)` only. Playwright
  E2E, CodeRabbit, GitGuardian, and Vercel Preview Comments report on pull
  requests but are not required; item 4 above is the target, not the current state.
- `enforce_admins` is **on**: administrators cannot push to `main` without the
  required check passing, so changes go through a pull request. Force pushes and
  branch deletion are disallowed. "Require branches to be up to date" and required
  reviews are off.
- Every merge to `main` deploys automatically (Vercel to production, and the
  Render `TrackmyOPT` API service).

Do not use a direct push to bypass pull-request-only review checks. A provider
that reports no check on a pull request should be fixed in that provider's
dashboard, not replaced with a successful placeholder workflow.
