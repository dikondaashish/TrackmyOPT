# Technology Job Aggregation Engine: Audit and Implementation Plan

## Audit scope and baseline

- Repository: `TrackMyOPT`, branch `main`, baseline `3e9a222`.
- Inventory: 1,604 tracked/non-generated files were inventoried. The 123-file job,
  sponsor, resume, scheduling, migration, and compliance slice was inspected in
  depth; unrelated billing, blog, USCIS, insurance, and extension features were
  excluded from deep review.
- Stack: Next.js 16 web application, NestJS 11 API, Supabase/Postgres, Bull/Redis,
  a pinned Python `ats-scrapers` bridge, GitHub Actions scheduling, Vercel, and
  Render. There is no Prisma layer.
- Clean remote baseline: GitHub CI passed scheduler tests, web lint/typecheck/tests/
  build, extension checks, API lint/unit/e2e tests/build at `3e9a222`.
- Local worktree: it already contains unrelated user changes. Implementation must
  avoid, preserve, and exclude those files from commits.

## Current production evidence

The live Supabase project `deknauqkqqzwuvopqott` is healthy on Postgres 17.6.
It contains 24,682 H-1B sponsor records; all have a website and 12,026 also have a
stored careers URL. Among the 2,000 highest-priority sponsors, 2,000 have a website
and 1,257 have a careers URL.

Only two ATS sources are enabled:

- Greenhouse: North Beam, Inc. (`northbeam`) — 15 open jobs.
- Ashby: Also, Inc. (`Ridealso`) — 42 open jobs.

All 57 jobs have `first_seen_at`, `last_confirmed_at`, `listing_status`,
`employer_board_name`, and `source_trust_tier`. Recent runs for both sources
succeeded and deduplicated all returned jobs. No authoritative board has yet
produced a genuine stale/removed transition, so the existing closure lifecycle is
implemented but its production exit criterion remains open.

## Existing architecture to preserve

1. GitHub Actions wakes the free Render API hourly.
2. Nest queues one `ingest-enabled-sources` Bull job.
3. The worker reads enabled `ats_sources`, reserves an audited run in Postgres,
   invokes the pinned Python adapter, and persists normalized rows.
4. Source identity, duplicate keys, freshness, employer-match boundaries, and
   evidence-backed visa signals are enforced in Postgres.
5. The authenticated Next.js page reads only open verified jobs, applies current
   filters, resume scoring, tracker actions, and employer evidence.

This flow remains the compatibility path while discovery and richer normalization
are introduced additively.

## Reuse decisions

| Reference | Decision | Reason |
| --- | --- | --- |
| `kalil0321/ats-scrapers` at pinned commit `f654221...` | Reuse as the fetch-adapter runtime | MIT; already deployed; typed canonical model; async adapters, retries, error mapping, and the requested priority ATS classes already exist. Do not import its company CSV datasets without a separate data-license decision. |
| `Ramcharan747/careerscout` at `eee84fa...` | Port small discovery/detection ideas only | MIT; useful career-path probes, attribute-scoped ATS detection, Workday parsing, checkpoints, and per-domain politeness. Its Go/Rust/Redpanda/browser architecture is too large for the current free Nest/Supabase stack. Browser/eBPF tiers remain out of scope. |
| `YvetteZheng0812/ats-job-scraper` at `0dbc9f1...` | Reference only | MIT; useful separation of discovery and fetch plus deterministic relevance scoring. SerpAPI must remain optional and its apply-assistant code is out of scope. |
| `zachproffitt/builder-jobs-scraper` at `a1a85da...` | Architecture reference only; copy nothing | No license file was present, so neither code nor datasets may be incorporated. Its incremental detail-fetch and deterministic prefilter concepts may be independently implemented. |
| `conorscode/ats-api-reference` | Technical behavior reference only | Confirms nine company-specific, public endpoints and their pagination/empty-result quirks. Each employer and ATS still requires the configured authorization/ToS policy before activation. |

See `docs/THIRD_PARTY_LICENSES.md` for notice obligations.

## Findings ordered by severity

### High

1. **Board ownership verification is absent.** The current adapter checks that the
   configured ATS name equals the instantiated adapter name, but it does not prove
   that the board belongs to the selected sponsor/company. Auto-discovery cannot
   activate a source until company name, official domain, careers link, and board
   branding evidence produce a high-confidence result.
2. **One source failure aborts the entire sequential run.** At thousands of boards,
   a single timeout or schema change would prevent all later sources from running.
   Sources need independent jobs, failure isolation, and resumable checkpoints.
