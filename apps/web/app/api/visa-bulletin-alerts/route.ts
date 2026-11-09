import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimitByIP, rateLimitResponse } from '@/lib/auth/api-rate-limit';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getCampaignSigningSecret } from '@/lib/notifications/campaign-tracking';
import { getSmtpFromHeader, sendMailWithRetry } from '@/lib/notifications/email-smtp';
import { getAppBaseUrl } from '@/lib/notifications/transactional/queue';
import { subscribe, subscribeSchema } from '@/lib/visa-bulletin-alerts/alerts';

export const dynamic = 'force-dynamic';

const LIMIT = { limit: 5, windowSeconds: 60 * 60, name: 'visa-bulletin-alerts' } as const;

/**
 * Starts a Visa Bulletin priority-date alert (double opt-in).
 * Every accepted request gets the same reply, so the form never reveals
 * whether an address is already subscribed.
 */
async function handlePOST(req: NextRequest) {
  const limited = await checkRateLimitByIP(req, LIMIT);
  if (!limited.success) return rateLimitResponse(limited, 'Too many requests. Try again later.');

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
  }
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Check the email address and dates and try again.' }, { status: 400 });
  }

  const secret = getCampaignSigningSecret();
  if (!secret) {
    Sentry.captureMessage('Visa Bulletin alerts: email link signing secret is not configured', 'error');
    return NextResponse.json({ ok: false, error: 'Alerts are unavailable right now.' }, { status: 503 });
  }

  try {
    const result = await subscribe(parsed.data, {
      supabase: getSupabaseAdminClient(),
      sendMail: (options) => sendMailWithRetry(options, 2),
      from: getSmtpFromHeader(),
      baseUrl: getAppBaseUrl(),
      secret,
    });
    if (result === 'failed') {
      Sentry.captureMessage('Visa Bulletin alerts: confirmation email was not accepted', 'error');
      return NextResponse.json({ ok: false, error: 'We could not send the email. Try again shortly.' }, { status: 502 });
    }
    if (result === 'limit') {
      return NextResponse.json({ ok: false, error: `You can follow up to 3 categories with one email address.` }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Messages from our own code carry only Postgres codes; SMTP errors may quote the address.
    Sentry.captureException(new Error(`Visa Bulletin alert subscribe failed (${error instanceof Error ? error.name : 'unknown'})`));
    return NextResponse.json({ ok: false, error: 'Something went wrong. Try again shortly.' }, { status: 500 });
  }
}

export const POST = withSentryApiErrors(handlePOST, '/api/visa-bulletin-alerts', 'POST');
