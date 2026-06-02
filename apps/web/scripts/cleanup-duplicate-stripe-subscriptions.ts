/**
 * Cancel duplicate active/trialing Stripe subscriptions for one customer.
 * Keeps the highest-priority subscription (Dedicated > Pro; active > trialing).
 *
 * Usage:
 *   npx tsx scripts/cleanup-duplicate-stripe-subscriptions.ts user@example.com
 *   npx tsx scripts/cleanup-duplicate-stripe-subscriptions.ts --customer cus_xxx
 *   npx tsx scripts/cleanup-duplicate-stripe-subscriptions.ts user@example.com --confirm
 */

import * as dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  cancelOtherCustomerSubscriptions,
  listValidCustomerSubscriptions,
  pickBestSubscription,
  reconcileCustomerBilling,
  syncProfileFromSubscription,
} from "../lib/premium/stripeSubscriptionSync";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

type AdminSupabase = SupabaseClient<Database>;

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

async function main() {
  const args = process.argv.slice(2);
  const confirm = args.includes("--confirm");
  const filtered = args.filter((a) => a !== "--confirm");
  const input = filtered[0];

  if (!input) {
    console.error(
      "Usage: npx tsx scripts/cleanup-duplicate-stripe-subscriptions.ts <email> [--confirm]\n" +
        "       npx tsx scripts/cleanup-duplicate-stripe-subscriptions.ts --customer <cus_id> [--confirm]"
    );
    process.exit(1);
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing STRIPE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-09-30.clover",
  });

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  let customerId: string | null = null;
  let userId: string | null = null;

  if (input === "--customer" && filtered[1]) {
    customerId = filtered[1];
    const { data: prof } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    userId = prof?.user_id ?? null;
  } else {
    const user = await findUserByEmail(supabase, input);
    if (!user?.id) {
      console.error(`User not found: ${input}`);
      process.exit(1);
    }
    userId = user.id;
    const { data: prof } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();
    customerId = prof?.stripe_customer_id ?? null;
  }

  if (!customerId) {
    console.error("No stripe_customer_id on profile");
    process.exit(1);
  }
  if (!userId) {
    console.error("Could not resolve user_id for customer");
    process.exit(1);
  }

  const subs = await listValidCustomerSubscriptions(stripe, customerId);
  const keep = pickBestSubscription(subs);

  console.log(`Customer: ${customerId}`);
  console.log(`User: ${userId}`);
  console.log(`Valid subscriptions (${subs.length}):`);
  for (const s of subs) {
    console.log(`  - ${s.id} status=${s.status} plan=${s.metadata?.planId || "?"}`);
  }

  if (!keep) {
    console.log("No grantable subscription to keep. Nothing to do.");
    process.exit(0);
  }

  const toCancel = subs.filter((s) => s.id !== keep.id).map((s) => s.id);
  console.log(`\nKeep: ${keep.id} (${keep.metadata?.planId || "unknown"})`);
  console.log(`Cancel: ${toCancel.length ? toCancel.join(", ") : "(none)"}`);

  if (!confirm) {
    console.log("\nDry run only. Re-run with --confirm to cancel duplicates and sync profile.");
    process.exit(0);
  }

  if (toCancel.length) {
    const cancelled = await cancelOtherCustomerSubscriptions({
      stripe,
      customerId,
      keepSubscriptionId: keep.id,
      reason: "admin_duplicate_cleanup",
    });
    console.log(`Cancelled: ${cancelled.join(", ") || "(none)"}`);
  }

  await syncProfileFromSubscription({
    supabase,
    userId,
    customerId,
    subscription: keep,
  });

  await reconcileCustomerBilling({
    stripe,
    supabase,
    customerId,
    userId,
  });

  console.log("Profile synced to kept subscription.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
