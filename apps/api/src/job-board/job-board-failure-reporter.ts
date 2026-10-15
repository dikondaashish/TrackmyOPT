import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Failure kinds accepted by /api/internal/job-board-worker-failure/[kind]. */
export type JobBoardWorkerFailure =
  | 'queue-error'
  | 'source-stalled'
  | 'redis-eviction';

/** One signal per kind per process in this window; the web route also limits. */
export const FAILURE_REPORT_COOLDOWN_MS = 5 * 60_000;

/**
 * Sends a fixed, body-free signal to the web app, which reports it to Sentry.
 * The worker runs no Sentry SDK, so this is how failures that never reach an
 * ingestion audit row become visible. Never throws: monitoring must not break
 * ingestion.
 */
@Injectable()
export class JobBoardFailureReporter {
  private readonly logger = new Logger(JobBoardFailureReporter.name);
  private readonly lastSentAt = new Map<JobBoardWorkerFailure, number>();
  /** Overridable in tests only. */
  fetchImpl: typeof fetch = (
    input: Parameters<typeof fetch>[0],
    init?: RequestInit,
  ) => fetch(input, init);
  clock: () => number = () => Date.now();

  constructor(private readonly config: ConfigService) {}

  async report(kind: JobBoardWorkerFailure) {
    const now = this.clock();
    const last = this.lastSentAt.get(kind);
    if (last !== undefined && now - last < FAILURE_REPORT_COOLDOWN_MS) return;
    this.lastSentAt.set(kind, now);
    const key = this.config.get<string>('API_SECRET_KEY');
    const site =
      this.config.get<string>('NEXT_PUBLIC_SITE_URL') ||
      'https://www.trackmyopt.com';
    if (!key) {
      this.logger.error('Job-board worker monitoring authentication missing');
      return;
    }
    try {
      const response = await this.fetchImpl(
        `${site}/api/internal/job-board-worker-failure/${kind}`,
        {
          method: 'POST',
          headers: { 'x-api-key': key },
          signal: AbortSignal.timeout(5000),
        },
      );
      if (!response.ok && response.status !== 429)
        this.logger.error('Job-board worker error reporting unavailable');
    } catch {
      this.logger.error('Job-board worker error reporting unavailable');
    }
  }
}
