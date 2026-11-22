import type { SupabaseClient } from "@supabase/supabase-js";
import { dbErrorCode } from "@/lib/secure-logger";
import { UnauthorizedReceiptLookupError } from "@/lib/uscis/errors";
import { hashReceiptNumber, normalizeReceiptNumber } from "@/lib/uscis/receipt-hash";

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

/** Pure decision logic — mirrored in apps/api for Nest parity tests. */
export function evaluateEnrollmentGuard(input: {
  userId: string | null | undefined;
  receiptNumber: string | null | undefined;
  enrolled: boolean;
}): EnrollmentGuardDecision {
  const normalizedReceipt = input.receiptNumber
    ? normalizeReceiptNumber(input.receiptNumber)
    : "";
  const receiptHash = normalizedReceipt
    ? hashReceiptNumber(normalizedReceipt)
    : hashReceiptNumber("");

  if (!input.userId?.trim()) {
    return {
      allowed: false,
      reason: "missing_user_id",
      receiptHash,
      normalizedReceipt,
    };
  }

  if (!normalizedReceipt || !/^[A-Z]{3}\d{10}$/.test(normalizedReceipt)) {
    return {
      allowed: false,
      reason: "invalid_receipt_format",
      receiptHash,
      normalizedReceipt,
    };
  }

  if (!input.enrolled) {
    return {
      allowed: false,
      reason: "receipt_not_enrolled_for_user",
      receiptHash,
      normalizedReceipt,
    };
  }

  return {
    allowed: true,
    reason: "enrolled",
    receiptHash,
    normalizedReceipt,
  };
}

async function writeAuditLog(
  supabase: SupabaseClient,
  decision: EnrollmentGuardDecision,
  userId: string | null,
  callSite: string
): Promise<void> {
  let failure: unknown;
  try {
    const { data, error } = await supabase.from('uscis_api_audit').insert({
      user_id: userId,
      receipt_number_hash: decision.receiptHash,
      allowed: decision.allowed,
      reason: decision.reason,
      call_site: callSite,
    }).select('id').maybeSingle();
    if (error) failure = error;
    // The database trigger returns no row when the enrollment was removed
    // after the initial read. Do not call USCIS using that stale permission.
    else if (decision.allowed && !data) throw new UnauthorizedReceiptLookupError();
  } catch (error) {
    if (error instanceof UnauthorizedReceiptLookupError) throw error;
    failure = error;
  }
  if (failure === undefined) return;
  // The code only (TRACKMYOPT-2P): database messages can echo row values.
  console.error(`USCIS enrollment audit write failed (code=${dbErrorCode(failure)})`);
  if (decision.allowed) throw new Error('Could not record USCIS enrollment audit');
}

export async function assertReceiptEnrolledByUser(
  supabase: SupabaseClient,
  input: EnrollmentGuardInput
): Promise<string> {
  const { data, error } = await supabase
    .from("case_status")
    .select("id")
    .eq("receipt_number", normalizeReceiptNumber(input.receiptNumber))
    .eq("user_id", input.userId)
    .maybeSingle();

  if (error) {
    const decision = evaluateEnrollmentGuard({
      userId: input.userId,
      receiptNumber: input.receiptNumber,
      enrolled: false,
    });
    await writeAuditLog(supabase, { ...decision, reason: "enrollment_lookup_failed" }, input.userId, input.callSite);
    throw new UnauthorizedReceiptLookupError(
      "Could not verify receipt enrollment; USCIS lookup blocked."
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

/** Partner products whose signed-in users may enroll receipts (see partner_cases). */
export type PartnerSource = "partner1";

/**
 * Same rule as assertReceiptEnrolledByUser, for a receipt a partner product's signed-in
 * user enrolled. The audit row has no TrackMyOPT user and call site "partner:<source>";
 * the guard_uscis_audit_retention trigger re-checks the enrollment in partner_cases.
 */
export async function assertReceiptEnrolledByPartner(
  supabase: SupabaseClient,
  input: { source: PartnerSource; receiptNumber: string }
): Promise<string> {
  const callSite = `partner:${input.source}`;
  const { data, error } = await supabase
    .from("partner_cases")
    .select("id")
    .eq("source", input.source)
    .eq("receipt_number", normalizeReceiptNumber(input.receiptNumber))
    .limit(1)
    .maybeSingle();

  const decision = evaluateEnrollmentGuard({
    userId: callSite,
    receiptNumber: input.receiptNumber,
    enrolled: !error && Boolean(data),
  });
  await writeAuditLog(
    supabase,
    error ? { ...decision, reason: "enrollment_lookup_failed" } : decision,
    null,
    callSite
  );
  if (error) {
    throw new UnauthorizedReceiptLookupError(
      "Could not verify receipt enrollment; USCIS lookup blocked."
    );
  }
  if (!decision.allowed) throw new UnauthorizedReceiptLookupError();
  return decision.normalizedReceipt;
}
