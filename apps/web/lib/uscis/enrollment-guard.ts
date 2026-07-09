import type { SupabaseClient } from "@supabase/supabase-js";
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
  try {
    await supabase.from("uscis_api_audit").insert({
      user_id: userId,
      receipt_number_hash: decision.receiptHash,
      allowed: decision.allowed,
      reason: decision.reason,
      call_site: callSite,
    });
  } catch {
    // Audit failure must not permit a lookup — but also must not mask the guard throw.
  }
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
