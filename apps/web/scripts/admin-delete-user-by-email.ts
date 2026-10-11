/**
 * Admin: delete user(s) by email (ordinary account deletion; no permanent email block).
 * Usage: npx tsx scripts/admin-delete-user-by-email.ts email@example.com [email2...]
 */

import * as dotenv from "dotenv";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { deleteAccountData } from "../lib/privacy/delete-account-data";
import type { Database } from "@/types/supabase";
import { cancelStripeSubscriptionsForCustomer } from "../lib/premium/cancel-stripe-subscriptions-for-customer";

type AdminSupabase = SupabaseClient<Database>;

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

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
  const { data: billingProfile, error: billingError } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (billingError) throw new Error("Account deletion: billing lookup failed");
  const stripeCustomerId = billingProfile?.stripe_customer_id?.trim() || null;
  if (stripeCustomerId) {
    if (!stripe) throw new Error("Account deletion: payment provider unavailable");
    try {
      await cancelStripeSubscriptionsForCustomer(stripe, stripeCustomerId);
    } catch (err: unknown) {
      const code = typeof err === 'object' && err !== null && 'code' in err
        ? String((err as { code: unknown }).code) : '';
      if (code !== 'resource_missing') throw new Error('Account deletion: subscription cancellation failed');
    }
  }
  await deleteAccountData(supabase as SupabaseClient, userId, userEmail);

  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteError) throw new Error("Account deletion: Auth cleanup failed");
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
    ? new Stripe(stripeKey, { apiVersion: "2026-08-26.dahlia" })
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
