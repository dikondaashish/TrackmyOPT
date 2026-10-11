import * as Sentry from '@sentry/nextjs';
import { sentryOptions } from '@/lib/sentry/options';

Sentry.init({
  ...sentryOptions(process.env.NEXT_PUBLIC_SENTRY_DSN),
  integrations: [Sentry.captureConsoleIntegration({ levels: ['error'] })],
});
