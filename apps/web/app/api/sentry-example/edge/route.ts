import { withSentryApiErrors } from '@/lib/sentry/api-errors';
export const runtime = 'edge';

function handleGET() {
  if (process.env.NODE_ENV !== 'development')
    return new Response(null, { status: 404 });
  throw new Error('TrackMyOPT Sentry edge verification');
}

export const GET = withSentryApiErrors(handleGET, '/api/sentry-example/edge', 'GET');