3. **Ambiguous empty feeds can advance closure state.** Several ATS platforms use
   an empty result both for a valid zero-job board and for an invalid/mismatched
   board. Reconciliation must run only after a validated, complete authoritative
   response and must record the verification evidence used.
4. **The browser currently receives the full open feed and filters it in memory.**
   This cannot support 10,000+ jobs. Search, filters, ranking, and pagination must
   move to indexed Postgres queries exposed through a bounded API.

### Medium

1. The Python child process has no parent-enforced timeout, output limit, or kill
   path.
2. Existing sources are processed sequentially and existing jobs are updated one
   row at a time, producing network and database N+1 behavior.
3. `ats_sources` supports only seven ATS enum values and lacks discovery,
   verification, health, retry, and cadence state.
4. The jobs schema loses separate public-posting and application URLs, raw payload
   references, source/content hashes, multi-location data, structured salary,
   remote scope, skills, categories, and canonical duplicate relationships.
5. Current rate accounting counts ingestion reservations, not the actual page and
   detail requests made by paginated adapters.
6. Audits have a start time but no completion timestamp or duration, limiting
   operational diagnosis.

### Low

1. Current role, experience, workplace, and employment inference is useful for 57
   jobs but implemented in the web layer; it should become shared deterministic
   enrichment with versioned taxonomies.
2. The production feed RLS policy permits authenticated reads of verified stale/
   removed rows if queried directly. The public search API should expose active
   rows only, while service/admin paths retain history.

## Target architecture

```text
company seeds (H-1B first; optional directories/providers later)
  -> bounded career-page discovery
  -> plugin ATS detection and board extraction
  -> board verification and review queue
  -> independently scheduled source fetch
  -> canonical normalization and hashes
  -> deterministic dedupe
  -> deterministic technology classification and skill extraction
  -> freshness events and source health
  -> indexed Postgres search RPC/API
  -> paginated Next.js job board and admin source console
```

The fetch-order rule is: documented/public HTTP API, embedded structured data,
public HTML where policy permits. Browser automation, CAPTCHA handling, private
APIs, authentication bypass, auto-apply, and submission workflows are excluded.

## Incremental implementation gates

### Gate 1 — Safety and plugin foundation

- Add a typed ATS plugin registry for the ten priority platforms with URL patterns,
  board extraction, public endpoint shape, fetch capability, and conservative
  rate-limit defaults.
- Add pure tests for valid/invalid URL detection and Workday tenant/shard/site
  parsing.
- Add child-process timeout and bounded output handling.
- Exit: existing Greenhouse/Ashby tests pass unchanged; every priority plugin has
  deterministic URL fixtures; no production source or schema is changed.

### Gate 2 — Additive discovery schema

- Add `companies`, `company_sources`, `ats_platforms`, `ats_boards`,
  `source_verification_queue`, `discovery_runs`, and `source_errors` with RLS.
- Seed company identities from `h1b_sponsors` by reference, never by destructive
  replacement. Preserve existing `ats_sources.company_id` until a compatibility
  migration is proven.
- Add board verification evidence and thresholds. Only `verified` boards may be
  projected into enabled `ats_sources`.
- Exit: migration applies cleanly in a disposable/local database, advisors show no
  new RLS/security defects, and a fixture company can move from discovered to
  review/verified without enabling an unverified board.

### Gate 3 — Company and career discovery

- Rank H-1B seeds by recent approvals and process small resumable batches.
- Probe only bounded common career paths/subdomains, follow same-company career
  links, respect robots/policy, cache validators, and enforce domain concurrency.
- Detect ATS only from URLs/HTML attributes and structured markers; do not accept
  casual page text.
- Exit: a dry run against a reviewed sponsor sample records career/ATS candidates,
  explains confidence, queues uncertainty, and makes no false automatic activation.

### Gate 4 — Verified board fetch expansion

- Route priority adapters through the pinned `ats-scrapers` runtime and isolate one
  source per queue job.
- Implement pagination/detail policies, actual-request accounting, retries,
  backoff, circuit breaking, and schemas for Greenhouse, Lever, Ashby, Workday,
  SmartRecruiters, Workable, Recruitee, Personio, BambooHR, and Breezy.
- Exit per adapter: valid, invalid, zero, multiple, pagination, missing fields,
  remote, malformed, 429, timeout, and schema-change tests pass; live checks are
  opt-in and never mutate production evidence.

### Gate 5 — Canonical jobs, dedupe, and intelligence

