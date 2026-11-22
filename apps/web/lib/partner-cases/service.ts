/**
 * Cases enrolled by signed-in users of a partner product (public.partner_cases).
 *
 * The partner keeps its own accounts. Its server calls the private API in
 * app/api/partner/cases with an opaque user reference and a receipt
 * number; this module checks those receipts with the same USCIS client, pacing and
 * quota as TrackMyOPT cases, and posts each status change back to the partner as a
 * signed webhook. TrackMyOPT never emails these people and never sees their name or
 * email. Everything stays off until the three PARTNER_* variables are set.
 */
import { createHmac } from 'crypto';
import * as Sentry from '@sentry/nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { safeEqual } from '@/lib/api/secure-compare';
import { fetchPartnerCaseStatus } from '@/lib/uscis/client';
import { UnauthorizedReceiptLookupError } from '@/lib/uscis/errors';
import { normalizeReceiptNumber } from '@/lib/uscis/receipt-hash';

export const PARTNER_SOURCE = 'partner1' as const;
/** Same limit the partner shows its users. */
export const MAX_CASES_PER_USER = 10;
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
/** Hourly retries for two days, then one grouped Sentry warning. */
export const MAX_NOTIFY_ATTEMPTS = 48;
/**
 * A receipt USCIS doesn't know (404/422) is usually a typo, but a brand-new filing can take
 * days to appear. Retry after 1, 3 and 7 days, then stop: four lookups in total instead of
 * one a day forever, so mistyped numbers never look like scanning other people's cases.
 */
export const NOT_FOUND_RETRY_DAYS = [1, 3, 7] as const;
/** next_check_at for a case we stopped checking; the cron never reaches it. */
export const NEVER = '9999-12-31T00:00:00.000Z';
/** A partner may ask for one extra lookup of a not-found case at most this often. */
export const RECHECK_MIN_MS = HOUR_MS;

export const PARTNER_CASE_COLUMNS =
  'id, partner_user_ref, receipt_number, form_type, current_status, status_description, received_date, status_history, status_changed_at, last_checked_at, next_check_at, consecutive_failures, last_error_code, notify_pending, notify_previous_status, notify_attempts, created_at, updated_at';

export type PartnerCaseRow = {
  id: string;
  partner_user_ref: string;
  receipt_number: string;
  form_type: string | null;
  current_status: string | null;
  status_description: string | null;
  received_date: string | null;
  status_history: Array<{ date: string; completedText: string }>;
  status_changed_at: string | null;
  last_checked_at: string | null;
  next_check_at: string;
  consecutive_failures: number;
  last_error_code: number | null;
  notify_pending: boolean;
  notify_previous_status: string | null;
  notify_attempts: number;
  created_at: string;
  updated_at: string;
};

const isNotFoundCode = (code: number | null) => code === 404 || code === 422;

/** USCIS has never returned a status for this receipt and says it doesn't know it. */
export const isNotFound = (row: Pick<PartnerCaseRow, 'current_status' | 'last_error_code'>) =>
  row.current_status === null && isNotFoundCode(row.last_error_code);

/** A not-found case we no longer check on a schedule. */
export const checksStopped = (row: Pick<PartnerCaseRow, 'current_status' | 'last_error_code' | 'consecutive_failures'>) =>
  isNotFound(row) && row.consecutive_failures > NOT_FOUND_RETRY_DAYS.length;

/** What the partner receives about a case. No TrackMyOPT internals. */
export function partnerCaseView(row: PartnerCaseRow) {
  return {
    id: row.id,
    userRef: row.partner_user_ref,
    receiptNumber: row.receipt_number,
    formType: row.form_type,
    status: row.current_status,
    description: row.status_description,
    receivedDate: row.received_date,
    history: row.status_history ?? [],
    statusChangedAt: row.status_changed_at,
    lastCheckedAt: row.last_checked_at,
    lastErrorCode: row.last_error_code,
    notFound: isNotFound(row),
    checksStopped: checksStopped(row),
  };
}
export type PartnerCaseView = ReturnType<typeof partnerCaseView>;

const USER_REF = /^[A-Za-z0-9_-]{8,128}$/;
const RECEIPT = /^[A-Z]{3}\d{10}$/;

export function parseUserRef(value: unknown): string | null {
  return typeof value === 'string' && USER_REF.test(value) ? value : null;
}
export function parseReceipt(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const receipt = normalizeReceiptNumber(value);
  return RECEIPT.test(receipt) ? receipt : null;
}

/** The inbound key alone turns the API on; webhooks also need the URL and secret. */
export function partnerApiConfigured() {
  return Boolean(process.env.PARTNER_API_KEY);
}
function webhookConfig(): { url: string; secret: string } | null {
  const url = process.env.PARTNER_WEBHOOK_URL;
  const secret = process.env.PARTNER_WEBHOOK_SECRET;
  if (!url || !secret) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return null;
  } catch {
    return null;
  }
  return { url, secret };
}

/** Authorization: Bearer PARTNER_API_KEY. 503 while the partner API is off. */
export function verifyPartnerAuth(req: NextRequest): NextResponse | null {
  const key = process.env.PARTNER_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'Partner API not configured' }, { status: 503 });
  const auth = req.headers.get('authorization');
  return auth && safeEqual(auth, `Bearer ${key}`)
    ? null
    : NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}

export type CheckOutcome =
  | { kind: 'checked'; changed: boolean; row: PartnerCaseRow }
  | { kind: 'failed'; code: number; row: PartnerCaseRow }
  /** USCIS asked us to slow down or is down: stop this batch. */
  | { kind: 'deferred'; code: number }
  /** The enrollment was removed while we were checking. */
  | { kind: 'removed' };

