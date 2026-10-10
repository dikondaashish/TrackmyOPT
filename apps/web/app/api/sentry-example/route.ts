export function GET() {
  if (process.env.NODE_ENV !== 'development')
    return new Response(null, { status: 404 });
  throw new Error('TrackMyOPT Sentry server verification');
}
