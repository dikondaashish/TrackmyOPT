/**
 * Cron (hourly): check partner cases that are due (each about once a day) and
 * deliver status changes the partner has not received yet. Uses the shared USCIS
 * pacing and quota; stops early when USCIS asks us to slow down.
 *
 * Security: Authorization: Bearer CRON_SECRET (Vercel Cron sends it).
 * Does nothing until PARTNER_API_KEY is set.
 */
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { verifyCronAuth } from '@/lib/api/verify-cron-auth';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import {
  checkPartnerCase,
  deliverStatusChange,
  MAX_NOTIFY_ATTEMPTS,
  PARTNER_CASE_COLUMNS,
  PARTNER_SOURCE,
  partnerApiConfigured,
  type PartnerCaseRow,
} from '@/lib/partner-cases/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Leave headroom under maxDuration for the last request and the response. */
const TIME_BUDGET_MS = 240_000;
const CHECK_BATCH = 200;
const NOTIFY_BATCH = 100;
const CLAIM_MS = 30 * 60 * 1000;

async function handleGET(req: NextRequest) {
  const denied = verifyCronAuth(req);
  if (denied) return denied;
  if (!partnerApiConfigured()) return NextResponse.json({ ok: true, skipped: 'not_configured' });

  const started = Date.now();
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const counts = { checked: 0, changed: 0, failed: 0, removed: 0, delivered: 0, undelivered: 0, deferred: false };

  // 1. Status changes not yet delivered (earlier webhook failures).
  const { data: pending, error: pendingError } = await db
    .from('partner_cases')
    .select(PARTNER_CASE_COLUMNS)
    .eq('source', PARTNER_SOURCE)
    .eq('notify_pending', true)
    .lt('notify_attempts', MAX_NOTIFY_ATTEMPTS)
    .order('updated_at', { ascending: true })
    .limit(NOTIFY_BATCH)
    .returns<PartnerCaseRow[]>();
  if (pendingError) throw new Error('Could not read pending partner notifications');
  for (const row of pending ?? []) {
    if (await deliverStatusChange(db, row)) counts.delivered++;
    else counts.undelivered++;
  }

  // 2. Cases due for their daily check, oldest first.
  const nowIso = new Date().toISOString();
  const { data: due, error: dueError } = await db
    .from('partner_cases')
    .select(PARTNER_CASE_COLUMNS)
    .eq('source', PARTNER_SOURCE)
    .lte('next_check_at', nowIso)
    .order('next_check_at', { ascending: true })
    .limit(CHECK_BATCH)
    .returns<PartnerCaseRow[]>();
  if (dueError) throw new Error('Could not read due partner cases');

  for (const row of due ?? []) {
    if (Date.now() - started > TIME_BUDGET_MS) break;
    // Claim the row so an overlapping run skips it.
    const { data: claimed, error: claimError } = await db
      .from('partner_cases')
      .update({ next_check_at: new Date(Date.now() + CLAIM_MS).toISOString() })
      .eq('id', row.id)
      .eq('next_check_at', row.next_check_at)
      .select('id');
    if (claimError) throw new Error('Could not claim partner case');
    if (!claimed?.length) continue;

    const outcome = await checkPartnerCase(db, row);
    if (outcome.kind === 'deferred') {
      counts.deferred = true;
      break;
    }
    if (outcome.kind === 'removed') counts.removed++;
    else if (outcome.kind === 'failed') counts.failed++;
    else {
      counts.checked++;
      if (outcome.changed) {
        counts.changed++;
        if (await deliverStatusChange(db, outcome.row)) counts.delivered++;
        else counts.undelivered++;
      }
    }
  }

  return NextResponse.json({ ok: true, ...counts, remaining: Math.max(0, (due?.length ?? 0) - counts.checked - counts.failed - counts.removed) });
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/check-partner-cases', 'GET');
