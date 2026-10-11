# TrackMyOPT project instructions

## Standing delivery preference

Recorded at the owner's request on 2026-09-23 and updated 2026-10-11.

For this repository (`dikondaashish/TrackmyOPT`), completing requested code,
configuration, or documentation changes includes committing them and delivering
them to GitHub `main`. The owner has authorized this as the default workflow; do
not ask them to repeat "push to GitHub main" after every task.

Since 2026-10-11 `main` enforces its required CI check for administrators too
(branch protection `enforce_admins`), so a direct push to `main` is rejected
unless that commit already passed CI. Changes therefore reach `main` through a
pull request (see below). This preference applies to requested changes, not
read-only questions, audits, or planning. A newer explicit instruction such as
"do not push", "local only", or a different target branch takes precedence.
Higher-priority instructions and repository protections still apply.

Heads-up: every merge to `main` deploys automatically. Vercel publishes the web
app to production (`www.trackmyopt.com`) and Render redeploys the `TrackmyOPT`
API service (`autoDeploy` on commit). Treat a merge as a production release, and
never describe a merge as "not deployed".

## Standing error-monitoring requirement

Recorded at the owner's request on 2026-10-10.

Unexpected failures anywhere in the TrackMyOPT portal must be reported to
`zyene-inc / trackmyopt` in Sentry, with working notifications for new issues
and regressions. Treat error monitoring as part of implementing and maintaining
every feature, including browser UI, server/edge code, API handlers, payments,
documents, resume tools, case tracking, email delivery, cron jobs, and background
work. Report caught or partial failures explicitly even when a request returns
HTTP 200; do not silently swallow unexpected errors.

Keep expected validation, authentication, not-found, and rate-limit outcomes
separate from unexpected failures. Preserve the diagnostic privacy filters;
never send applicant data, credentials, documents, or AI inputs/outputs in error
reports. Keep TrackMyOPT and Zyene Reviews projects and credentials separate.

Keep the Sentry organization on the owner's free Developer plan. Do not start
paid trials, upgrade the subscription, configure pay-as-you-go spending, or
enable additional paid monitors without an explicit owner request. Keep error
sampling at 100% for unexpected failures; Replay, tracing, Sentry logs, and
metrics remain disabled. Respect the organization's quota and preserve Zyene
Reviews' existing uptime monitor when the single free uptime slot is occupied.

For new or changed flows, verify their error-reporting paths and consult
`docs/ops/SENTRY.md`. State remaining runtime, outage-monitoring, quota, or
delivery gaps accurately; never claim that every possible failure is guaranteed
to be captured. Monitoring and notifications must remain a standing requirement
for future work.

## Required delivery workflow

1. Inspect the working tree and the configured remote. Preserve unrelated and
   pre-existing changes. Never stage the entire working tree indiscriminately.
2. Implement only the requested work and run checks appropriate to its scope.
   For documentation-only changes, validate links, commands, and formatting;
   for code changes, run the relevant tests, lint, type checks, and builds.
3. Create a branch from the latest `origin/main`, commit the task's changes with
   a descriptive message, and push the branch. Fetch first and integrate any
   divergence safely without discarding work. Verify that the outgoing commits
   contain only the intended changes; do not publish unrelated local commits.
4. Open a pull request to `main`. Wait for the required check
   "Lint · Typecheck · Test · Build (20.x)" to pass (Playwright E2E should also
   pass), then merge it (squash is the default). Do not merge over a failing
   required check. If a check fails, investigate and fix it, or report the blocker.
5. Verify the merge commit is on GitHub `main`, and check the Vercel and Render
   deployments for that commit. Report the commit and validation results
   briefly, and distinguish a merged PR from completed CI or a healthy
   deployment; do not claim unverified outcomes.

## Safety boundaries

- Never commit credentials, private environment files, or real applicant data.
- Do not force-push, reset away changes, disable or loosen branch protections
  (including `enforce_admins`), or use an explicit administrative bypass to
  publish. If required checks or a pull-request rule prevent delivery, follow the
  permitted workflow or report the blocker.
- If relevant validation fails, fix it within scope before pushing. If a
  conflict, unrelated failing check, missing access, or ambiguous change cannot
  be resolved safely, explain the specific blocker instead of claiming success.
- This preference does not authorize unrelated releases, database migrations,
  billing changes, destructive actions, or Chrome Web Store submissions.
- Follow applicable nested instruction files, including `apps/web/AGENTS.md`,
  when working in their directories.
