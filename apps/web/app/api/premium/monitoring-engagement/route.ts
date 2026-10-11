import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth/get-user-id';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { isKnownAutomatedEmailRequest } from '@/lib/notifications/campaign-tracking';
import {
  pendingCaseEmailsEnabled,
  verifyMonitoringToken,
  loadCasePromotionRecipient,
} from '@/lib/notifications/pending-case-email';
import { captureServerEvent } from '@/lib/posthog-server';
import {
  checkRateLimitByUser,
  rateLimitResponse,
} from '@/lib/auth/api-rate-limit';

async function handlePOST(req: NextRequest) {
  if (
    req.headers.get('origin') !== req.nextUrl.origin ||
    isKnownAutomatedEmailRequest(req.headers)
  )
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!pendingCaseEmailsEnabled())
    return NextResponse.json(
      { error: 'Offer email experiment unavailable' },
      { status: 409 }
    );
  if (Number(req.headers.get('content-length') ?? '0') > 2048)
    return NextResponse.json({ error: 'Invalid request' }, { status: 413 });
  const body = await req.json().catch(() => null);
  const messageId = verifyMonitoringToken(
    typeof body?.token === 'string' ? body.token : null
  );
  if (!messageId)
    return NextResponse.json(
      { error: 'Link expired or invalid' },
      { status: 400 }
    );
  try {
    const db = getSupabaseAdminClient();
    const message = await db
      .from('email_queue')
      .select('id')
      .eq('id', messageId)
      .eq('user_id', userId)
      .eq('status', 'sent')
      .in('email_type', ['pending_case_first', 'pending_case_followup'])
      .maybeSingle();
    if (message.error)
      throw new Error('Monitoring message verification unavailable');
    if (!message.data)
      return NextResponse.json(
        { error: 'This offer is no longer eligible' },
        { status: 409 }
      );
    const allowance = await checkRateLimitByUser(userId, {
      name: 'monitoring-offer',
      limit: 10,
      windowSeconds: 60,
    });
    if (!allowance.success) return rateLimitResponse(allowance);
    if (!(await loadCasePromotionRecipient(db, userId)))
      return NextResponse.json(
        { error: 'This offer is no longer eligible' },
        { status: 409 }
      );
    const engaged = await db.rpc('engage_pending_case_offer', {
      p_user_id: userId,
      p_message_id: messageId,
    });
    if (engaged.error)
      throw new Error('Monitoring activity recording unavailable');
    if (engaged.data)
      await captureServerEvent(userId, 'pending_case_offer_engaged', {
        experiment: 'pending_case_v1',
        source: 'pending_case_email',
      });
    return NextResponse.json({ ok: true });
  } catch {
    console.error('Monitoring offer engagement failed');
    return NextResponse.json(
      { error: 'Unable to verify monitoring options' },
      { status: 503 }
    );
  }
}
export const POST = withSentryApiErrors(
  handlePOST,
  '/api/premium/monitoring-engagement',
  'POST'
);