/**
 * One USCIS lookup for one partner case, then the row update. A changed status is
 * marked notify_pending; deliverStatusChange sends it.
 */
export async function checkPartnerCase(
  db: SupabaseClient,
  row: PartnerCaseRow,
  now = new Date()
): Promise<CheckOutcome> {
  let result;
  try {
    result = await fetchPartnerCaseStatus({
      receiptNumber: row.receipt_number,
      source: PARTNER_SOURCE,
      supabase: db,
    });
  } catch (error) {
    if (error instanceof UnauthorizedReceiptLookupError) return { kind: 'removed' };
    throw error;
  }

  if (!result.success) {
    const { code } = result.error;
    const pause = code === 429 || result.error.upstreamUnavailable;
    const failures = row.consecutive_failures + 1;
    let next: string;
    if (pause) {
      next = new Date(now.getTime() + Math.max(HOUR_MS, (result.error.retryAfter ?? 0) * 1000)).toISOString();
    } else if (isNotFoundCode(code) && row.current_status === null) {
      // Count only the not-found streak, so earlier outages don't shorten it.
      const streak = isNotFoundCode(row.last_error_code) ? failures : 1;
      const days = NOT_FOUND_RETRY_DAYS[streak - 1];
      next = days === undefined ? NEVER : new Date(now.getTime() + days * DAY_MS).toISOString();
    } else {
      next = new Date(now.getTime() + (isNotFoundCode(code) ? DAY_MS : 6 * HOUR_MS)).toISOString();
    }
    const { data, error } = await db
      .from('partner_cases')
      .update({
        consecutive_failures: isNotFoundCode(code) && !isNotFoundCode(row.last_error_code) ? 1 : failures,
        last_error_code: code,
        next_check_at: next,
      })
      .eq('id', row.id)
      .select(PARTNER_CASE_COLUMNS)
      .maybeSingle<PartnerCaseRow>();
    if (error) throw new Error('Could not record partner case failure');
    if (pause) return { kind: 'deferred', code };
    return data ? { kind: 'failed', code, row: data } : { kind: 'removed' };
  }

  const status = result.data;
  // A first status after "not found" (a new filing that just reached USCIS's system) is
  // news for the partner too, even though nothing was shown before.
  const changed =
    (row.current_status !== null && row.current_status !== status.status) ||
    (row.current_status === null && isNotFound(row));
  const update: Record<string, unknown> = {
    form_type: status.caseType || row.form_type,
    current_status: status.status,
    status_description: status.description || null,
    received_date: status.receivedDate,
    uscis_modified_date: status.modifiedDate ?? null,
    status_history: status.histCaseStatus,
    last_checked_at: now.toISOString(),
    next_check_at: new Date(now.getTime() + DAY_MS).toISOString(),
    consecutive_failures: 0,
    last_error_code: null,
  };
  if (changed) {
    update.status_changed_at = now.toISOString();
    // Keep the oldest unsent status, so two changes before a delivery read as one move.
    if (!row.notify_pending) update.notify_previous_status = row.current_status;
    update.notify_pending = true;
    update.notify_attempts = 0;
  }
  const { data, error } = await db
    .from('partner_cases')
    .update(update)
    .eq('id', row.id)
    .select(PARTNER_CASE_COLUMNS)
    .maybeSingle<PartnerCaseRow>();
  if (error) throw new Error('Could not save partner case status');
  return data ? { kind: 'checked', changed, row: data } : { kind: 'removed' };
}

/** HMAC-SHA256 over "<timestamp>.<body>", hex, sent as "sha256=<hex>". */
export function signWebhook(secret: string, timestamp: string, body: string) {
  return `sha256=${createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex')}`;
}

/**
 * Tell the partner about a status change. Clears notify_pending on a 2xx; otherwise
 * counts the attempt so the cron retries it. Returns false when not delivered.
 */
export async function deliverStatusChange(
  db: SupabaseClient,
  row: PartnerCaseRow,
  now = new Date()
): Promise<boolean> {
  const config = webhookConfig();
  if (!config || !row.notify_pending) return false;
  const body = JSON.stringify({
    event: 'case.status_changed',
    previousStatus: row.notify_previous_status,
    case: partnerCaseView(row),
    sentAt: now.toISOString(),
  });
  const timestamp = String(Math.floor(now.getTime() / 1000));
  let delivered = false;
  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Partner-Timestamp': timestamp,
        'X-Partner-Signature': signWebhook(config.secret, timestamp, body),
      },
      body,
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
    delivered = response.ok;
  } catch {
    delivered = false;
  }

  const attempts = row.notify_attempts + 1;
  // Only clear the flag if no newer change arrived since this row was read.
  const query = db
    .from('partner_cases')
    .update(
      delivered
        ? { notify_pending: false, notify_previous_status: null, notify_attempts: 0 }
        : { notify_attempts: attempts }
    )
    .eq('id', row.id);
  const { error } = await (row.current_status === null
    ? query.is('current_status', null)
    : query.eq('current_status', row.current_status));
  if (error) throw new Error('Could not record partner webhook delivery');

  if (!delivered && attempts === MAX_NOTIFY_ATTEMPTS) {
    Sentry.withScope((scope) => {
      scope.setFingerprint(['partner-cases', 'webhook-undelivered']);
      Sentry.captureMessage('Partner status webhook undelivered after retries', 'warning');
    });
  }
  return delivered;
}
