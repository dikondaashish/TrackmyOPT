import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from 'next/server';
import { corsHeadersWebAndExtension } from '@/lib/api/cors-policy';
import { getUserId } from '@/lib/auth/get-user-id';
import rateLimit from '@/lib/auth/rate-limit';
import {
  createSupabaseSubmissionStore,
  parseSubmissionUpdate,
  recordApplicationSubmission,
} from '@/lib/extension/application-submission';

export const dynamic = 'force-dynamic';

const submissionLimiter = rateLimit({ interval: 60_000, name: 'extension-application-submission' });
const MAX_BODY_CHARACTERS = 8_000;

async function handleOPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: corsHeadersWebAndExtension(req) });
}

/**
 * POST /api/extension/application-submission
 * Records an application the extension confirmed (automatically from
 * supported evidence, or manually by the applicant). Idempotent on attempt_id;
 * stores minimal evidence metadata, never response bodies or form answers.
 */
async function handlePOST(req: NextRequest) {
  const headers = corsHeadersWebAndExtension(req);
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Authorization required' }, { status: 401, headers });

    const { isRateLimited, unavailable } = await submissionLimiter.check(req, 30, `extension-submission:${userId}`);
    if (unavailable) return NextResponse.json({ error: 'Temporarily unavailable' }, { status: 503, headers });
    if (isRateLimited) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers });

    const raw = await req.text();
    if (raw.length > MAX_BODY_CHARACTERS) return NextResponse.json({ error: 'Request body too large' }, { status: 413, headers });
    let body: unknown;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers }); }
    const update = parseSubmissionUpdate(body, Date.now());
    if (!update) return NextResponse.json({ error: 'Invalid submission update' }, { status: 400, headers });

    const result = await recordApplicationSubmission(
      createSupabaseSubmissionStore(), userId, update, new Date().toISOString().slice(0, 10),
    );
    if (!result.ok) return NextResponse.json({ error: 'Application not found' }, { status: 404, headers });
    if (!result.evidenceRecorded) {
      // Tracker updated, evidence table not migrated yet: visible, not fatal.
      console.error('Extension application submission evidence unavailable (stage=processing, status=table_missing)');
    }
    return NextResponse.json({
      ok: true,
      application_id: result.applicationId,
      status: result.status,
      already_recorded: result.alreadyRecorded,
      created: result.created,
    }, { headers });
  } catch (error) {
    console.error('Extension application submission failed (stage=processing)', error instanceof Error ? error.name : 'unknown');
    return NextResponse.json({ error: 'Could not update the tracker' }, { status: 500, headers });
  }
}

export const OPTIONS = withSentryApiErrors(handleOPTIONS, '/api/extension/application-submission', 'OPTIONS');
export const POST = withSentryApiErrors(handlePOST, '/api/extension/application-submission', 'POST');
