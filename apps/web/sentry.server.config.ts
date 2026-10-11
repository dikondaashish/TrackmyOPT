import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from '@/lib/sentry/options';

Sentry.init({
  ...sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN),
  // Also report handled failures that routes log before returning an error.
  integrations: [Sentry.captureConsoleIntegration({ levels: ['error'] })],
});
