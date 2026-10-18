import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { easternDateParts, linkedInAppConfig } from '@/lib/linkedin/config';
import { LinkedInApiError } from '@/lib/linkedin/api';
import {
  buildDailyDraft,
  LinkedInPostError,
  loadDailyPost,
  loadPageConnection,
  publishDailyPost,
} from '@/lib/linkedin/daily-post-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/** The post goes out at 2:30 PM New York time, LinkedIn's afternoon peak. */
const POST_HOUR_EASTERN = 14;
const TOKEN_WARNING_MS = 7 * 86_400_000;

function report(code: string, level: 'error' | 'warning', error?: unknown) {
  Sentry.withScope((scope) => {
    scope.setFingerprint(['linkedin-daily-post', 'cron', code]);
    scope.setTag('linkedin_post', code);
    scope.setContext('linkedin_post', {
      code,
      status: error instanceof LinkedInApiError ? error.status : null,
    });
    Sentry.captureMessage(`LinkedIn daily jobs post: ${code}`, level);
  });
}

/**
 * Daily LinkedIn jobs post. vercel.json fires at 18:30 and 19:30 UTC so one
 * firing lands at 14:30 New York time in both EDT and EST; the other is a
 * no-op. Builds today's draft and, when auto-publish is on, posts it.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;

  const now = new Date();
  const { date, hour } = easternDateParts(now);
  if (hour !== POST_HOUR_EASTERN) return NextResponse.json({ ok: true, skipped: 'outside-slot' });

  const app = linkedInAppConfig();
  const connection = await loadPageConnection();
  if (!app || !connection) return NextResponse.json({ ok: true, skipped: 'not-connected' });
  if (!connection.enabled) return NextResponse.json({ ok: true, skipped: 'disabled' });

  // Without a refresh token the admin must reconnect every 60 days.
  if (!connection.hasRefreshToken && Date.parse(connection.accessTokenExpiresAt) - now.getTime() < TOKEN_WARNING_MS) {
    report('reconnect_soon', 'warning');
  }

  try {
    const existing = await loadDailyPost(date);
    // Keep a draft the admin already reviewed today; build one otherwise.
    const draft = existing ?? (await buildDailyDraft(date, now));
    if (!connection.autoPublish) {
      return NextResponse.json({ ok: true, status: draft.status, autoPublish: false });
    }
    const post = await publishDailyPost(app, date, 'cron', now);
    return NextResponse.json({ ok: true, status: post.status, shown: post.shownCount });
  } catch (error) {
    const code =
      error instanceof LinkedInPostError || error instanceof LinkedInApiError ? error.code : 'unexpected_error';
    if (code === 'already_publishing') return NextResponse.json({ ok: true, skipped: 'already-publishing' });
    report(code, code === 'no_jobs_found' ? 'warning' : 'error', error);
    // Reported above; HTTP 200 keeps the API wrapper from opening a second issue.
    return NextResponse.json({ ok: false, error: code });
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/linkedin-daily-post', 'GET');
