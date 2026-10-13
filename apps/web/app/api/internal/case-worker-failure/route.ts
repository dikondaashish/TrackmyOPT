import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { verifyWorkerAuth } from '@/lib/api/verify-worker-auth';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import {
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';
async function handlePOST(req: NextRequest) {
  const denied = verifyWorkerAuth(req);
  if (denied) return denied;
  if (
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
  const allowance = await checkRateLimitByUser('render-case-worker', {
    name: 'case-worker-errors',
    limit: 5,
    windowSeconds: 300,
  });
  if (!allowance.success) return rateLimitResponse(allowance);
  Sentry.captureMessage('Render daily case worker failed', 'error');
  if (!(await Sentry.flush(2000)))
    return NextResponse.json({ ok: false }, { status: 503 });
  return NextResponse.json({ ok: true });
}
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/internal/case-worker-failure',
  'POST'
);
