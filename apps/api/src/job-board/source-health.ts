export type SourceErrorType =
  | 'http_404'
  | 'http_403'
  | 'http_429'
  | 'http_5xx'
  | 'timeout'
  | 'schema_changed'
  | 'invalid_board'
  | 'company_mismatch'
  | 'blocked'
  | 'robots_disallowed'
  | 'malformed_response'
  | 'unknown';

const OPEN_CIRCUIT_AFTER = 3;
const RETRY_DELAY_MS = 5 * 60_000;
const OPEN_CIRCUIT_DELAY_MS = 2 * 60 * 60_000;

export function classifySourceError(message: string): {
  errorType: SourceErrorType;
  retryable: boolean;
} {
  const value = message.toLowerCase();
  if (/\b404\b|not found/.test(value)) {
    return { errorType: 'http_404', retryable: false };
  }
  if (/\b403\b/.test(value)) return { errorType: 'http_403', retryable: false };
  if (/\b429\b|rate.?limit/.test(value)) {
    return { errorType: 'http_429', retryable: true };
  }
  if (/\b5\d\d\b/.test(value))
    return { errorType: 'http_5xx', retryable: true };
  if (/timed out|timeout/.test(value)) {
    return { errorType: 'timeout', retryable: true };
  }
  if (/duplicate external_job_id|invalid normalized job schema/.test(value)) {
    return { errorType: 'schema_changed', retryable: false };
  }
  if (/invalid scraper (response|metadata)|not valid json/.test(value)) {
    return { errorType: 'malformed_response', retryable: true };
  }
  return { errorType: 'unknown', retryable: true };
}

export function planSourceFailure(input: {
  consecutiveFailures: number;
  now: Date;
}) {
  const consecutiveFailures = input.consecutiveFailures + 1;
  const opensCircuit = consecutiveFailures >= OPEN_CIRCUIT_AFTER;
  const delayMs = opensCircuit ? OPEN_CIRCUIT_DELAY_MS : RETRY_DELAY_MS;
  return {
    consecutiveFailures,
    circuitState: opensCircuit ? ('open' as const) : ('closed' as const),
    nextRetryAt: new Date(input.now.getTime() + delayMs).toISOString(),
    circuitOpenedAt: opensCircuit ? input.now.toISOString() : null,
  };
}

export function planSourceSuccess() {
  return {
    consecutiveFailures: 0,
    circuitState: 'closed' as const,
    nextRetryAt: null,
    circuitOpenedAt: null,
  };
}

export function toSourceHealthDatabaseUpdate(
  plan:
    | ReturnType<typeof planSourceFailure>
    | ReturnType<typeof planSourceSuccess>,
) {
  return {
    consecutive_failures: plan.consecutiveFailures,
    circuit_state: plan.circuitState,
    next_retry_at: plan.nextRetryAt,
    circuit_opened_at: plan.circuitOpenedAt,
  };
}

export function shouldAttemptSource(input: {
  circuitState: 'closed' | 'open';
  nextRetryAt: string | null;
  now: Date;
}) {
  return (
    input.circuitState !== 'open' ||
    !input.nextRetryAt ||
    new Date(input.nextRetryAt).getTime() <= input.now.getTime()
  );
}
