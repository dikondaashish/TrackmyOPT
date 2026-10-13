# Saved job resumes

## Behavior

- The existing authenticated `/api/extension/resume-artifact` endpoint stores the generated PDF, extracted autofill snapshot, job URL and ATS identity together. No public resume link is created.
- The side panel checks for a saved resume on open, refresh and tab switch. The ready card offers Preview, Download and explicit Prefill. Viewing/restoring a resume does not itself fill an application or generate another resume.
- Listing/application URL matching uses the shared ATS identity rules, not company/title guesses. Unknown cross-domain handoffs are not merged automatically.
- Active artifacts are cached in `chrome.storage.session`, with account ownership and save status. Account storage enables later browser sessions/devices; this is not a persistent offline multi-job library.
- Original creation time is separate from the renewed 30-minute Prefill lease. Older servers without original-date metadata omit the date rather than displaying a false creation time.
- Successful replacement is inserted before the prior saved copy is retired. Failed generation keeps the previous active resume. Failed account save keeps the new PDF available in the session, shows a warning, and offers Retry save without another AI generation.
- A changed valid job description or selected/updated saved base resume produces an advisory. It never spends credits or regenerates automatically. Pasted-text changes are not fingerprinted across sessions.
- Existing retention remains **30 days / 50 recent jobs per account**, exposed under Storage details. This is not indefinite storage or full version history.

## Verification and release

- Extension tests cover stored restore, listing/application matching, different-job rejection, quiet restore, worker restart, saved date, storage failures, safe regeneration, pasted sources, save retries and account isolation.
- API tests check owner-scoped reads, original timestamps, private/no-store responses, unauthenticated access and failed replacement inserts.
- From `apps/extension`, `node scripts/preview-resume-panel.mjs` previews the real UI with synthetic data; `?error` exercises lookup failure. Its Prefill and generation are simulations and send no application data.
- Deploy the web route changes and rebuild/reload the extension for production verification. The schema defined by `20260802120000_create_generated_resume_artifacts.sql` was verified on the main TrackmyOPT project through Supabase MCP on 2026-09-22, including indexes, trigger, constraints and server-only access. Its filename has no matching remote history entry; do not confuse that bookkeeping drift with a missing table. No new saved-resume schema migration was needed. See `docs/SUPABASE_RECONCILIATION_2026-09-22.md`.
- Production authenticated storage, cross-device restoration and portal Prefill still need a release smoke test. Local mock/browser verification is not a production deployment.
