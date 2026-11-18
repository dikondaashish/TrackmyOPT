import { withSentryApiErrors } from '@/lib/sentry/api-errors';
/**
 * Day-3 progress email for accounts on the paid Pro introduction: how many
 * scheduled checks ran and whether anything changed.
 *
 * Vercel Cron daily (see vercel.json), after the morning case checks.
 *   GET /api/cron/trial-progress-emails
 *   Authorization: Bearer CRON_SECRET
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { findTrialProgressCandidates } from '@/lib/billing/trial-progress';
import { sendTrialProgressEmail } from '@/lib/notifications/transactional/case-updates';
import { logIdPrefix, secureLog } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function handleGET(req: NextRequest) {
  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  let sent = 0;
  let skipped = 0;
  let failed = 0;
  try {
    const candidates = await findTrialProgressCandidates(supabase);
    for (const candidate of candidates) {
      const result = await sendTrialProgressEmail({
        supabase,
        userId: candidate.userId,
        toEmail: candidate.email,
        firstName: candidate.firstName,
        checks: candidate.checks,
        cases: candidate.cases,
        changes: candidate.changes,
        introEndDate: candidate.introEndDate,
        trialStartedId: candidate.trialStartedId,
      });
      if (!result.ok) {
        failed += 1;
        secureLog.error(
          'trial-progress-emails send failed:',
          logIdPrefix(candidate.userId)
        );
      } else if (result.skipped) skipped += 1;
      else sent += 1;
    }
  } catch {
    console.error('Trial progress emails failed');
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 }
    );
  }
  // A failed send is reported through the 5xx so it is not silently lost.
  return NextResponse.json(
    { ok: failed === 0, sent, skipped, failed },
    { status: failed ? 503 : 200 }
  );
}

export const GET = withSentryApiErrors(
  handleGET,
  '/api/cron/trial-progress-emails',
  'GET'
);
export const POST = withSentryApiErrors(
  handleGET,
  '/api/cron/trial-progress-emails',
  'POST'
);
