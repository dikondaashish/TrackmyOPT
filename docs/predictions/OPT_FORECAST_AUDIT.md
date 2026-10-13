# OPT prediction audit — October 13, 2026

This audit used the repository at `916940be` and read-only aggregate queries on
TrackMyOPT project `deknauqkqqzwuvopqott`. Counts are a point-in-time snapshot,
not USCIS population statistics. No applicant records are included here.

## Existing estimator

| Question | Finding |
| --- | --- |
| Import/matching | `apps/web/lib/community-opt/ingest.ts` imports OPT Tracker in 50-row pages (maximum 120 pages) and OPT Pulse in 1,000-row pages (maximum 20,000 rows). IDs are namespaced `optt_` and `optp_`. Upserts target `external_id`. The daily import is 15:30 UTC. |
| Duplicates | Repeated external IDs collapse within a source. `evidence.ts` flags matching date tuples across sources but does **not** establish that these are the same person. No receipt identifier is present in the community table. Reliable community-to-USCIS or cross-partner identity matching is unavailable. |
| 7–400 days | `estimate.ts` calls values outside this range parsing errors because some reports are AI-parsed from Reddit. This is a heuristic, not a validated USCIS duration rule. A short premium approval or a genuinely long pending case cannot be rejected solely on that basis in the new model. |
| Minimum 15 | `get-estimate.ts` selects kind + premium + inferred center when at least 15 usable completed approvals exist; otherwise it broadens to kind + premium. Below 15 it returns no prediction. Pending cases do not count toward the estimate. |
| Percentiles | For sorted durations, index `(n−1)p`, interpolate between adjacent values, and round to an integer. The old range is filing date + p25/p75; median is the p50 duration. These are completed-report percentiles, not conditional remaining-wait probabilities. |
| Freshness | Imports overwrite `updated_at`. `prepareEvidence` requires import age ≤30 days and includes rows within ten minutes of the latest import for each source. This measures feed freshness, not confirmation that a case remained pending. |
| Trend | Weekly/histogram comparisons apply separate maturity filters. The headline prediction does not. Current rank is a comparison to completed reports, not a calibrated approval probability. |
| Frontend | Premium account metrics use `/api/case-status/community-estimate`. The public decision-window tool is a separate legacy consumer. Both remain available during validation. |

## Actual USCIS integration

`lib/uscis/client.ts` accepts a matching `receiptNumber`, a nonempty current
English status, optional `formType`, optional `submittedDate`, optional English
description, and optional `hist_case_status` entries with a date and completed
status text. The adapter names the submitted date `receivedDate`; the new
model's clock uses that provider date, or an explicit original case/application
received history event. This is a documented date-definition assumption to
verify against the agreement/API specification. It never substitutes an RFE
response date. IOE responses may omit submitted date and history entirely.

The adapter does not expose a reliable eligibility category, processing center,
or complete premium-processing enrollment record. Filing category is user
confirmed; I-765 alone is insufficient. Existing `pp_start_date` mixes manual
and inferred values. The new schema distinguishes future explicit declarations
and retains a quality flag for historical values of unknown provenance.

Existing stores:

- `case_status`: one enrollment per saved user/application relationship; current
  status, last successful check, overwritten provider `status_history`, and an
  append-on-change `change_log`. Change-log dates are observation times.
- `uscis_check_log`: success/failure diagnostics; it does not record the status
  known at every past prediction time.
- `case_check_jobs`: durable scheduling/attempt/completion records, not training
  outcomes. The daily scheduler is 14:00 UTC (10:00 EDT / 09:00 EST).
- `uscis_case_cache`: ordinary cache and quarantined historical neighbor scans.
  **Neither is used by this model.** Quarantine is not permission to train.

There was no immutable observation, forecast, or model-version table before
this change. Provider history discovered today cannot establish what the
platform knew in August. An older enrollment creation timestamp is not proof
that the application was observed pending then.

## Live aggregate coverage

| Measure | Count |
| --- | ---: |
| Saved enrollment rows | 1,851 |
| Distinct normalized receipt numbers | 1,793 |
| Rows with a stored received date | 1,820 |
| Rows with a last successful check/history | 1,826 |
| Rows with an existing premium start | 718 |
| Confirmed OPT category entries | 400 |
| Entries with form I-765 | 1,771 |
| Provider-history events | 10,411 |
| Dated events | 8,588 |
| Dated approval-text events | 1,192 |
| Current approval-text entries | 13 |
| Current card-production/mail/delivery entries | 1,150 |
| Current denial/rejection/withdrawal-text entries | 7 |
| Current status missing | 25 |

History counts are **events**, not unique applications or eligible training
outcomes. All 8,588 dated history entries used ISO-format strings. Category
defaults, contradictory declarations, stale checks and late enrollment reduce
the usable prospective cohort further.

| Partner | Initial regular | Initial premium | STEM regular | STEM premium | Without approval date |
| --- | ---: | ---: | ---: | ---: | ---: |
| OPT Pulse | 1,195 | 1,853 | 443 | 352 | 1,114 |
| OPT Tracker | 2,053 | 2,879 | 563 | 510 | 3,067 |

The community table contains 9,848 reports, including 4,181 without an approval
date and 5,568 durations passing the old filter. Missing approval is **not**
verified ongoing follow-up. Earliest imports are August 6, 2026. Latest imports
at the audit were October 12 for Pulse and October 9 for Tracker. Oldest reported
filings include 2003, supporting explicit quality review rather than blind
averaging. These partner totals cannot be added to USCIS totals as unique cases.

## Authorization status

On October 13 the owner supplied a private screenshot of a message attributed to
USCIS Torch support, referencing section 4.2 of a case-data analytics agreement.
It describes conditional use of de-identified data and limits demonstration use
to synthetic or independently authorized data. This is owner-provided evidence;
message headers and the underlying agreement were not independently authenticated.
The screenshot stays outside Git (SHA-256
`ab117357b5bc5e217e5cc898d4839d2b50778d679ff7079daaa977092c6bd7b9`).

The owner separately confirmed in this task that real tracked cases are
independently authorized, with required consent and retention controls satisfied,
and will provide the consent/policy reference. The rollout may enable pooled
training based on that explicit owner attestation, recorded in the private
policy row. The detailed consent/policy document is still outstanding. This is
not a certification of legal compliance or permission to collect other cases.
Only currently enrolled applications and the documented deletion controls apply.
Customer-facing survival predictions remain off until out-of-sample validation.
Existing partner-import code states written permission; this audit did not
independently inspect those documents.

See [engine and rollout](OPT_FORECAST_ENGINE.md) and
[backtesting report](OPT_FORECAST_BACKTEST.md).
