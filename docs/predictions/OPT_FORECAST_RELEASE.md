# OPT forecast release verification — October 13, 2026

## Database and authorization

Applied `20261013133431_opt_forecast_observations` to the verified TrackMyOPT
project `deknauqkqqzwuvopqott` through its dashboard SQL editor. The single
transaction used a five-second lock timeout and a thirty-second statement timeout.
The ledger's stored SQL matches the local file (MD5
`21b89a3d2c086b850f21a9216db5138b`). No historical case backfill was performed.

Read-only verification confirmed all seven new tables have both RLS and FORCE
RLS, no anonymous/authenticated SELECT privileges, and all seven internal
functions deny browser execution and use an empty search path. Local PostgreSQL
regressions exercise actual writes, metadata corrections, as-of reads, ownership
isolation, shared-receipt identity, leases, and deletion invalidation.

The private policy records the owner-provided screenshot and October 13 explicit
attestation that actual tracked cases are independently authorized with consent
and retention controls satisfied. `uscis_training_authorized=true`;
`promoted_model=NULL`. The underlying message/agreement was not independently
authenticated; the owner will supply the detailed consent/policy reference.
See the [audit](OPT_FORECAST_AUDIT.md). No screenshot, email or applicant record
is committed.

The refreshed dashboard security/performance advisors reported zero errors.
The two security warnings concern existing uninstall feedback RLS and leaked
password protection; no visible performance warning referenced the new tables.
These existing findings are outside this change.

Database size at verification was 426,880,147 bytes. The dashboard reports a
500 MB Free database allowance. Daily evidence adds storage; review measured
growth after the first full import/sync and before this allowance is exhausted.
No subscription change or automatic deletion of evidence is authorized by this
release. Render's separate workspace plan does not change Supabase capacity.

## Local validation

- Web suite: 326 files / 2,176 tests passed; final focused suite: 41 passed.
- TypeScript passed; full lint: zero errors, existing warnings remain.
- Production Next.js build passed with synthetic build-time environment values.
- Disposable PostgreSQL regression suite passed; 107 migration files validated.
- React Doctor: 91/100, no errors. Two warnings concern deliberately sequential,
  bounded database batches; membership must precede model publication.

The earlier parallel local build/test attempt was interrupted under heavy local
load. The recorded passing results are from completed reruns. Synthetic math and
permission tests establish implementation behavior, not real-world accuracy.

## Deployment verification

GitHub checks, merge SHA and deployment verification are recorded in the pull
request and delivery response. A merge to main releases both web and API.
Customer-facing survival estimates stay off until the separate out-of-sample
review described in [the engine guide](OPT_FORECAST_ENGINE.md). The existing
community estimator continues throughout evidence collection.

## Post-release production check — October 13, 2026 (18:57 UTC)

Aggregate, receipt-free reads of `deknauqkqqzwuvopqott`:

- The release merged at 16:37 UTC, after that day's 14:00 USCIS batch and the
  15:30 import, which therefore ran on the previous code. The first daily batch
  and import on this code run on October 14.
- One successful USCIS observation was recorded (a manual check at 17:39 UTC).
- The 18:15 UTC refresh completed `ready` for `opt-aj-v1` with four cohort
  curves, an empty backtest, `promotionEligible: false`, and one
  `limited_data` forecast. `completed_at` holds the run's data cutoff, which is
  why it precedes `created_at`.
- No community snapshots yet. The import upserts about 3,640 rows per day,
  and none had changed upstream in two days. Since the original trigger
  snapshotted every upsert, forward migration `20261013185730` now records one
  baseline per row and then only real changes. This avoids about 2 MB/day of
  duplicates.
- Policy: `uscis_training_authorized=true`, `promoted_model=NULL`. Database
  size: 427,060,371 bytes. Daily USCIS observations (about 1,850 rows at about
  0.5 KB each) remain the expected growth; measure it after several full days.
- No unresolved Sentry issues in the preceding 24 hours.
