# Incremental job ingestion

Incremental ingestion makes a daily run rewrite only the jobs that changed.
Two settings control it:

- **`JOB_INGEST_INCREMENTAL=true`** turns it on.
- **The `JOBS.CONTENT_HASH` column** must exist first. It is added by
  `apps/api/sql/oracle/jobs-content-hash.sql`.

With the flag unset or `false`, ingestion is unchanged: every job seen gets a
full `MERGE`, plus a second full save for employer links.

## What changes when it is on

Each job in a complete source response is handled one way:

| Job | Oracle writes |
|---|---|
| New | Full job insert plus a search-row insert (in one transaction) |
| Description changed | Full job update plus a search-row update |
| Other displayed field changed (title, company, location, department, URL, posted date, board name) | Full job update; **search row untouched** |
| Stale or removed and seen again | Full job update back to `open` (existing reopen path); search row only if the description changed |
| No `content_hash` yet (legacy row) | Full job update, which fills the hash; search row rewritten once |
| Open and unchanged | `UPDATE jobs SET last_confirmed_at, updated_at` only |

**Other behaviour:**

- **Employer links.** Only jobs whose resolved `employer_match_id` differs get a
  one-column `UPDATE`. There is no second full save.
- **Closed jobs.** Reconciliation is unchanged. Incomplete or ambiguous
  responses still throw before any write, so a fetch failure never marks jobs
  stale or removed.
- **What the hash covers.** Salary, workplace and employment type are not
  stored as columns. They are derived from the description and location at
  query time, so the hash already covers them.

## Retry policy for source jobs

Source jobs run with Bull `attempts: 3` and exponential backoff:

- **Discarded on the first failure:** `ORA-00054`, `ORA-30006`, `ORA-04021`
  and `ORA-02049`. These are lock waits that already timed out inside Oracle.
- **One retry, then discarded:** `NJS-123` (the 30-minute call timeout). A
  second consecutive `NJS-123` is discarded.
- **Retried normally:** everything else, such as network resets, deadlocks
  and HTTP errors.

In all cases the audit row is already completed as failed with the original
error.

## Rollout

1. **Merge.** The flag is off by default, so behaviour is unchanged. Deploy
   `TrackmyOPT` automatically and `trackmyopt-api` manually.
2. **Add the column.** As `TRACKMYOPT_JOB_APP`, run `jobs-content-hash.sql`
   and confirm the verify query returns one row.
3. **Turn the flag on.** Set `JOB_INGEST_INCREMENTAL=true` on both API
   services and restart them while no ingestion is running. The worker pauses
   the queues when it starts, so resume them afterwards.
4. **Benchmark** (below). After that, normal daily runs use the flag.

## Rollback

- **Fastest:** set `JOB_INGEST_INCREMENTAL=false` and restart. This restores
  the original path and leaves stored hashes unused.
- **Code:** revert the PR.
- **Schema, optional:** `ALTER TABLE jobs DROP COLUMN content_hash;`, only
  after the flag is off everywhere.

## Benchmark (needs owner approval to run in production)

**Sources:** use a small, a medium and a large enabled board, for example:

- Amplitude: Ashby, 39 jobs;
- addepar1: Greenhouse, about 109 jobs;
- accenturefederalservices: Greenhouse, about 675 jobs.

**Procedure:** for each source, queue `POST /job-board/ingest-source/:id`
three times. Use run IDs `job-board-manual-bench-<source>-1|2|3` and run one
source at a time.

| Run | Expectation |
|---|---|
| 1 | Fills hashes. About as slow as today. |
| 2 | Unchanged. Should be mostly `store-confirm`. |
| 3 | Repeat of run 2, to show it is stable. |

**Compare from the worker logs:**

- `incremental plan: write= search= confirm=` per source;
- `Oracle MERGE INTO jobs rows=… took …ms`;
- `Oracle MERGE INTO …job_search rows=… took …ms`;
- `Oracle UPDATE jobs rows=… took …ms` (confirm);
- `COMMIT` times;
- the audit `jobs_found / jobs_new / jobs_stale`, and wall-clock time from
  `run_at` to `completed_at`.

**Correctness checks after each run:**

- Oracle open-row count per source equals the live board's job count.
- No unexpected `stale` or `removed` rows.
- `content_hash` is non-null for every open job of the source.

**Baseline today (Amplitude, 39 jobs, full path):**

| Step | Time |
|---|---|
| `MERGE jobs` | 9.5 s, done 2× |
| `MERGE job_search` | about 19 s, done 2× |
| `COMMIT` | about 1 s |
| Source total | about 62 s |

**Expected on runs 2 and 3:** no `MERGE`, one confirm `UPDATE` (comparable to
`UPDATE jobs rows=22 took 92ms` today), and a source total of a few seconds
plus fetch time.
