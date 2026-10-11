import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import {
  pendingCaseEmailsEnabled,
  requireCasePromotionProvider,
  sendCasePromotion,
  type CasePromotionKind,
} from '@/lib/notifications/pending-case-email';
import { captureServerEvent } from '@/lib/posthog-server';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;
async function handleGET(req: NextRequest) {
  const started = Date.now();
  const auth = verifyCronAuth(req);
  if (auth) return auth;
  if (!pendingCaseEmailsEnabled())
    return NextResponse.json({ ok: true, disabled: true, sent: 0 });
  let transport: ReturnType<typeof nodemailer.createTransport> | undefined;
  try {
    const options = requireCasePromotionProvider();
    const db = getSupabaseAdminClient();
    const due = await db.rpc('list_due_case_promotions');
    if (due.error) throw new Error('Pending case email candidates unavailable');
    const candidates = (due.data ?? []) as Array<{
      user_id: string;
      kind: CasePromotionKind;
    }>;
    transport = nodemailer.createTransport(options);
    let sent = 0,
      skipped = 0,
      needsReview = 0,
      processed = 0;
    for (const candidate of candidates) {
      if (Date.now() - started > 240_000) break;
      processed++;
      if (
        !['pending_case_first', 'pending_case_followup'].includes(
          candidate.kind
        )
      )
        throw new Error('Invalid pending case email candidate');
      try {
        const outcome = await sendCasePromotion({
          supabase: db,
          userId: candidate.user_id,
          kind: candidate.kind,
          sendMail: (options) => transport!.sendMail(options),
        });
        if (outcome.status === 'sent') {
          sent++;
          await captureServerEvent(
            candidate.user_id,
            'pending_case_promotion_sent',
            {
              experiment: 'pending_case_v1',
              step:
                candidate.kind === 'pending_case_first' ? 'first' : 'followup',
            }
          );
        } else if (outcome.status === 'skipped') skipped++;
        else needsReview++;
      } catch {
        console.error('Pending case email candidate processing failed');
        needsReview++;
      }
    }
    return NextResponse.json({
      ok: true,
      processed,
      remaining: candidates.length - processed,
      sent,
      skipped,
      needsReview,
    });
  } catch {
    console.error('Pending case email cron failed');
    return NextResponse.json(
      { error: 'Pending case emails unavailable' },
      { status: 503 }
    );
  } finally {
    transport?.close();
  }
}
export const GET = withSentryApiErrors(
  handleGET,
  '/api/cron/pending-case-emails',
  'GET'
);
