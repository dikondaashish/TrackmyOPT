/**
 * Private API for the partner's server (never a browser). Bearer PARTNER_API_KEY.
 *
 *   GET    ?userRef=…                     → that user's cases
 *   POST   { userRef, receiptNumber }     → enroll (idempotent) and check once now
 *   POST   { …, recheck: true }           → also look up a not-found case again now
 *                                            (at most hourly; reports rechecked: false otherwise)
 *   DELETE ?userRef=…&receiptNumber=…     → remove one case
 *   DELETE ?userRef=…                     → remove all of that user's cases (account deleted)
 *
 * userRef is an opaque ID chosen by the partner; no names or emails are accepted.
 */
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import {
  checkPartnerCase,
  isNotFound,
  MAX_CASES_PER_USER,
  PARTNER_CASE_COLUMNS,
  PARTNER_SOURCE,
  parseReceipt,
  parseUserRef,
  partnerCaseView,
  RECHECK_MIN_MS,
  verifyPartnerAuth,
  type PartnerCaseRow,
} from '@/lib/partner-cases/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const noStore = { 'Cache-Control': 'no-store' };
const db = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const bad = (error: string, status = 400) =>
  NextResponse.json({ ok: false, error }, { status, headers: noStore });

async function handleGET(req: NextRequest) {
  const denied = verifyPartnerAuth(req);
  if (denied) return denied;
  const userRef = parseUserRef(req.nextUrl.searchParams.get('userRef'));
  if (!userRef) return bad('Invalid userRef');
  const { data, error } = await db()
    .from('partner_cases')
    .select(PARTNER_CASE_COLUMNS)
    .eq('source', PARTNER_SOURCE)
    .eq('partner_user_ref', userRef)
    .order('created_at', { ascending: true })
    .returns<PartnerCaseRow[]>();
  if (error) return bad('Could not read cases', 500);
  return NextResponse.json({ ok: true, cases: (data ?? []).map(partnerCaseView) }, { headers: noStore });
}

async function handlePOST(req: NextRequest) {
  const denied = verifyPartnerAuth(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const userRef = parseUserRef(body?.userRef);
  const receipt = parseReceipt(body?.receiptNumber);
  if (!userRef) return bad('Invalid userRef');
  if (!receipt) return bad('Invalid receiptNumber');

  const supabase = db();
  const { data: existing, error: readError } = await supabase
    .from('partner_cases')
    .select(PARTNER_CASE_COLUMNS)
    .eq('source', PARTNER_SOURCE)
    .eq('partner_user_ref', userRef)
    .returns<PartnerCaseRow[]>();
  if (readError) return bad('Could not read cases', 500);
  const same = existing?.find((c) => c.receipt_number === receipt);
  if (same) {
    // "Check again" for a receipt USCIS didn't know: one lookup, never more than hourly.
    const recheck =
      body?.recheck === true &&
      isNotFound(same) &&
      Date.now() - new Date(same.updated_at).getTime() >= RECHECK_MIN_MS;
    if (!recheck) {
      return NextResponse.json({ ok: true, created: false, rechecked: false, case: partnerCaseView(same) }, { headers: noStore });
    }
    const outcome = await checkPartnerCase(supabase, same);
    const row = outcome.kind === 'checked' || outcome.kind === 'failed' ? outcome.row : same;
    return NextResponse.json({ ok: true, created: false, rechecked: true, case: partnerCaseView(row) }, { headers: noStore });
  }
  if ((existing?.length ?? 0) >= MAX_CASES_PER_USER) return bad('Case limit reached', 409);

  const { data: inserted, error: insertError } = await supabase
    .from('partner_cases')
    .insert({ source: PARTNER_SOURCE, partner_user_ref: userRef, receipt_number: receipt })
    .select(PARTNER_CASE_COLUMNS)
    .single<PartnerCaseRow>();
  if (insertError?.code === '23505') {
    // A concurrent request enrolled it first; return that row.
    const { data } = await supabase
      .from('partner_cases')
      .select(PARTNER_CASE_COLUMNS)
      .eq('source', PARTNER_SOURCE)
      .eq('partner_user_ref', userRef)
      .eq('receipt_number', receipt)
      .maybeSingle<PartnerCaseRow>();
    if (data) return NextResponse.json({ ok: true, created: false, case: partnerCaseView(data) }, { headers: noStore });
  }
  if (insertError || !inserted) return bad('Could not save case', 500);

  // First status now, so the person sees it right away. A failed lookup is not an
  // error for the caller: the case is saved and the hourly cron retries it.
  const outcome = await checkPartnerCase(supabase, inserted);
  const row = outcome.kind === 'checked' || outcome.kind === 'failed' ? outcome.row : inserted;
  return NextResponse.json({ ok: true, created: true, case: partnerCaseView(row) }, { status: 201, headers: noStore });
}

async function handleDELETE(req: NextRequest) {
  const denied = verifyPartnerAuth(req);
  if (denied) return denied;
  const params = req.nextUrl.searchParams;
  const userRef = parseUserRef(params.get('userRef'));
  if (!userRef) return bad('Invalid userRef');
  let query = db().from('partner_cases').delete().eq('source', PARTNER_SOURCE).eq('partner_user_ref', userRef);
  if (params.has('receiptNumber')) {
    const receipt = parseReceipt(params.get('receiptNumber'));
    if (!receipt) return bad('Invalid receiptNumber');
    query = query.eq('receipt_number', receipt);
  }
  const { data, error } = await query.select('id');
  if (error) return bad('Could not remove cases', 500);
  return NextResponse.json({ ok: true, removed: data?.length ?? 0 }, { headers: noStore });
}

export const GET = withSentryApiErrors(handleGET, '/api/partner/cases', 'GET');
export const POST = withSentryApiErrors(handlePOST, '/api/partner/cases', 'POST');
export const DELETE = withSentryApiErrors(handleDELETE, '/api/partner/cases', 'DELETE');
