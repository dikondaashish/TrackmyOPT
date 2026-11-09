import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { unsubscribe, verifyAlertToken } from '@/lib/visa-bulletin-alerts/alerts';
import { alertButtonForm, alertPage, headResponse } from '@/lib/visa-bulletin-alerts/html-page';

export const dynamic = 'force-dynamic';

const invalid = () =>
  alertPage('Link unavailable', '<p>Open the unsubscribe link in your Visa Bulletin alert email, or email support and we will remove you.</p>', 400);

// GET never changes anything: mail scanners open links automatically.
async function handleGET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!verifyAlertToken('unsubscribe', token, getCampaignSigningSecret())) return invalid();
  return alertPage(
    'Stop Visa Bulletin alerts?',
    `<p>You will stop getting the monthly priority-date email, and we will delete your alert.</p>${alertButtonForm(
      `/api/visa-bulletin-alerts/unsubscribe?token=${encodeURIComponent(token!)}`,
      'Unsubscribe'
    )}`
  );
}

// Handles the confirmation button and RFC 8058 one-click POSTs from mail apps.
async function handlePOST(request: NextRequest) {
  const id = verifyAlertToken('unsubscribe', request.nextUrl.searchParams.get('token'), getCampaignSigningSecret());
  if (!id) return invalid();
  try {
    await unsubscribe(getSupabaseAdminClient(), id);
    return alertPage('You’re unsubscribed', '<p>Your Visa Bulletin alert is deleted. You will not get any more of these emails.</p>');
  } catch (error) {
    Sentry.captureException(error);
    return alertPage('Please try again', '<p>We could not save your choice. Try again shortly, or email support and we will remove you.</p>', 503);
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/visa-bulletin-alerts/unsubscribe', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/visa-bulletin-alerts/unsubscribe', 'POST');
export const HEAD = withSentryApiErrors(async () => headResponse(), '/api/visa-bulletin-alerts/unsubscribe', 'HEAD');
