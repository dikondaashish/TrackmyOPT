import { withSentryApiErrors } from '@/lib/sentry/api-errors';
/**
 * Visa Bulletin priority-date alerts.
 *
 * Hourly on Vercel Cron. Sends the newest bulletin in
 * data/visa-bulletin/employment-cutoffs.ts to every confirmed subscriber who
 * has not had it yet, and deletes alerts left unconfirmed for 7 days. With no
 * new bulletin it only runs two small queries.
 */
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { getSmtpFromHeader, sendMailWithRetry } from '@/lib/notifications/email-smtp';
import { getAppBaseUrl } from '@/lib/notifications/transactional/queue';
import { sendDueAlerts } from '@/lib/visa-bulletin-alerts/alerts';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

async function handleGET(req: NextRequest) {
  const authError = verifyCronAuth(req);
  if (authError) return authError;

  const secret = getCampaignSigningSecret();
  if (!secret) {
    Sentry.captureMessage('Visa Bulletin alerts cron: email link signing secret is not configured', 'error');
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  try {
    const result = await sendDueAlerts({
      supabase: getSupabaseAdminClient(),
      // One attempt: retrying an ambiguous SMTP result can deliver duplicates.
      sendMail: (options) => sendMailWithRetry(options, 1),
      from: getSmtpFromHeader(),
      baseUrl: getAppBaseUrl(),
      secret,
      onError: (error) => Sentry.captureException(error),
    });
    return NextResponse.json(result);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Visa Bulletin alerts run failed' }, { status: 500 });
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/visa-bulletin-alerts', 'GET');
