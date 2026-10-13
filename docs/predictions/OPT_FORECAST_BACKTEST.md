# OPT forecast validation report — October 13, 2026

**Decision: retain the existing community estimator. Do not promote `opt-aj-v1`.**
No improvement in production prediction accuracy has been demonstrated yet.

The [live audit](OPT_FORECAST_AUDIT.md) found no immutable observation or forecast
tables. Historical provider events are present, but their individual first-known
times are not reliably reconstructible. Community records have been overwritten.
Using those current records to pretend it was August 1 would leak future
information. The 1,192 dated approval-history entries are not 1,192 eligible
prospective outcomes.

| Candidate | Eligible historical forecasts at Aug 1 / Sep 1 / Oct 1 | Median/mean absolute error | ±7/14/30 accuracy | 50%/80% calibration | Promotion |
| --- | --- | --- | --- | --- | --- |
| A — legacy completed-report percentiles | Not reconstructible | Unavailable | Unavailable | Unavailable | Existing fallback retained |
| B — conditional delayed-entry survival | 0 preserved prospective forecasts | Unavailable | Unavailable | Unavailable | No |
| C — recent receipt cohorts (30/60/90) | 0 preserved prospective forecasts | Unavailable | Unavailable | Unavailable | No |

[Machine-readable readiness output](backtest-readiness-2026-10-13.json) was
generated with an **empty prospective evidence set**, reflecting the missing
historical archive. It is a reproducible readiness report, not a scored trial
on the mutable live dataset. Synthetic unit tests verify mathematics and leakage
controls; they are not evidence of real-world accuracy.

## Implemented evaluation

- Reconstruct each landmark from observations recorded no later than that time.
  Community snapshots are likewise read as-of; no future corrections enter a fit.
- Hold out one stable application-UUID fold (20%) across all landmarks, including
  duplicate enrollments. Never train on another enrollment of the same application.
- Compare legacy all-center kind/premium fallback A, survival B, and receipt-window
  C candidates. A's optional inferred-center branch is deliberately excluded
  because the new dataset does not infer centers from receipts; identify this
  limitation when interpreting an A/B report.
- Report attempted forecasts, unique applications, availability and observed
  approvals alongside median/mean absolute date error, ±7/14/30 fractions and
  observed-approval interval coverage. Report Initial/STEM, regular/premium and
  under-90/90-plus-day waiting groups separately.
- Evaluate approval cumulative-incidence probabilities at 7/14/30/60/90 days using
  IPCW Brier scores. Competing outcomes contribute a known nonapproval outcome.
  Reverse Kaplan–Meier estimates censoring on the non-held-out follow-up; this
  evaluation-only follow-up never enters prediction fitting. Unsupported horizons
  or censor survival ≤.05 return null rather than clipped weights or false precision.
- IPCW interval-mass coverage accompanies naive observed-approval coverage.
  Calibration is not assessed only on completed approvals. Repeated landmark
  error differences are averaged within each application; 400 deterministic
  application bootstrap draws produce a paired 95% interval when at least 30
  paired applications are available. Negative difference favors the candidate.
- Cases that appeared pending at a landmark but were later shown to have already
  reached an earlier terminal event are counted as retrospective pending
  corrections and excluded from outcome scoring. Report that selection effect.
- The daily report runs five historical landmarks (90,60,30,14,7 days earlier).
  The CLI accepts additional landmarks for a locked validation period.

IPCW requires independent censoring (or an adequate conditional censor model).
The initial pooled reverse-KM estimate is a baseline, not proof of this assumption.
Inspect subgroup calibration and sensitivity before promotion. Cross-source
identity overlap with community A cannot currently be excluded; do not represent
the legacy comparison as an independently deduplicated multi-source trial.

Reference: [scikit-survival IPCW Brier definition and assumptions](https://scikit-survival.readthedocs.io/en/stable/api/generated/sksurv.metrics.brier_score.html).

## Reproduce

From `apps/web`, using no production secrets for the readiness report:

```sh
pnpm exec tsx scripts/backtest-opt-forecasts.ts --empty-readiness \
  --as-of 2026-10-13T13:00:00.000Z --landmarks 2026-08-01,2026-09-01,2026-10-01 \
  --out ../../docs/predictions/backtest-readiness-2026-10-13.json
```

For real prospective evaluation, use the authorized server environment and an
explicit matching project. The command refuses pooled reads while the source-use
gate is off. Never put secrets on the command line or export case records:

```sh
pnpm exec tsx scripts/backtest-opt-forecasts.ts --project deknauqkqqzwuvopqott \
  --as-of <ISO-cutoff> --landmarks <comma-separated-ISO-dates> \
  --out /private/operator/path/aggregate-report.json
```

The output contains aggregate metrics only; small subgroups should remain
operator-private. `--fixture` accepts a synthetic JSON dataset for development.
After enough prospective outcomes accrue, lock validation dates and cohort
thresholds before evaluating, review the complete report (including availability
and censoring support), then follow the separate [promotion procedure](OPT_FORECAST_ENGINE.md).
