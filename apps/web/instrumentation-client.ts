import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from '@/lib/sentry/options';
import { apiHttpClientIntegration } from '@/lib/sentry/http-client';
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

// PostHog is not started here: lib/privacy/integrations.ts initializes it only
// after analytics consent (components/privacy/PrivacyProvider.tsx).
