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

## Verified during implementation

- Additive migration `20260924010000_case_notices` applied to the main Supabase project; table, forced RLS and migration ledger verified. Existing applicant records were not altered.
- One clearly labeled synthetic case-change email sent to the owner's approved test address; the owner confirmed receipt. This does not certify delivery to every recipient or the scheduled reminder worker.
- Both the configured Render origin and custom API hostname returned HTTP 200 after cold start. No API URL change was needed.
- Synthetic browser form tests verified add/edit/complete and narrow-screen rendering without creating real notices or sending real reminders.

## Remaining operational work / explicit limitations

- A verified, maintained official USCIS processing-time numeric source is not connected. Automated access returned HTTP 403. The comparison shows an unavailable state and official links; `OFFICIAL_PROCESSING_SNAPSHOTS` intentionally remains empty. Never fill it with community numbers or guessed figures. Any future snapshot must have an office/category, source, publication date and verification date, and expires after 30 days.
- The UI shows the configured daily batch time (14:00 UTC), not a claimed next per-case execution time. A per-case scheduler/queue ledger is still needed to display an actual next scheduled check.
- Event-based case-change messages are implemented; a separate scheduled digest is not.
- The hourly deadline job requires a deployed Vercel cron and the existing cron/SMTP/service-role configuration. Check the first scheduled run after release. With no saved opted-in notices, a successful run should send zero messages. Scale the bounded batch if backlog approaches deadline capacity.
- SMTP acceptance is not inbox delivery. Failed reminders require review; calendar exports and official notices remain the fallback. Existing case-change queue retry behavior is separate from the new deadline worker.
- Actual final STEM EAD expiration and completion of past DSO reports are not inferred. Users must confirm those dates and tasks from their documents.
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
pnpm --filter api build
```

From `apps/web`, `node scripts/preview-case-status.mjs` serves synthetic UI on port 4318. Optional `?approved`, `?pp`, `?free`, `?empty`, and `?dark` exercise display states. Use a real viewport override for responsive breakpoint checks; `?width=375` only constrains content width.
