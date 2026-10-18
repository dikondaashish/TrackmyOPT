import * as Sentry from '@sentry/nextjs';

/**
 * Report a policy-news failure with a stable fingerprint. Carries only codes,
 * source names and HTTP statuses, never document text or generated articles.
 */
export function reportPolicyNews(
  area: 'cron' | 'read',
  code: string,
  level: 'error' | 'warning',
  context: { source?: string; status?: number | null; error?: unknown } = {}
) {
  // The class name only: messages can echo provider or document text.
  const errorName =
    context.error instanceof Error && /^[A-Za-z]{1,64}$/.test(context.error.name) ? context.error.name : null;
  Sentry.withScope((scope) => {
    scope.setFingerprint(['policy-news-blog', area, code]);
    scope.setTag('policy_news', code);
    if (context.source) scope.setTag('policy_news_source', context.source);
    scope.setContext('policy_news', {
      code,
      source: context.source ?? null,
      status: context.status ?? null,
      errorName,
    });
    Sentry.captureMessage(`Policy news blog: ${code}`, level);
  });
}
