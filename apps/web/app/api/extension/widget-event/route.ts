import { NextRequest, NextResponse } from 'next/server';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/get-user-id';
import rateLimit from '@/lib/auth/rate-limit';
import { captureServerEvent } from '@/lib/posthog-server';
import { normalizeExtensionWidgetAnalytics } from '@/lib/extension/widget-analytics';

export const dynamic = 'force-dynamic';

const widgetEventLimiter = rateLimit({ interval: 60_000, name: 'extension-widget-event' });
const MAX_BODY_LENGTH = 4_000;

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

/**
 * Authenticated, low-cardinality analytics bridge for the job-board content
 * script. The Bearer token and PostHog key stay off third-party pages, while a
 * strict allowlist prevents job URLs, descriptions, or company data entering
 * analytics accidentally.
 */
export async function POST(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401, headers }
      );
    }

    const { isRateLimited, unavailable } = await widgetEventLimiter.check(
      req,
      120,
      `extension-widget:${userId}`
    );
    if (unavailable) {
      // Telemetry is best-effort. Drop the event while the durable limiter is
      // unavailable instead of turning an analytics dependency into a 5xx
      // failure for the extension.
      return NextResponse.json(
        { ok: true, accepted: false },
        { status: 202, headers }
      );
    }
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many events' },
        { status: 429, headers }
      );
    }

    const raw = await req.text();
    if (raw.length > MAX_BODY_LENGTH) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413, headers }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400, headers }
      );
    }
    const event = normalizeExtensionWidgetAnalytics(parsed);
    if (!event) {
      return NextResponse.json(
        { error: 'Invalid widget event' },
        { status: 400, headers }
      );
    }

    await captureServerEvent(userId, event.event, event.properties);
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    console.error('Extension widget analytics error:', error);
    return NextResponse.json(
      { error: 'Analytics unavailable' },
      { status: 500, headers }
    );
  }
}
