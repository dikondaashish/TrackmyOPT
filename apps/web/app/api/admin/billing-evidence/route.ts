import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/billing-evidence?email=user@example.com
 * Authorization: Bearer ADMIN_SECRET
 *
 * Returns dispute evidence packet for a customer (consent, transactions, emails).
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || auth !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  const userIdParam = req.nextUrl.searchParams.get("userId")?.trim();

  if (!email && !userIdParam) {
    return NextResponse.json(
      { error: "Provide email or userId query parameter" },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let userId = userIdParam || null;
  if (!userId && email) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("user_id, email, stripe_customer_id, premium_status, plan_tier, subscription_expires_at, pro_free_trial_consumed")
      .ilike("email", email)
      .maybeSingle();
    if (!prof?.user_id) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    userId = prof.user_id;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id, email, stripe_customer_id, premium_status, plan_tier, subscription_expires_at, pro_free_trial_consumed, premium_purchased_at")
    .eq("user_id", userId!)
    .single();

  const [{ data: billingEvents }, { data: policyConsents }, { data: transactions }, { data: emails }] =
    await Promise.all([
      supabase
        .from("billing_consent_events")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("policy_consents")
        .select("*")
        .eq("user_id", userId!)
        .order("consented_at", { ascending: false }),
      supabase
        .from("payment_transactions")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("email_queue")
        .select("id, email_type, email_subject, status, created_at, sent_at, email_data")
        .eq("user_id", userId!)
        .in("email_type", [
          "trial_started",
          "trial_ending",
          "premium_welcome",
          "subscription_receipt",
          "subscription_cancel_confirmed",
          "subscription_ended",
          "material_policy_change",
          "payment_failed",
        ])
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile,
    policyConsents: policyConsents ?? [],
    billingConsentEvents: billingEvents ?? [],
    paymentTransactions: transactions ?? [],
    billingEmails: emails ?? [],
    attorneyReviewNote:
      "This export is operational evidence only—not legal advice. Have counsel review policy text before launch.",
  });
}
