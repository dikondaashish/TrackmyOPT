import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { verifyCaseEmailOptOutToken } from '@/lib/notifications/case-email-optout';
import { stopCaseEmails } from '@/lib/notifications/transactional/case-updates';
import {
  alertButtonForm,
  alertPage,
  headResponse,
} from '@/lib/visa-bulletin-alerts/html-page';

export const dynamic = 'force-dynamic';

const ROUTE = '/api/email/case-updates/unsubscribe';

const invalid = () =>
  alertPage(
    'Link unavailable',
    '<p>Open the “Stop case emails” link in your TrackMyOPT email, or email support and we will turn them off for you.</p>',
    400
  );

// GET never changes anything: mail scanners open links automatically.
async function handleGET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!verifyCaseEmailOptOutToken(token, getCampaignSigningSecret()))
    return invalid();
  return alertPage(
    'Stop case emails?',
    `<p>You will stop getting emails about changes to the USCIS cases you saved, and the weekly case summary. Your cases stay saved and you can still check them any time.</p>${alertButtonForm(
      `${ROUTE}?token=${encodeURIComponent(token!)}`,
      'Stop case emails'
    )}`
  );
}

// Handles the confirmation button and one-click POSTs from mail apps.
async function handlePOST(request: NextRequest) {
  const userId = verifyCaseEmailOptOutToken(
    request.nextUrl.searchParams.get('token'),
    getCampaignSigningSecret()
  );
  if (!userId) return invalid();
  const result = await stopCaseEmails(getSupabaseAdminClient(), userId);
  if (result === 'ok')
    return alertPage(
      'Case emails are off',
      '<p>You will not get any more emails about your saved cases. You can turn them back on from your case page.</p>'
    );
  Sentry.captureException(new Error('Case email opt-out could not be saved'));
  return alertPage(
    'Please try again',
    '<p>We could not save your choice. Try again shortly, or email support and we will turn them off for you.</p>',
    503
  );
}

export const GET = withSentryApiErrors(
  handleGET,
  '/api/email/case-updates/unsubscribe',
  'GET'
);
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/email/case-updates/unsubscribe',
  'POST'
);
export const HEAD = withSentryApiErrors(
  async () => headResponse(),
  '/api/email/case-updates/unsubscribe',
  'HEAD'
);
