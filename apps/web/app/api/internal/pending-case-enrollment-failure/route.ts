import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import {
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';

async function handlePOST(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;
  // This endpoint accepts no caller-supplied diagnostic or applicant fields.
  if (req.body !== null || req.nextUrl.search)
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  const allowance = await checkRateLimitByUser('render-pending-case-worker', {
    name: 'pending-case-enrollment-errors',
    limit: 5,
    windowSeconds: 300,
  });
  if (!allowance.success) return rateLimitResponse(allowance);
  Sentry.captureMessage('Render pending case email enrollment failed', 'error');
  if (!(await Sentry.flush(2_000)))
    return NextResponse.json(
      { error: 'Monitoring unavailable' },
      { status: 503 }
    );
  return NextResponse.json({ ok: true });
}

export const POST = withSentryApiErrors(
  handlePOST,
  '/api/internal/pending-case-enrollment-failure',
  'POST'
);
