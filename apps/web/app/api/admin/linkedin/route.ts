import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { easternDateParts, getLinkedInAdmin, linkedInAppConfig } from '@/lib/linkedin/config';
import { LinkedInApiError, linkedInPostUrl } from '@/lib/linkedin/api';
import { isLinkedInTokenEncryptionConfigured } from '@/lib/linkedin/token-crypto';
import {
  buildDailyDraft,
  deletePageConnection,
  listRecentPosts,
  LinkedInPostError,
  loadDailyPost,
  loadPageConnection,
  publishDailyPost,
  updatePageSettings,
} from '@/lib/linkedin/daily-post-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const noStore = { 'Cache-Control': 'no-store' };
const RECONNECT_WARNING_MS = 7 * 86_400_000;

// Outcomes the admin can act on; anything else is an unexpected failure.
const EXPECTED_CODES = new Set(['not_connected', 'reconnect_required', 'already_publishing', 'no_jobs_found']);

async function adminOrDenied() {
  const admin = await getLinkedInAdmin();
  if (admin.status === 'admin') return { admin };
  // The settings card hides itself on 403; signed-out users get 401.
  return {
    denied: NextResponse.json(
      { admin: false },
      { status: admin.status === 'signed_out' ? 401 : 403, headers: noStore },
    ),
  };
}

function failure(error: unknown, action: string) {
  const code =
    error instanceof LinkedInPostError || error instanceof LinkedInApiError ? error.code : 'unexpected_error';
  if (!EXPECTED_CODES.has(code)) {
    Sentry.withScope((scope) => {
      scope.setFingerprint(['linkedin-daily-post', 'admin', code]);
      scope.setTag('linkedin_post', code);
      scope.setContext('linkedin_post', {
        action,
        code,
        status: error instanceof LinkedInApiError ? error.status : null,
      });
      Sentry.captureMessage(`LinkedIn admin ${action} failed: ${code}`, 'error');
    });
  }
  const status = code === 'already_publishing' ? 409 : EXPECTED_CODES.has(code) ? 422 : 502;
  return NextResponse.json({ ok: false, error: code }, { status, headers: noStore });
}

/** GET /api/admin/linkedin — connection, today's draft and recent posts. */
async function handleGET() {
  const { denied } = await adminOrDenied();
  if (denied) return denied;

  const now = new Date();
  const { date, hour } = easternDateParts(now);
  const [connection, today, recent] = await Promise.all([
    loadPageConnection(),
    loadDailyPost(date),
    listRecentPosts(7),
  ]);
  return NextResponse.json(
    {
      admin: true,
      configured: Boolean(linkedInAppConfig()) && isLinkedInTokenEncryptionConfigured(),
      today: date,
      easternHour: hour,
      connection,
      // Without a refresh token LinkedIn access lasts 60 days.
      reconnectSoon: Boolean(
        connection &&
          !connection.hasRefreshToken &&
          Date.parse(connection.accessTokenExpiresAt) - now.getTime() < RECONNECT_WARNING_MS,
      ),
      draft: today,
      recent: recent.map((post) => ({
        postDate: post.postDate,
        status: post.status,
        shownCount: post.shownCount,
        totalCount: post.items.length,
        errorCode: post.errorCode,
        publishedAt: post.publishedAt,
        postUrl: post.linkedinPostUrn ? linkedInPostUrl(post.linkedinPostUrn) : null,
      })),
    },
    { headers: noStore },
  );
}

/**
 * POST /api/admin/linkedin
 *   { action: "settings", autoPublish?, enabled? }
 *   { action: "draft" }       → (re)build today's draft
 *   { action: "publish" }     → publish today's draft now
 *   { action: "disconnect" }
 */
async function handlePOST(req: NextRequest) {
  const { admin, denied } = await adminOrDenied();
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400, headers: noStore });
  }
  const { date } = easternDateParts(new Date());
  const action = typeof body.action === 'string' ? body.action : '';

  try {
    if (action === 'settings') {
      await updatePageSettings({
        autoPublish: typeof body.autoPublish === 'boolean' ? body.autoPublish : undefined,
        enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
      });
      return NextResponse.json({ ok: true, connection: await loadPageConnection() }, { headers: noStore });
    }
    if (action === 'draft') {
      return NextResponse.json({ ok: true, draft: await buildDailyDraft(date) }, { headers: noStore });
    }
    if (action === 'publish') {
      const app = linkedInAppConfig();
      if (!app) return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503, headers: noStore });
      const post = await publishDailyPost(app, date, admin.email);
      return NextResponse.json(
        { ok: true, draft: post, postUrl: post.linkedinPostUrn ? linkedInPostUrl(post.linkedinPostUrn) : null },
        { headers: noStore },
      );
    }
    if (action === 'disconnect') {
      await deletePageConnection();
      return NextResponse.json({ ok: true }, { headers: noStore });
    }
  } catch (error) {
    return failure(error, action);
  }
  return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400, headers: noStore });
}

export const GET = withSentryApiErrors(handleGET, '/api/admin/linkedin', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/admin/linkedin', 'POST');
