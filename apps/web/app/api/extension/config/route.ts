import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/get-user-id';
import rateLimit from '@/lib/auth/rate-limit';
import { etagMatches, loadActiveRemoteConfig } from '@/lib/extension/remote-config-store';

export const dynamic = 'force-dynamic';

const configLimiter = rateLimit({ interval: 60_000, name: 'extension-remote-config' });

async function handleOPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

/**
 * GET /api/extension/config
 * Authenticated delivery of the active declarative extension config.
 * 200 + ETag with a body, 304 when If-None-Match matches, 204 when no config
 * is active (extensions then keep their last-known-good config).
 */
async function handleGET(req: NextRequest) {
  const headers: Record<string, string> = {
    ...corsHeadersWebAndExtension(req),
    'Cache-Control': 'private, no-cache',
    Vary: 'Authorization',
  };
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Authorization required' }, { status: 401, headers });
    const { isRateLimited, unavailable } = await configLimiter.check(req, 30, `extension-config:${userId}`);
    if (unavailable) return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503, headers });
    if (isRateLimited) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers });

    const active = await loadActiveRemoteConfig();
    if (active.kind === 'none') return new NextResponse(null, { status: 204, headers });
    if (active.kind === 'invalid') {
      console.error('Extension remote config failed validation (stage=validation)');
      return NextResponse.json({ error: 'Config unavailable' }, { status: 500, headers });
    }
    headers.ETag = active.etag;
    if (etagMatches(req.headers.get('if-none-match'), active.etag)) {
      return new NextResponse(null, { status: 304, headers });
    }
    return new NextResponse(active.body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Extension remote config load failed (stage=processing)', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Config unavailable' }, { status: 500, headers });
  }
}

export const OPTIONS = withSentryApiErrors(handleOPTIONS, '/api/extension/config', 'OPTIONS');
export const GET = withSentryApiErrors(handleGET, '/api/extension/config', 'GET');
