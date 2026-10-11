import { withSentryApiErrors } from '@/lib/sentry/api-errors';
function handleGET(request?: Request) {
  if (process.env.NODE_ENV !== 'development')
    return new Response(null, { status: 404 });
  if (request && new URL(request.url).searchParams.get('handled') === '1') {
    return Response.json(
      { error: 'Synthetic handled API failure' },
      { status: 503 }
    );
  }
  throw new Error('TrackMyOPT Sentry server verification');
}

export const GET = withSentryApiErrors(handleGET, '/api/sentry-example', 'GET');
