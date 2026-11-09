import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { escapeHtml } from '@/lib/notifications/transactional/formatting';
import { latestBulletin } from '@/data/visa-bulletin/employment-cutoffs';
import { confirm, describeStatus, verifyAlertToken } from '@/lib/visa-bulletin-alerts/alerts';
import { alertButtonForm, alertPage, headResponse } from '@/lib/visa-bulletin-alerts/html-page';

export const dynamic = 'force-dynamic';

const invalid = () =>
  alertPage('Link unavailable', '<p>This confirmation link is not valid. Sign up again from any Visa Bulletin article on TrackMyOPT.</p>', 400);

// GET never changes anything: mail scanners open links automatically.
async function handleGET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (!verifyAlertToken('confirm', token, getCampaignSigningSecret())) return invalid();
  return alertPage(
    'Confirm your Visa Bulletin alert',
    `<p>Press the button to start getting one email when each new Visa Bulletin is published.</p>${alertButtonForm(
      `/api/visa-bulletin-alerts/confirm?token=${encodeURIComponent(token!)}`,
      'Confirm my alert'
    )}`
  );
}

async function handlePOST(request: NextRequest) {
  const id = verifyAlertToken('confirm', request.nextUrl.searchParams.get('token'), getCampaignSigningSecret());
  if (!id) return invalid();
  try {
    const outcome = await confirm(getSupabaseAdminClient(), id);
    if (outcome.result === 'missing') {
      return alertPage('Link expired', '<p>Unconfirmed alerts are removed after 7 days. Sign up again from any Visa Bulletin article on TrackMyOPT.</p>', 404);
    }
    const bulletin = latestBulletin();
    const { sub } = outcome;
    const status = describeStatus(bulletin, sub.category, sub.chargeability, sub.priority_date);
    return alertPage(
      'Your alert is on',
      `<p>We will email you when the next Visa Bulletin is published. Here is where you stand in the ${escapeHtml(bulletin.label)} bulletin:</p><p><strong>${escapeHtml(status.headline)}</strong></p><ul>${status.lines
        .map((line) => `<li>${escapeHtml(line)}</li>`)
        .join('')}</ul><p style="color:#5b6b82;font-size:14px">General information, not legal advice. Every alert email has a one-click unsubscribe link.</p>`
    );
  } catch (error) {
    Sentry.captureException(error);
    return alertPage('Please try again', '<p>We could not save your confirmation. Try the link again in a few minutes.</p>', 503);
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/visa-bulletin-alerts/confirm', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/visa-bulletin-alerts/confirm', 'POST');
export const HEAD = withSentryApiErrors(async () => headResponse(), '/api/visa-bulletin-alerts/confirm', 'HEAD');
