/**
 * NestJS mirror of apps/web/lib/uscis/enrollment-guard.ts — keep in sync for parity.
 */

import { createHash } from 'crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class UnauthorizedReceiptLookupError extends Error {
  readonly code = 'UNAUTHORIZED_RECEIPT_LOOKUP';

  constructor(
    message = 'Receipt number is not enrolled for this user; USCIS lookup blocked.',
  ) {
    super(message);
    this.name = 'UnauthorizedReceiptLookupError';
  }
}

export function normalizeReceiptNumber(receipt: string): string {
  return receipt.trim().toUpperCase();
}

export function hashReceiptNumber(receipt: string): string {
  return createHash('sha256')
    .update(normalizeReceiptNumber(receipt))
    .digest('hex');
}

export type EnrollmentGuardInput = {
  userId: string;
  receiptNumber: string;
  callSite: string;
};

export type EnrollmentGuardDecision = {
  allowed: boolean;
  reason: string;
  receiptHash: string;
  normalizedReceipt: string;
};

export function evaluateEnrollmentGuard(input: {
  userId: string | null | undefined;
  receiptNumber: string | null | undefined;
  enrolled: boolean;
}): EnrollmentGuardDecision {
  const normalizedReceipt = input.receiptNumber
    ? normalizeReceiptNumber(input.receiptNumber)
    : '';
  const receiptHash = normalizedReceipt
    ? hashReceiptNumber(normalizedReceipt)
    : hashReceiptNumber('');

  if (!input.userId?.trim()) {
    return {
      allowed: false,
      reason: 'missing_user_id',
      receiptHash,
      normalizedReceipt,
    };
  }

  if (!normalizedReceipt || !/^[A-Z]{3}\d{10}$/.test(normalizedReceipt)) {
    return {
      allowed: false,
      reason: 'invalid_receipt_format',
      receiptHash,
      normalizedReceipt,
    };
  }

  if (!input.enrolled) {
    return {
      allowed: false,
      reason: 'receipt_not_enrolled_for_user',
      receiptHash,
      normalizedReceipt,
    };
  }

  return {
    allowed: true,
    reason: 'enrolled',
    receiptHash,
    normalizedReceipt,
  };
}

async function writeAuditLog(
  supabase: SupabaseClient,
  decision: EnrollmentGuardDecision,
  userId: string | null,
  callSite: string,
): Promise<void> {
  try {
    await supabase.from('uscis_api_audit').insert({
      user_id: userId,
      receipt_number_hash: decision.receiptHash,
      allowed: decision.allowed,
      reason: decision.reason,
      call_site: callSite,
    });
  } catch {
    // Non-blocking audit write
  }
}

export async function assertReceiptEnrolledByUser(
  supabase: SupabaseClient,
  input: EnrollmentGuardInput,
): Promise<string> {
  const { data, error } = await supabase
    .from('case_status')
    .select('id')
    .eq('receipt_number', normalizeReceiptNumber(input.receiptNumber))
    .eq('user_id', input.userId)
    .maybeSingle();

  if (error) {
    const decision = evaluateEnrollmentGuard({
      userId: input.userId,
      receiptNumber: input.receiptNumber,
      enrolled: false,
    });
    await writeAuditLog(
      supabase,
      { ...decision, reason: 'enrollment_lookup_failed' },
      input.userId,
      input.callSite,
    );
    throw new UnauthorizedReceiptLookupError(
      'Could not verify receipt enrollment; USCIS lookup blocked.',
    );
  }

  const decision = evaluateEnrollmentGuard({
    userId: input.userId,
    receiptNumber: input.receiptNumber,
    enrolled: Boolean(data),
  });

  await writeAuditLog(supabase, decision, input.userId, input.callSite);

  if (!decision.allowed) {
    throw new UnauthorizedReceiptLookupError();
  }

  return decision.normalizedReceipt;
}

export function createServiceSupabase(
  supabaseUrl: string,
  serviceRoleKey: string,
): SupabaseClient {
  return createClient(supabaseUrl, serviceRoleKey) as SupabaseClient;
}
