/**
 * Admin: delete user(s) by email (full account deletion + block re-registration).
 * Usage: npx tsx scripts/admin-delete-user-by-email.ts email@example.com [email2...]
 */

import * as dotenv from "dotenv";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import type { Database } from "@/types/supabase";
import { cancelStripeSubscriptionsForCustomer } from "../lib/premium/cancel-stripe-subscriptions-for-customer";

type AdminSupabase = SupabaseClient<Database>;

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const USER_DATA_TABLES = [
  "profiles",
  "opt_status",
  "employment_spans",
  "case_status",
  "document_reminders",
  "documents",
  "document_passcodes",
  "email_preferences",
  "email_queue",
  "notification_settings",
  "payment_transactions",
  "job_applications",
  "job_stages",
  "resume_generations",
  "resumes",
  "user_sessions",
  "export_otps",
  "passcode_otps",
  "insurance_eligibility_checks",
  "policy_consents",
] as const;

async function findUserByEmail(supabase: AdminSupabase, email: string) {
  let page = 1;
  const target = email.toLowerCase();
  while (page <= 20) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;
    if (data.users.length < 1000) break;
    page += 1;
  }
  return null;
}

async function deleteUserAccount(
  supabase: AdminSupabase,
  stripe: Stripe | null,
  userId: string,
  userEmail: string
): Promise<void> {
  const { data: billingProfile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  const stripeCustomerId = billingProfile?.stripe_customer_id?.trim() || null;
  if (stripeCustomerId && stripe) {
    try {
      await cancelStripeSubscriptionsForCustomer(stripe, stripeCustomerId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(`  Stripe cancel warning: ${message}`);
    }
  }

  await supabase.from("blocked_emails").upsert(
    {
      email: userEmail.toLowerCase(),
      reason: "account_deleted",
      deleted_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  for (const table of USER_DATA_TABLES) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId);
    if (error) console.warn(`  ${table}: ${error.message}`);
  }

  // Table exists in DB but is not yet in generated Database types.
  const { error: policyNoticeError } = await (supabase as SupabaseClient)
    .from("policy_notice_email_events")
    .delete()
    .eq("email", userEmail.toLowerCase());
  if (policyNoticeError) {
    console.warn(`  policy_notice_email_events: ${policyNoticeError.message}`);
  }

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) throw new Error(`auth delete failed: ${deleteError.message}`);
}

async function main() {
  const emails = process.argv.slice(2).map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (emails.length === 0) {
    console.error("Usage: npx tsx scripts/admin-delete-user-by-email.ts <email> [email...]");
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Supabase env");
    process.exit(1);
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const stripe = stripeKey
    ? new Stripe(stripeKey, { apiVersion: "2025-09-30.clover" })
    : null;

  for (const email of emails) {
    const user = await findUserByEmail(supabase, email);
    if (!user?.id) {
      console.log(`Not found: ${email}`);
      continue;
    }
    console.log(`Deleting ${email} (${user.id})...`);
    await deleteUserAccount(supabase, stripe, user.id, email);
    console.log(`Deleted: ${email}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
