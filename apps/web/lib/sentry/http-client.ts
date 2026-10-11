import * as Sentry from '@sentry/nextjs';

/** Track our API responses; exclude third-party scripts and telemetry endpoints. */
export function apiHttpClientIntegration(origin: string) {
  const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return Sentry.httpClientIntegration({
    failedRequestStatusCodes: [[500, 599]],
    failedRequestTargets: [new RegExp(`^${escapedOrigin}/api/`)],
  });
}
