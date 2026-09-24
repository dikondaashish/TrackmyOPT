# Case-status delivery and operational verification

Updated September 23, 2026. Implementation status is distinct from deployment health.

## Implemented

- All four detailed comparisons remain visible together, in two desktop columns.
- Monitoring distinguishes recent, delayed, failed, disabled and unconfirmed checks. Backend failures record a safe reason, and successful checks clear it. The existing paginated queue covers more than the database's default 1,000-row response.
- Comparisons show partner source counts, import freshness, filing range, stale exclusions, sample size and possible cross-source overlap. Reports are not claimed to be unique people. Missing approvals are not classified as waiting cases.
- Explicit premium-upgrade-to-approval statistics are separate from total filing time and the USCIS action clock. Small samples do not expose percentile estimates.
- Approved/card-produced/delivered cases get next-stage guidance instead of a pending approval prediction. Denials/withdrawals likewise suppress that prediction.
- Saved OPT dates and employment records inform STEM filing windows and DSO tasks. Calendar dates avoid timezone and daylight-saving shifts. Validation reports cover 6/12/18/24 months; actual EAD and DSO instructions remain authoritative.
- Case notices support private vault references, confirmed deadlines, edits, completion, all-day calendar exports and opt-in Pro email reminders. Server-side ownership checks supplement forced row-level security. No document content is emailed.
- Reminder workers atomically claim unchanged tasks, honor completion and opt-out, and avoid blindly retrying ambiguous SMTP outcomes. Up to 20 reminders are processed hourly, oldest deadlines first. Missed/uncertain deliveries are marked failed, not successful.
- Case-change emails explain the update and next action. Delivery history distinguishes provider acceptance from confirmed inbox delivery.
- Per-case queue records expose scheduled starts, last attempts and public-safe failure reasons. Daily jobs use deterministic IDs, retain deduplication history and recheck entitlement before execution. An outage is recorded as a failure, not a successful skipped check.
- Optional actual STEM EAD expiration is saved and used consistently for expiry, employment totals and final-evaluation tasks. Existing date fields remain available.
- Confirmed DSO tasks can be saved to the notice organizer, given an opt-in reminder, and marked complete from either view. A changed source date requires a new confirmation.
- Weekly case digests are opt-in, respect global email preferences and active paid entitlement, and record provider acceptance separately from failures. An hourly worker claims at most 20 recipients, with one delivery attempt per UTC week and no blind retry of uncertain SMTP outcomes.
- Case workers record actual executions and numeric outcomes in a private audit table. Protected dry-run endpoints bypass writes, queueing and SMTP.
- Official USCIS data is shown separately from community reports: a manually verified I-765 student-category SCOPS snapshot, 80% completed within 5 months, checked September 23, 2026. No publication date was supplied by USCIS. A weekly freshness check flags review after 21 days; the UI hides the number after 30 days. See [source maintenance](OFFICIAL_PROCESSING_DATA.md).

## Verified during implementation

- Additive migration `20260924010000_case_notices` applied to the main Supabase project; table, forced RLS and migration ledger verified. Existing applicant records were not altered.
- One clearly labeled synthetic case-change email sent to the owner's approved test address; the owner confirmed receipt. This does not certify delivery to every recipient or the scheduled reminder worker.
- Both the configured Render origin and custom API hostname returned HTTP 200 after cold start. No API URL change was needed.
- Synthetic browser form tests verified add/edit/complete and narrow-screen rendering without creating real notices or sending real reminders.
- Additive migration `20260924010100_case_completion_delivery` applied and its ledger verified. Scheduling, worker audit, digest preferences and delivery tables have forced RLS and server-only grants. No existing user was opted into digests.
- Synthetic browser tests verified that saving and completing a journey task updates the notice organizer and journey together. This continuation used mocked/no-send email tests only, as requested by the owner.

## Remaining operational work / explicit limitations

- The official number is a browser-verified snapshot, not an automatic numeric feed. Direct server access returned HTTP 403. Future values require source verification; never substitute community figures or guess a publication date.
- A queued start is not a guaranteed execution time. New per-case schedule records appear when the deployed daily batch runs; stale or missing records must not be described as healthy scheduling.
- Verify both providers deployed the release before calling new dry-run endpoints. In particular, the older API ignores `dry_run` and can queue real checks; never probe that older endpoint as a no-send test.
- The hourly deadline job requires a deployed Vercel cron and the existing cron/SMTP/service-role configuration. Check the first scheduled run after release. With no saved opted-in notices, a successful run should send zero messages. Scale the bounded batch if backlog approaches deadline capacity.
- SMTP acceptance is not inbox delivery. Failed reminders require review; calendar exports and official notices remain the fallback. Existing case-change queue retry behavior is separate from the new deadline worker.
- Actual final STEM EAD expiration and completion of past DSO reports are not inferred. Users can now save those dates and tasks, but must confirm them from their documents.
- Check GitHub CI and both deployment providers for the release commit. A successful push is not proof that Render deployed it; earlier automatic Render deployments had been cancelled.

## Sources

- [DHS STEM reporting requirements](https://studyinthestates.dhs.gov/assets/sevpstemoptreportingrequirementsfinal.pdf)
- [DHS Form I-983 overview](https://studyinthestates.dhs.gov/form-i-983-overview)
- [USCIS processing-time methodology](https://egov.uscis.gov/processing-times/more-info)

## Checks

From the repository root:

```sh
pnpm --filter web test
pnpm --filter web typecheck
pnpm --filter web lint
pnpm --filter web build
pnpm --filter api test --runInBand
pnpm --filter api typecheck
pnpm --filter api lint
pnpm --filter api build
pnpm --filter web exec tsx scripts/check-official-processing-freshness.ts
```

From `apps/web`, `node scripts/preview-case-status.mjs` serves synthetic UI on port 4318. Optional `?approved`, `?pp`, `?free`, `?empty`, and `?dark` exercise display states. Use a real viewport override for responsive breakpoint checks; `?width=375` only constrains content width.
