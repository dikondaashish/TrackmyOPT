# Render Free ingestion supervision

Production remains Supabase. This change does not enable a recurring schedule,
resume a queue, change Oracle settings, or dispatch work on deployment.

## Incident

The manual run `job-board-manual-cold-start-validation-20260906T214329Z`
enqueued successfully, but the runner exited immediately. The source start pacing
targets 40 minutes. Render Free sleeps after 15 minutes without inbound traffic;
background database/ATS/Valkey activity does not count as incoming traffic.
The worker instance disappeared around 22:05 UTC and booted again at 22:09 UTC.
Memory shortly before the interruption was about 138 MB against a 512 MB limit.
The timing is consistent with idle spin-down, not evidence of memory exhaustion.

Eight audits remained `started` even though no runnable source jobs remained.
The code accepted a duplicate reservation as successful without checking whether
the earlier audit was terminal. Bull's exhausted-stall event also uses a separate
counter from `attemptsMade`, so the final-failure listener could skip it.

## Bounded supervisor

The existing manual GitHub workflow now remains active until completion (maximum
120 minutes plus bounded wake allowance). It polls the API-key-protected
`GET /job-board/ingestion-runs/:runId` every 45 seconds. These are meaningful run
progress requests, not a permanent uptime service. The API may sleep normally
after the run. No additional infrastructure or database secrets are required.

The coordinator persists its selected source IDs on its retained Bull job before
enqueueing either lane. A replay reuses that manifest. Completion requires the
latest terminal audit for every selected identity and no remaining runnable work.
Failed/missing/stranded work cannot yield a green Actions result. The endpoint is
read-only and cannot resume, retry, finalize audits, or mutate job data.

`monitor_only=true` inspects an existing run without enqueueing anything. Historical
runs without manifests cannot be retroactively certified complete by counting rows.
Use this option after an ambiguous dispatch response; do not create a new run ID.

The supervisor tolerates bounded transient unavailability, stops on paused queues,
and never resumes them automatically. A failed/deadline-exceeded supervisor leaves
the durable queue intact for explicit operator diagnosis; it is not cancellation.
Free Render may restart at other times too. This is bounded supervision, not an
exactly-once execution guarantee. Reservation/idempotent persistence still applies.

## Retry safety

A duplicate `started` audit throws rather than removing the Bull job as successful.
Normal retries remain bounded. An exhausted-stall failure is recorded independently
of ordinary retries. Final failure cannot overwrite a successful audit or make a
locally active persistence operation reclaimable. Pre-reservation failures also
receive terminal failure audits on exhaustion. Store-mismatched/restarting work
fails visibly rather than completing silently.

Do not automatically reclaim `started` reservations: that could permit concurrent
writes from a worker that lost its heartbeat but is still alive. Investigate old
stranded audits and use explicit targeted recovery, not an entire new ingestion run.

## Validation boundaries

Unit tests cover the real coordinator/processor paths and the supervisor with
injected HTTP responses. They do not claim a new production ingestion passed.
After deployment, use monitor-only on the existing run. A future explicitly
approved live run must prove all selected sources terminal before cutover readiness.
Keep recurring schedulers inactive and `JOB_DATA_STORE=supabase` until separately
authorized. This fix does not repair Supabase/Oracle deltas from prior ingestion.

Reference: https://render.com/docs/free

## September 7 Oracle ingestion incident fix

The old supervisor called recovery every 15 seconds, which globally failed
started audits based only on a five-minute start time. Adyen crossed this age
while Oracle writes were still potentially in progress. Age-based finalization
is removed from dispatch and recovery. Only bounded Bull exhaustion can finalize
a started failure; successful or locally active audits remain protected.
Completion RPC errors now reject the worker instead of logging a false success.

Bull sums concurrency across named process handlers. The normal queue now uses
one wildcard dispatcher with concurrency one; the slow lane retains concurrency
one. This gives two source slots per process, rather than the observed four.

Both status routes share the immutable-manifest summary. Queue control reports
actual global pause Booleans and the current job store. The GitHub supervisor
uses GET requests only and stops on an operator pause; it cannot undo one.
Explicit recovery requires an unpaused queue, a completed coordinator and its
original store context. It only queues selected identities without any audit or
retained job. Started/failed audits require diagnosis, never age-based reclamation.

The existing bounded parity operation remains disabled by default. Read mode
always performs reciprocal identity lookup even when the source offset page is
empty. Write mode refuses Oracle-only jobs instead of deleting them. Account for
those identities and use ordinary authorized ingestion to establish canonical
Supabase records before performing verified synchronization.
