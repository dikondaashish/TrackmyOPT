import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/get-user-id';
import rateLimit from '@/lib/auth/rate-limit';
import {
  diagnosticMessage,
  normalizeDiagnosticSignal,
} from '../../../../../extension/src/shared/diagnostics-protocol';

export const dynamic = 'force-dynamic';

const diagnosticLimiter = rateLimit({ interval: 60_000, name: 'extension-diagnostic' });
const MAX_BODY_CHARACTERS = 600;

async function handleOPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

/**
 * POST /api/extension/diagnostic
 * The Chrome extension has no Sentry SDK. It posts closed-enum failure
 * signals (code, stage, platform, status, version) that become fixed-format
 * Sentry messages. No URLs, labels, values, tokens, documents, or bodies are
 * accepted, so none can be forwarded (docs/ops/SENTRY.md).
 */
async function handlePOST(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  const userId = await getUserId(req).catch(() => null);
  const { isRateLimited, unavailable } = await diagnosticLimiter.check(
    req, userId ? 30 : 60, `extension-diagnostic:${userId ?? 'signed-out'}`,
  );
  if (isRateLimited || unavailable) return NextResponse.json({ ok: true, accepted: false }, { status: 202, headers });
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARACTERS) return NextResponse.json({ ok: false }, { status: 413, headers });
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400, headers }); }
  const signal = normalizeDiagnosticSignal(body);
  if (!signal) return NextResponse.json({ ok: false }, { status: 400, headers });
  // The remote-config poll is silent and retried with backoff, keeping the
  // last-known-good config. A request that never got a response is the user's
  // connection or a timeout, not a TrackMyOPT failure (TRACKMYOPT-2H); an HTTP,
  // JSON or validation failure of the same poll still reports.
  if (signal.code === 'remote_config_fetch_failed' && signal.stage === 'network') {
    return NextResponse.json({ ok: true, accepted: false }, { status: 202, headers });
  }
  Sentry.withScope((scope) => {
    scope.setFingerprint(['chrome-extension', signal.code, signal.stage, signal.platform ?? 'any']);
    scope.setTag('source', 'chrome_extension');
    scope.setTag('extension_code', signal.code);
    scope.setTag('extension_version', signal.extensionVersion);
    Sentry.captureMessage(diagnosticMessage(signal), 'error');
  });
  return NextResponse.json({ ok: true, accepted: true }, { status: 202, headers });
}

export const OPTIONS = withSentryApiErrors(handleOPTIONS, '/api/extension/diagnostic', 'OPTIONS');
export const POST = withSentryApiErrors(handlePOST, '/api/extension/diagnostic', 'POST');
