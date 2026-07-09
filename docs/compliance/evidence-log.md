# USCIS Torch API — Compliance Evidence Log

Chronological record for regulator response and internal audit. Do not delete rows or evidence.

## Remediation timeline

| Event | Timestamp (ET) | Details |
|-------|----------------|---------|
| USCIS Torch notice received | 2026-07-09 11:45 AM | Unauthorized sequential/neighbor receipt lookups flagged; 5 business day response deadline |
| cron-job.org `scan-nearby-cases` paused | _pending — operator to confirm_ | Job: `GET https://www.trackmyopt.com/api/cron/scan-nearby-cases` |
| Commits `6d22932`..`61d6652` pushed to GitHub `main` | 2026-07-09 ~12:17 PM ET | Tasks C–F: kill switch, enrollment guard, quarantine, tests, docs |
| Production deploy (Vercel) | 2026-07-09 ~12:33 PM ET (verified live) | Kill switch 410s confirmed at `https://www.trackmyopt.com`; expected commit `61d6652` (Vercel git SHA header not exposed on API routes) |
| Supabase migration `uscis_api_audit` applied | 2026-07-09 ~12:27 PM ET | Project `deknauqkqqzwuvopqott` |
| Supabase migration `uscis_case_cache_quarantine` applied | 2026-07-09 ~12:27 PM ET | All cache rows quarantined |
| Cache quarantine verification | 2026-07-09 ~12:28 PM ET | **4139 / 4139** rows `quarantined = true`; **0** rows deleted |

### Code changes (reference)

- `6d22932` — Task C: kill switch (`NEARBY_SCAN_ENABLED`, 410 endpoints, fire-and-forget removed)
- `cba5446` — Task B: `fetchCaseStatus` enrollment guard + `uscis_api_audit`
- `a10bb90` — Task D: quarantine column + UI hide Nearby Cases
- `06d2670` — Task E: compliance tests
- `61d6652` — Task F: remediation docs

> **Note:** `https://trackmyopt.com` returns **308** to `https://www.trackmyopt.com`. Compliance checks use `www` (or `curl -L`).

## 410 Verification — 2026-07-09

- **Verified at (UTC):** 2026-07-09T16:33:03Z
- **Target base URL:** https://www.trackmyopt.com
- **Local git SHA:** `61d6652673a490e242c172792f4f8dd49c994256`

### Disabled endpoints (must be 410)
- `GET /api/cron/scan-nearby-cases` → **410** (cron neighbor scanner)
  - ✅ kill switch active
- `POST /api/case-status/nearby/scan` → **410** (internal neighbor batch scan)
  - ✅ kill switch active
- `GET /api/case-status/nearby` → **410** (nearby cohort API)
  - ✅ kill switch active

### Authorized routes (must NOT be 410)
- `POST /api/case-status/refresh` → **401** (manual refresh (unauthenticated))
  - ✅ route alive (auth/config gate, not disabled)
- `GET /api/case-status` → **401** (case list (unauthenticated))
  - ✅ route alive (auth/config gate, not disabled)
- `POST /api/case-status/check` → **401** (USCIS check (no secret))
  - ✅ route alive (auth/config gate, not disabled)
- `GET /api/cron/check-case-status` → **401** (daily enrolled-case cron)
  - ✅ route alive (auth/config gate, not disabled)

- **Deployed git SHA (Vercel header):** _not present in response headers_

**Result:** PASS (0 failures)