- Add separate job/apply URLs, arrays/child tables for location and skills,
  structured salary, taxonomy versions, hashes, raw-payload references, events,
  duplicates, and canonical job IDs.
- Use exact identity first, normalized company/title/location/apply URL second,
  and explainable similarity only as a fallback. Never delete duplicates blindly.
- Classify technology relevance, category, seniority, skills, remote scope, salary,
  sponsorship restrictions, and clearance with deterministic rules first. Optional
  AI enrichment may fill uncertain records asynchronously and must never be a hard
  dependency.
- Exit: a labeled fixture suite meets agreed precision/recall thresholds and every
  derived value records method/version/confidence.

### Gate 6 — Indexed search and user experience

- Add Postgres full-text/search indexes and a bounded, paginated search RPC/API.
- Support keyword, category, skill, company, location, remote type, seniority,
  employment type, salary, and posted date; return an explainable deterministic
  `JobMatchScore` without inventing missing attributes.
- Update the Next.js board to server-side pagination and preserve existing resume,
  tracker, ATS link, and sponsorship-evidence boundaries.
- Exit: query plans use indexes on production-like volumes and the browser never
  downloads the complete corpus.

### Gate 7 — Operations and scale

- Add source/admin dashboards, manual overrides, health metrics, event counts,
  verification queues, failure classification, and resumable batches.
- Keep GitHub Actions as the free scheduler. Partition high/normal/slow sources and
  fetch details only for new/changed/missing-description jobs.
- Exit: 10,000+ active relevant jobs from multiple verified companies/ATS types,
  freshness and removal evidence, acceptable failure isolation, no paid mandatory
  dependency, and production security/performance advisors reviewed.

## First implementation tranche

Implementation advances only after the preceding gate has exit evidence. Automatic
activation and bulk crawling remain blocked until board ownership, ATS policy, and
source-health checks pass. This keeps the current verified feed live while the
larger system is introduced additively.

## Implementation status (2026-08-31)

- **Gate 1 complete:** ten priority ATS plugins are registered and tested; the
  Python adapter child has a two-minute deadline and a 64 MB combined-output cap.
- **Gate 2 complete:** the live project has 24,682 company seeds, 24,682 provenance
  rows, ten policy-aware ATS definitions, server-only RLS, and two verified legacy
  boards. Security advisors report no finding on the new tables.
- **Gate 3 complete:** bounded, robots-aware discovery; attribute-only ATS link
  parsing; ownership evidence; recency-weighted sponsor priority; ATS-hint priority;
  resumable audits; and review-only persistence are implemented. Production run
  `c7c9cc36-cd5e-4e54-9e0a-de72ba6fc04f` found Intel's Workday board from Intel's
  official careers page, recorded only the observed 0.20 confidence, queued it for
  policy/ownership review, and enabled no source.
- **Gate 4 complete:** each enabled source is independently queued/retried and
  the compatibility schema accepts the ten priority adapter keys. The Python bridge
  validates complete adapter metadata and preserves request counts even when an
  adapter exhausts retries; lifecycle reconciliation refuses incomplete or ambiguous
  empty feeds; and persistent source health records backoff, failure classes, and a
  three-failure circuit breaker. Realistic raw-payload fixtures invoke the pinned
  upstream parsers for Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Workable,
  Recruitee, Personio, BambooHR, and Breezy. Their process contracts cover success,
  pagination/multiple jobs, zero-result, malformed/missing/duplicate payloads, HTTP
  4xx/5xx/429, timeout, retry, request accounting, and source isolation. The focused
  Gate 4 suite passes 133 tests (118 Nest job-board tests, 10 raw-parser tests, and 5
  scheduler tests); the isolated repository verification also passes web/API/extension
  lint, typecheck, tests, and builds.

  Production removal proof is genuine rather than simulated. Greenhouse audit
  `6a0e7a44-2355-4cf0-95bb-5d7e83bad26e` marked external jobs `4250557006` and
  `4413815006` stale at 2026-08-31 18:15 UTC; successful audit
  `4201890a-aac6-4146-84dc-9132c7dfa608` removed both at 18:48 UTC. Both rows remain
  stored with `listing_status = 'removed'`, are absent from the active verified feed,
  and are absent from the authoritative Greenhouse response. Production still has
  exactly two enabled sources and 57 open verified jobs with no missing source or
  freshness fields. No discovered board was automatically activated.
- **Gates 5–7 not started:** canonical enrichment/dedupe, indexed search migration,
  admin operations, and the 10,000-job scale exit are not claimed yet.
