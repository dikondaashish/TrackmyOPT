import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getUserId } from "@/lib/auth/get-user-id";
import {
  filingCategorySchema,
  normalizeFilingCategory,
} from "@/lib/case-status/filing-category";
import { captureServerEvent } from "@/lib/posthog-server";
import { getReceiptPrefix } from "@/lib/posthog/uscis-status-category";

export const dynamic = "force-dynamic";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "no-store",
};

/**
 * PATCH /api/case-status/filing-category
 * Update filing type without re-entering the receipt number.
 */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => null);
    const caseId = typeof body?.case_id === "string" ? body.case_id : null;
    const parsed = filingCategorySchema.safeParse(body?.filing_category);

    if (!caseId) {
      return NextResponse.json(
        { ok: false, error: "case_id is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Invalid filing_category" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: target } = await supabase
      .from("case_status")
      .select("id, receipt_number")
      .eq("user_id", userId)
      .eq("id", caseId)
      .maybeSingle();

    if (!target) {
      return NextResponse.json(
        { ok: false, error: "Case not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const filingCategory = normalizeFilingCategory(parsed.data);

    const { data, error } = await supabase
      .from("case_status")
      .update({
        filing_category: filingCategory,
        filing_category_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId)
      .eq("user_id", userId)
      .select("id, filing_category, filing_category_confirmed_at")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: "Failed to update filing type" },
        { status: 500, headers: corsHeaders }
      );
    }

    await captureServerEvent(userId, "filing_category_updated", {
      filing_category: filingCategory,
      receipt_prefix: getReceiptPrefix(target.receipt_number),
    });

    return NextResponse.json({ ok: true, data }, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error in PATCH /api/case-status/filing-category:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}
