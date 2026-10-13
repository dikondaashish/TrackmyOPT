# OPT forecast retrospective check — October 13, 2026

**Result:** on past USCIS histories, `opt-aj-v1` dates approvals far more closely than
the community estimator shown today. It is not yet ready to serve as-is: it needs
stored (unconfirmed) categories, covers few cases, and its ranges are too narrow.
No production setting was changed.

## Method

`scripts/backtest-opt-forecasts-retrospective.ts` (read-only, aggregates only)
rebuilds each enrolled case's state on past dates from the **dated events in its
current USCIS history**. It simulates a check every 14 days plus one on each test
date, and each check sees only events dated on or before that day. The existing
`backtest()` then trains on 80% of applications as of each date and scores the
held-out 20% against their real later approval dates.

- Test dates: May 1, Jun 1, Jul 1, Aug 1 and Sep 1, 2026; evaluated October 13.
- Data: 1,852 enrolled cases (1,767 distinct applications) and 9,857 community
  timelines.
- Baseline A: the live estimator's method (completed community reports, filing
  date + percentiles). A community report is used only once its approval date
  has passed.
- This is **retrospective**, not prospective. USCIS posting delays and history
  rewrites are invisible, and TrackMyOPT users are self-selected.

The same run fixed USCIS wording the normalizer missed: "USCIS Is currently
Processing the Case", "We received your Form I-765 …", "We started the
premium-processing clock …", "Approval Case Decision Rendered", and card-mailing
titles after a dated approval. These fixes also apply to the live daily pipeline.

## Results (held-out applications, all test dates pooled)

With confirmed categories only (the model's current rule), the model produced
**no forecasts**: too few cases have a confirmed category.

Treating the stored category as confirmed (1,369 of these are an unconfirmed
`initial_opt` default):

| | Old estimator (A) | New survival model (B) |
| --- | --- | --- |
| Forecasts / attempts | 1,215 / 1,215 | 232 / 1,215 (19%) |
| Scored approvals | 542 | 148 |
| Median / mean absolute error | 66 / 64.4 days | 10 / 12.2 days |
| Within 7 / 14 / 30 days | 3% / 8% / 17% | 34% / 72% / 91% |
| 50% / 80% range hit (approvals only) | 9% / 14% | 38% / 75% |

- Paired on the same 141 applications, B's error is 45.7 days lower than A's
  (bootstrap 95%: 39.8 to 51.1 days lower).
- By cohort, Initial OPT **premium**: 112 forecasts, 108 approvals, mean error
  9.1 days, 85% within 14 days. Initial OPT **regular**: 120 forecasts, 40
  approvals, mean error 20.5 days. **STEM: no supported forecasts.**
- IPCW Brier (lower is better) favours B on every test date where it was
  available. At 30 days: Jul 0.46 vs 0.53, Aug 0.28 vs 0.52, Sep 0.10 vs 0.38.
- Calibration is weak. Accounting for cases still pending (IPCW), the 50% range
  covered 5% and the 80% range 54% on Aug 1, with only 38 eligible cases.
  Ranges are too narrow.
- The 30/60-day recent-receipt candidates produced nothing. The 90-day one
  covered only premium cases, with errors similar to B.

## What serving it would require

1. Train the served curves from reconstructed USCIS history. Today they use only
   the prospective archive, which holds one observation.
2. Decide the category rule: a user-confirmed category, or the stored
   default for I-765 cases.
3. Show the median date with widened or relabelled ranges until the
   calibration improves.
4. Then record the reviewed `validation` and `promoted_model` for the approved
   cohorts only (see the [engine guide](OPT_FORECAST_ENGINE.md)), and keep
   checking forecasts against outcomes as they arrive.
