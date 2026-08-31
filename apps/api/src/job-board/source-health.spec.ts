import {
  classifySourceError,
  planSourceFailure,
  planSourceSuccess,
  shouldAttemptSource,
  toSourceHealthDatabaseUpdate,
} from './source-health';

describe('ATS source health', () => {
  it.each([
    ['HTTP 404 company not found', 'http_404', false],
    ['HTTP 429 retry after 60', 'http_429', true],
    ['ats-scrapers timed out after 1000ms', 'timeout', true],
    ['Duplicate external_job_id 42', 'schema_changed', false],
    ['response is not valid JSON', 'malformed_response', true],
  ] as const)('classifies %s', (message, errorType, retryable) => {
    expect(classifySourceError(message)).toEqual({ errorType, retryable });
  });

  it('opens the circuit after the third consecutive failure', () => {
    expect(
      planSourceFailure({
        consecutiveFailures: 2,
        now: new Date('2026-08-30T12:00:00.000Z'),
      }),
    ).toEqual({
      consecutiveFailures: 3,
      circuitState: 'open',
      nextRetryAt: '2026-08-30T14:00:00.000Z',
      circuitOpenedAt: '2026-08-30T12:00:00.000Z',
    });
  });

  it('uses a short retry delay before the circuit opens', () => {
    expect(
      planSourceFailure({
        consecutiveFailures: 0,
        now: new Date('2026-08-30T12:00:00.000Z'),
      }).nextRetryAt,
    ).toBe('2026-08-30T12:05:00.000Z');
  });

  it('resets failure and circuit state after a success', () => {
    expect(planSourceSuccess()).toEqual({
      consecutiveFailures: 0,
      circuitState: 'closed',
      nextRetryAt: null,
      circuitOpenedAt: null,
    });
  });

  it('blocks an open circuit until its retry time and then permits recovery', () => {
    expect(
      shouldAttemptSource({
        circuitState: 'open',
        nextRetryAt: '2026-08-30T14:00:00.000Z',
        now: new Date('2026-08-30T13:59:59.999Z'),
      }),
    ).toBe(false);
    expect(
      shouldAttemptSource({
        circuitState: 'open',
        nextRetryAt: '2026-08-30T14:00:00.000Z',
        now: new Date('2026-08-30T14:00:00.000Z'),
      }),
    ).toBe(true);
  });

  it('serializes health plans using the database column names', () => {
    expect(toSourceHealthDatabaseUpdate(planSourceSuccess())).toEqual({
      consecutive_failures: 0,
      circuit_state: 'closed',
      next_retry_at: null,
      circuit_opened_at: null,
    });
  });
});
