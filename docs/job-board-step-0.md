# Job board — Step 0 checklist

- [x] Source catalog — added `ats_sources`, one row per employer board, default-disabled and limited per board.
- [x] Normalized discovery schema — added `jobs` and the per-board `(source_ats, board_token, external_job_id)` uniqueness constraint; the manual `job_applications` flow is untouched.
- [x] Audit and rate controls — added audit records plus atomic per-source reservation and completion functions; no scraper or worker was added.
- [x] RLS boundary — enabled RLS on all three new tables and exposed no browser write policy; the future Nest worker is the only intended writer.
- [x] Platform legal review — documented all requested ATS types and marked every source default-disabled pending source-specific authorization.
- [x] Step 0 exit test — isolated Postgres proof recorded `skipped_disabled`, two distinct Greenhouse boards, a one-row-per-board dedupe result, a duplicate audit count, and a per-board rate-limit rejection; no external ATS request was made.
- [ ] Step 1 — not started.
