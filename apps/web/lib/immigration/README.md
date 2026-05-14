# `lib/immigration/`

Immigration-compliance calculators and types. **The most safety-critical module in the codebase** — every change here is reviewed for legal correctness.

## Modules

| File | Purpose |
|---|---|
| `optCalculations.ts` | Single source of truth for OPT/STEM filing windows and the **phase-aware** unemployment calculator |
| `uscis-checker.ts` | OAuth + HTTP client for the live USCIS Case Status API (`api.uscis.gov`) plus the dev-only mock |
| `__tests__/optCalculations.test.ts` | Locked-down tests for all 10 STEM 150-day scenarios |

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
} from '@/lib/immigration/optCalculations';

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
- **Filing window:** earliest = program_end − 90, recommended = program_end − 60, hard deadline = program_end + 60.

> ⚠️ **Do not** modify `calculateUnemploymentDays` without re-running `pnpm test`. Tests assert the exact day-by-day behavior across phase boundaries.

## Adding new compliance rules

1. Add a pure function to `optCalculations.ts`.
2. Cover it with at least 3 cases in `__tests__/optCalculations.test.ts` (happy path, edge case, boundary).
3. Cite the regulation in the JSDoc (`8 CFR § 214.2(f)(...)`).
4. Update this README and `apps/web/ARCHITECTURE.md`.
