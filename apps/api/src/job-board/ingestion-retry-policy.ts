/**
 * Retry policy for ATS source jobs (Bull `attempts: 3`, exponential backoff).
 *
 * - Oracle lock waits that already timed out inside the database
 *   (ORA-00054, ORA-30006, ORA-04021, ORA-02049) are discarded: the same
 *   statement would block on the same lock again.
 * - NJS-123 (our 30-minute call timeout) gets one retry, because a single
 *   stalled round trip can be transient. A second consecutive NJS-123 for the
 *   same job is treated as a persistent block and discarded, so a stuck source
 *   holds a worker for at most two call timeouts instead of three.
 * - Everything else (network resets, deadlocks, HTTP errors) keeps Bull's
 *   normal retries.
 *
 * Discarding only stops further attempts; the source's audit row is already
 * completed as failed with the original error before the job rejects.
 */
export const PERSISTENT_ORACLE_ERROR_CODES = new Set([
  'ORA-00054',
  'ORA-30006',
  'ORA-04021',
  'ORA-02049',
]);
export const ORACLE_CALL_TIMEOUT_CODE = 'NJS-123';

export type SourceRetryDecision = 'retry' | 'discard';

function leadingErrorCode(message: string | null | undefined) {
  return /^(ORA|NJS|DPI)-\d{3,5}/.exec(message?.trim() || '')?.[0] || null;
}

export function sourceRetryDecision(
  error: unknown,
  previousFailedReason?: string | null,
): SourceRetryDecision {
  const code = leadingErrorCode(error instanceof Error ? error.message : null);
  if (!code) return 'retry';
  if (PERSISTENT_ORACLE_ERROR_CODES.has(code)) return 'discard';
  if (
    code === ORACLE_CALL_TIMEOUT_CODE &&
    leadingErrorCode(previousFailedReason) === ORACLE_CALL_TIMEOUT_CODE
  )
    return 'discard';
  return 'retry';
}
