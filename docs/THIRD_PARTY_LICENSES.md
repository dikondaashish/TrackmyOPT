# Third-Party Job Aggregation References

This file records repositories reviewed for the TrackMyOPT job aggregation
engine. It does not grant rights to third-party job/company datasets, employer
content, trademarks, or hosted services.

## Incorporated dependency

### node-oracledb

- Project: <https://github.com/oracle/node-oracledb>
- Package: `oracledb` 7.0.1
- License: Apache-2.0 OR UPL-1.0
- Use: server-only Oracle 26ai shadow job-store adapter; loaded lazily and not
  wired into the production job-board module yet.
- Notice obligation: retain the upstream Apache/UPL notices when distributing
  the adapter and driver.

### ats-scrapers

- Project: <https://github.com/kalil0321/ats-scrapers>
- Pinned revision: `f654221f5236f24360719008764b23c5939fbce8`
- License: MIT
- Copyright: Copyright (c) 2026 Kalil Bouzigues
- Use: installed as a Python dependency for public ATS fetch adapters.
- Notice obligation: retain the upstream copyright and MIT permission notice in
  distributions containing substantial portions of the software.
- Data caveat: the repository's company inventories and hosted job datasets are
  not imported by this project. Dataset use requires a separate data-license and
  source-policy review.

## Code references permitted by license

### CareerScout

- Project: <https://github.com/Ramcharan747/careerscout>
- Reviewed revision: `eee84faf02f8e46dc3c5764c09d1880816577539`
- License: MIT
- Copyright: Copyright (c) 2026 Ramcharan
- Planned use: architecture and small independently adapted discovery/detection
  patterns. If substantial code is incorporated later, its MIT notice must be
  preserved with the distribution.

### ATS Job Scraper

- Project: <https://github.com/YvetteZheng0812/ats-job-scraper>
- Reviewed revision: `0dbc9f1de6190500f9667a9d9b0fc640d38204eb`
- License: MIT
- Copyright: Copyright (c) 2026 Yaohong Zheng
- Planned use: architecture reference only at present. SerpAPI and apply-assistant
  functionality are not dependencies of TrackMyOPT.

## Reference only — no copying

### Builder Jobs Scraper

- Project: <https://github.com/zachproffitt/builder-jobs-scraper>
- Reviewed revision: `a1a85da7f3d78b752fa1e355d125e6bab1fbf33c`
- License: no license file was present at the reviewed revision.
- Decision: do not copy, modify, distribute, or import its code or datasets.
  Publicly described architectural ideas may be independently implemented.

### ATS Job API Reference

- Site: <https://conorscode.github.io/ats-api-reference/>
- Use: technical behavior reference for public, company-specific endpoints.
- Decision: do not copy site content or payload samples. Endpoint behavior must be
  revalidated against each enabled source, and legal/ToS authorization remains a
  separate per-platform policy decision.
