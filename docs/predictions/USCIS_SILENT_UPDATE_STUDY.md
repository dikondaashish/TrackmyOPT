# USCIS "silent update" study

Started October 13, 2026. Review it around **April 2027**.

**Question:** does a change in USCIS's back-end timestamp, with no visible status
change, predict that an approval is coming soon?

## What we know already

- The USCIS Case Status API's `modifiedDate` "is updated when an event occurs
  related to a receiptNumber". The documentation adds that "internal or
  administrative updates that do not impact the outcome of a case may also cause
  a `modifiedDate` update". USCIS makes no claim that it predicts approval.
- The API does **not** send `modifiedDate` for IOE (online-filed) receipts.
  When the study started, 1,755 of the 1,774 enrolled I-765 cases had IOE
  receipts, so only about 19 OPT/STEM cases can contribute.
- The "updatedAt" fields people share in videos come from the logged-in
  my.uscis.gov account JSON. We do not and will not collect that: it would
  require applicants' USCIS credentials.
- Across about 1,160 approved I-765 cases, the last visible event before approval
  usually came weeks or months earlier. Typical gaps: premium upgrade about 34
  days, "currently processing" about 124 days, "actively reviewing" about 64
  days. Approvals usually arrive without a visible warning.

## What is collected

Migration `20261013205252_opt_observation_modified_date` and
`lib/uscis/client.ts`. Each successful daily check stores `provider.modified`
in `opt_case_observations`, but only when USCIS sends it in the exact
`MM-DD-YYYY HH:MM:SS` form. Nothing else is added, and IOE observations are
unchanged. The forecast model ignores this field.

## How to evaluate

For each non-IOE I-765 case, find days where `modified` changed while
`status` and `events` did not (a "silent update"). Compare:

1. how often a visible decision followed within 7, 14 and 30 days of a silent
   update, versus
2. how often one followed within the same windows on days with no silent
   update.

Report the counts. If fewer than about 20 silent updates and 10 decisions have
been observed, the answer is "not enough data". Do not present a correlation
from a handful of cases as a signal to users.
