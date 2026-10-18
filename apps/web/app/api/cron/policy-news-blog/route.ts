import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { reportPolicyNews } from '@/lib/policy-news/monitoring';
import { PolicyNewsStoreError } from '@/lib/policy-news/store';
import { runPolicyNewsBlog } from '@/lib/policy-news/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Automatic OPT / STEM OPT policy-news blog. vercel.json fires every two
 * hours: new Federal Register, USCIS and Study in the States notices are
 * written up by Gemini and published at /blog/<slug> without review.
 * POLICY_NEWS_BLOG_DISABLED=true stops it.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;
  if (process.env.POLICY_NEWS_BLOG_DISABLED === 'true') {
    return NextResponse.json({ ok: true, skipped: 'disabled' });
  }

  try {
    const summary = await runPolicyNewsBlog(new Date());
    return NextResponse.json({ ok: true, ...summary });
  } catch (error) {
    const code = error instanceof PolicyNewsStoreError ? error.code : 'unexpected_error';
    reportPolicyNews('cron', code, 'error', { error });
    // Reported above; HTTP 200 keeps the API wrapper from opening a second issue.
    return NextResponse.json({ ok: false, error: code });
  }
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/policy-news-blog', 'GET');
