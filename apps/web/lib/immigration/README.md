# `lib/immigration/`

Immigration date estimates and types. Safety-critical calculations: automated tests do not replace DSO/legal review or authoritative EAD/SEVIS records.

## Modules

| File | Purpose |
|---|---|
| `opt-calculations.ts` | Single source of truth for OPT/STEM filing windows and the **phase-aware** unemployment calculator |
| `calendar-days.ts` | Calendar-date validation, inclusive employment unions, local today, and estimated STEM end |
| `opt-dates-page-utils.ts` | Dashboard summaries, missing-data states, and conservative filing-rule transition warning |
| `uscis-checker.ts` | OAuth + HTTP client for the live USCIS Case Status API (`api.uscis.gov`) plus the dev-only mock |
| `__tests__/opt-calculations.test.ts` | Locked-down tests for all 10 STEM 150-day scenarios |

## Public API

```ts
import {
    calculateUnemploymentDays,
    getFilingWindow,
    daysBetween,
    INITIAL_OPT_CAP,
    CUMULATIVE_STEM_CAP,
    type EmploymentSpan,
    type UnemploymentBreakdown,
} from '@/lib/immigration/opt-calculations';

const result = calculateUnemploymentDays(
    opt_start_date,
    opt_ead_end_date,
    employmentSpans,
    stem_start_date, // optional
    stem_end_date,   // optional
);
// result.used / result.max / result.phase / result.exceededInitialOptCap …
```

## Compliance rules locked in

- **Initial OPT cap:** 90 cumulative unemployment days.
- **STEM OPT cumulative cap:** 150 cumulative across OPT + STEM.
- **STEM does NOT reset the counter** — initial-OPT days carry forward.
- **`exceededInitialOptCap` is sticky:** once breached, it stays `true` even after STEM starts.
- **Calendar days:** count authorized days through today, including weekends. Employment start/end dates are inclusive. Overlapping employment is counted once; future days and days outside authorization are excluded.
- **Historical initial-OPT filing helper:** earliest = program_end − 90; hard deadline = earlier of program_end + 60 and actual DSO recommendation + 30 (when provided). This legacy helper alone does **not** establish current filing eligibility.
- **September 2026 transition:** the dashboard displays “DSO review needed” for potentially affected windows. Current regulation changes post-completion filing timing; admission/I-94 and filing facts are not collected here. Other calculator/extension/email consumers still need coordinated transition-aware updates and owner/legal review before claiming current-rule coverage.
- **STEM end:** when no actual end is supplied, the 24-calendar-month end is an estimate only. Verify the EAD.

See [2026-09-22 audit](../../../../docs/OPT_DATES_AUDIT_2026-09-22.md) for official sources, browser checks, remaining release gates, and exact test results.

> ⚠️ **Do not** modify `calculateUnemploymentDays` without re-running `pnpm test`. Tests assert the exact day-by-day behavior across phase boundaries.

## Adding new compliance rules

1. Add a pure function to `opt-calculations.ts`.
2. Cover it with at least 3 cases in `__tests__/opt-calculations.test.ts` (happy path, edge case, boundary).
3. Cite the regulation in the JSDoc (`8 CFR § 214.2(f)(...)`).
4. Update this README and `apps/web/ARCHITECTURE.md`.
