<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## API error monitoring

Export API route handlers through `withSentryApiErrors` from
`@/lib/sentry/api-errors`, with the static route pattern and HTTP method.
This reports handled HTTP 5xx responses while preserving bodies and streams.
Keep applicant data out of diagnostic messages. Use `console.error` or
`Sentry.captureException` for unexpected failures handled inside HTTP 200
responses or background tasks.
