import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from '@/lib/sentry/options';
import { apiHttpClientIntegration } from '@/lib/sentry/http-client';
import { initPostHogBrowser } from '@/lib/posthog/posthog-browser';
import { registerCrossOriginErrorHandler } from '@/lib/cross-origin-error-handler';

registerCrossOriginErrorHandler();

try {
  Sentry.init({
    ...sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN),
    integrations: [
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
      apiHttpClientIntegration(window.location.origin),
    ],
  });
} catch (error) {
  console.warn('Third-party init failed: Sentry', error);
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

try {
  initPostHogBrowser();
} catch (error) {
  console.warn('Third-party init failed: PostHog', error);
}
