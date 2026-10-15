import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { verifyWorkerAuth } from '@/lib/api/verify-worker-auth';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import {
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';

/**
 * Fixed, body-free failure signals from the Render job-board worker, which
 * does not run a Sentry SDK. The path names one known kind; nothing the
 * caller sends is forwarded to Sentry.
 */
const MESSAGES = {
  'queue-error': 'Render job-board worker: Bull/Redis queue error',
  'source-stalled': 'Render job-board worker: ingestion source job stalled',
  'redis-eviction': 'Render job-board worker: Redis maxmemory-policy is not noeviction',
} as const;

type Kind = keyof typeof MESSAGES;

function isKind(value: string): value is Kind {
  return Object.prototype.hasOwnProperty.call(MESSAGES, value);
}

async function handlePOST(
  req: NextRequest,
  context: { params: Promise<{ kind: string }> }
) {
  const denied = verifyWorkerAuth(req);
  if (denied) return denied;
  const { kind } = await context.params;
  if (
    !isKind(kind) ||
    req.nextUrl.search ||
    Number(req.headers.get('content-length') ?? '0') > 0
  )
    return NextResponse.json({ ok: false }, { status: 400 });
  if (req.body) {
    const reader = req.body.getReader();
    const first = await reader.read();
    await reader.cancel();
    if (!first.done) return NextResponse.json({ ok: false }, { status: 400 });
  }
  const allowance = await checkRateLimitByUser(`render-job-board-${kind}`, {
    name: 'job-board-worker-errors',
    limit: 5,
    windowSeconds: 300,
  });
  if (!allowance.success) return rateLimitResponse(allowance);
  Sentry.withScope((scope) => {
    scope.setFingerprint(['job-board-worker', kind]);
    scope.setTag('job_board_worker', kind);
    Sentry.captureMessage(MESSAGES[kind], 'error');
  });
  if (!(await Sentry.flush(2000)))
    return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true });
}

export const POST = withSentryApiErrors(
  handlePOST,
  '/api/internal/job-board-worker-failure/[kind]',
  'POST'
);
