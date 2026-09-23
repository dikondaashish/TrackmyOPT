import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { getActiveUserPlanTier } from '@/lib/premium/user-plan-tier';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Opt-in notices only. Atomic claims prevent concurrent runs sending twice.
 * Ambiguous SMTP outcomes are marked failed, never blindly auto-replayed. */
export async function GET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const horizon = new Date(now.getTime() + 3 * 86400000)
    .toISOString()
    .slice(0, 10);
  // A process killed mid-send must not leave a permanently reassuring state.
  // We cannot know whether SMTP accepted it, so do not automatically resend it.
  const { error: staleError } = await db
    .from('case_notices')
    .update({ reminder_state: 'failed' })
    .eq('reminder_state', 'sending')
    .lt(
      'reminder_started_at',
      new Date(now.getTime() - 30 * 60000).toISOString()
    );
  if (staleError)
    return NextResponse.json(
      { ok: false, error: 'Could not reconcile reminder state' },
      { status: 503 }
    );
  const { error: expiredError } = await db
    .from('case_notices')
    .update({ reminder_state: 'failed' })
    .eq('reminder_state', 'pending')
    .lt('due_date', today);
  if (expiredError)
    return NextResponse.json(
      { ok: false, error: 'Could not reconcile expired reminders' },
      { status: 503 }
    );
  const { data: notices, error } = await db
    .from('case_notices')
    .select('id,user_id,case_id,title,due_date')
    .eq('reminder_state', 'pending')
    .eq('email_reminder', true)
    .is('completed_at', null)
    .gte('due_date', today)
    .lte('due_date', horizon)
    .order('due_date')
    .order('id')
    .limit(20);
  if (error)
    return NextResponse.json(
      { ok: false, error: 'Could not load deadline reminders' },
      { status: 503 }
    );
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const started = Date.now();
  try {
    for (const notice of notices ?? []) {
      if (Date.now() - started > 240000) break;
      const [profile, caseResult, prefs, tier] = await Promise.all([
        db
          .from('profiles')
          .select('notification_email,email')
          .eq('user_id', notice.user_id)
          .maybeSingle(),
        db
          .from('case_status')
          .select('id')
          .eq('id', notice.case_id)
          .eq('user_id', notice.user_id)
          .maybeSingle(),
        db
          .from('email_preferences')
          .select('document_reminders_enabled')
          .eq('user_id', notice.user_id)
          .maybeSingle(),
        getActiveUserPlanTier(notice.user_id),
      ]);
      if (profile.error || caseResult.error || prefs.error) {
        failed++;
        continue;
      }
      const address =
        profile.data?.notification_email?.trim() || profile.data?.email?.trim();
      if (
        tier === 'free' ||
        prefs.data?.document_reminders_enabled === false ||
        !caseResult.data ||
        !address
      ) {
        const { error: cancelError } = await db
          .from('case_notices')
          .update({ reminder_state: 'cancelled' })
          .eq('id', notice.id)
          .eq('reminder_state', 'pending');
        if (cancelError) failed++;
        else skipped++;
        continue;
      }
      const { data: claim, error: claimError } = await db
        .from('case_notices')
        .update({
          reminder_state: 'sending',
          reminder_started_at: new Date().toISOString(),
        })
        .eq('id', notice.id)
        .eq('reminder_state', 'pending')
        .eq('due_date', notice.due_date)
        .eq('title', notice.title)
        .eq('email_reminder', true)
        .is('completed_at', null)
        .select('id')
        .maybeSingle();
      if (claimError) {
        failed++;
        continue;
      }
      if (!claim) continue;
      try {
        const info = await transport.sendMail({
          from: getSmtpFromHeader(),
          to: address,
          subject: 'TrackMyOPT: review your saved case deadline',
          text: `Your saved task: ${notice.title}\nConfirmed deadline: ${notice.due_date}\n\nReview the exact requirements and time on your official notice or with your DSO. This reminder does not extend a deadline.\n\nhttps://www.trackmyopt.com/dashboard/case-status\nManage this reminder by marking the task complete on your case page.`,
        });
        if (!info.accepted?.length) throw new Error('Not accepted');
        const { error: saveError } = await db
          .from('case_notices')
          .update({
            reminder_state: 'sent',
            reminder_sent_at: new Date().toISOString(),
          })
          .eq('id', notice.id)
          .eq('reminder_state', 'sending');
        if (saveError) {
          failed++;
          continue;
        } // Keep ambiguous state; never duplicate.
        sent++;
      } catch {
        await db
          .from('case_notices')
          .update({ reminder_state: 'failed' })
          .eq('id', notice.id)
          .eq('reminder_state', 'sending');
        failed++;
      }
    }
  } finally {
    transport.close();
  }
  return NextResponse.json(
    { ok: failed === 0, sent, failed, skipped, batchLimit: 20 },
    { status: failed ? 503 : 200 }
  );
}
