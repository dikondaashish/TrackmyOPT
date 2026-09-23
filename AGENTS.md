# TrackMyOPT project instructions

## Standing delivery preference

Recorded at the owner's request on 2026-09-23.

For this repository (`dikondaashish/TrackmyOPT`), completing requested code,
configuration, or documentation changes includes committing and pushing those
changes to GitHub `main`. The owner has authorized this as the default workflow;
do not ask them to repeat "push to GitHub main" after every task.

This preference applies to requested changes, not read-only questions, audits,
or planning. A newer explicit instruction such as "do not push", "local only",
or a different target branch takes precedence. Higher-priority instructions and
repository protections still apply.

## Required delivery workflow

1. Inspect the working tree and the configured remote. Preserve unrelated and
   pre-existing changes. Never stage the entire working tree indiscriminately.
2. Implement only the requested work and run checks appropriate to its scope.
   For documentation-only changes, validate links, commands, and formatting;
   for code changes, run the relevant tests, lint, type checks, and builds.
3. Fetch the latest `origin/main` before publishing. Inspect divergence and
   integrate safely without discarding work. Verify that the outgoing commits
   contain only the intended changes; do not publish unrelated local commits.
4. Commit the task's changes with a descriptive message and push to
   `origin/main` using a normal, non-force push. No additional push confirmation
   is needed when these checks pass. Avoid recreating obsolete remote branches.
5. Verify that the intended commit is present on GitHub `main`. Report the
   commit and validation results briefly. Distinguish a successful push from
   completed CI or a healthy deployment; do not claim unverified outcomes.

## Safety boundaries

- Never commit credentials, private environment files, or real applicant data.
- Do not force-push, reset away changes, disable protections, or use an explicit
  administrative bypass to publish. If required checks or a pull-request rule
  prevent delivery, follow the permitted workflow or report the blocker.
- If relevant validation fails, fix it within scope before pushing. If a
  conflict, unrelated failing check, missing access, or ambiguous change cannot
  be resolved safely, explain the specific blocker instead of claiming success.
- This preference does not authorize unrelated releases, database migrations,
  billing changes, destructive actions, or Chrome Web Store submissions.
- Follow applicable nested instruction files, including `apps/web/AGENTS.md`,
  when working in their directories.
