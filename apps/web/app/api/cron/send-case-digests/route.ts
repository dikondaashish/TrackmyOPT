import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { observeCaseWorker } from '@/lib/case-status/worker-observability';
import { getSmtpFromHeader } from '@/lib/notifications/email-smtp';
import { resolveActivePlanTier } from '@/lib/premium/user-plan-tier';
import { buildCaseDigest, digestWeek } from '@/lib/case-status/digest';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
export async function GET(req: NextRequest) {
  return observeCaseWorker('case-digests', req, () => run(req));
}
async function run(req: NextRequest) {
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const now = new Date();
  const week = digestWeek(now);
  const today = now.toISOString().slice(0, 10);
  const horizon = new Date(now.getTime() + 7 * 86400000)
    .toISOString()
    .slice(0, 10);
  const dueFilter = `last_digest_week.is.null,last_digest_week.lt.${week}`;
  const dryRun = req.nextUrl.searchParams.get('dry_run') === '1';
  const candidates = await db
    .from('case_digest_preferences')
    .select('user_id,updated_at')
    .eq('enabled', true)
    .or(dueFilter)
    .order('user_id')
    .limit(20);
  if (candidates.error)
    return NextResponse.json(
      { ok: false, error: 'Digest preferences unavailable' },
      { status: 503 }
    );
  if (dryRun)
    return NextResponse.json({
      ok: true,
      dryRun: true,
      eligible: candidates.data?.length ?? 0,
      sent: 0,
      batchLimit: 20,
    });
  const stale = await db
    .from('case_digest_deliveries')
    .update({ state: 'failed', finished_at: now.toISOString() })
    .eq('state', 'sending')
    .lt('started_at', new Date(now.getTime() - 30 * 60000).toISOString());
  if (stale.error)
    return NextResponse.json(
      { ok: false, error: 'Digest history unavailable' },
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
  let sent = 0,
    failed = 0,
    skipped = 0;
  const started = Date.now();
  try {
    for (const candidate of candidates.data ?? []) {
      if (Date.now() - started > 240000) break;
      const userId = candidate.user_id;
      const [profile, prefs, cases, notices] = await Promise.all([
        db
          .from('profiles')
          .select(
            'email,notification_email,premium_status,plan_tier,subscription_expires_at'
          )
          .eq('user_id', userId)
          .maybeSingle(),
        db
          .from('email_preferences')
          .select('email_enabled')
          .eq('user_id', userId)
          .maybeSingle(),
        db
          .from('case_status')
          .select('label,current_status,last_checked_at,change_log')
          .eq('user_id', userId)
          .order('created_at')
          .limit(100),
        db
          .from('case_notices')
          .select('title,due_date')
          .eq('user_id', userId)
          .is('completed_at', null)
          .gte('due_date', today)
          .lte('due_date', horizon)
          .order('due_date')
          .limit(100),
      ]);
      if (profile.error || prefs.error || cases.error || notices.error) {
        failed++;
        continue;
      }
      const address =
        profile.data?.notification_email?.trim() || profile.data?.email?.trim();
      const allowed =
        resolveActivePlanTier(profile.data) !== 'free' &&
        prefs.data?.email_enabled !== false &&
        !!address &&
        !!cases.data?.length;
      // Compare-and-set includes preference version, so an opt-out wins over an old read.
      const claim = await db
        .from('case_digest_preferences')
        .update({ last_digest_week: week })
        .eq('user_id', userId)
        .eq('enabled', true)
        .eq('updated_at', candidate.updated_at)
        .or(dueFilter)
        .select('user_id')
        .maybeSingle();
      if (claim.error) {
        failed++;
        continue;
      }
      if (!claim.data) continue;
      const delivery = await db
        .from('case_digest_deliveries')
        .insert({
          user_id: userId,
          week_start: week,
          state: allowed ? 'sending' : 'cancelled',
        });
      if (delivery.error) {
        if (delivery.error.code !== '23505') failed++;
        continue;
      }
      if (!allowed) {
        skipped++;
        continue;
      }
      // Recheck global + digest opt-out immediately before handing off to SMTP.
      const [latest, global] = await Promise.all([
        db
          .from('case_digest_preferences')
          .select('enabled')
          .eq('user_id', userId)
          .maybeSingle(),
        db
          .from('email_preferences')
          .select('email_enabled')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);
      let state: 'sent' | 'failed' | 'cancelled' = 'failed';
      if (
        !latest.error &&
        !global.error &&
        (latest.data?.enabled !== true || global.data?.email_enabled === false)
      ) {
        state = 'cancelled';
        skipped++;
      } else if (latest.error || global.error) failed++;
      else
        try {
          const info = await transport.sendMail({
            from: getSmtpFromHeader(),
            to: address,
            subject: 'Your TrackMyOPT weekly case summary',
            text: buildCaseDigest(cases.data ?? [], notices.data ?? [], week),
          });
          if (!info.accepted?.length) throw new Error('Not accepted');
          state = 'sent';
          sent++;
        } catch {
          failed++;
        }
      const saved = await db
        .from('case_digest_deliveries')
        .update({ state, finished_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('week_start', week)
        .eq('state', 'sending');
      if (saved.error) failed++;
    }
  } finally {
    transport.close();
  }
  return NextResponse.json(
    { ok: failed === 0, sent, failed, skipped, batchLimit: 20 },
    { status: failed ? 503 : 200 }
  );
}
