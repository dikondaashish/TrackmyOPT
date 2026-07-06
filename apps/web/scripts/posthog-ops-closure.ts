/**
 * One-shot PostHog operational closure (Phases 0 + 4):
 * - LTV person-property backfill from payment_transactions
 * - university_partner group sync from referrals
 * - Historical billing events (payment_succeeded, subscription_started) from Supabase
 *
 * Usage:
 *   npx tsx scripts/posthog-ops-closure.ts
 *   npx tsx scripts/posthog-ops-closure.ts --dry-run
 */

import * as dotenv from "dotenv";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  findLtvSyncCandidates,
  syncLtvBatch,
} from "../lib/posthog/ltv-sync";
import {
  listActiveUniversityPartners,
  toPartnerGroupProperties,
  UNIVERSITY_PARTNER_GROUP_TYPE,
} from "../lib/posthog/university-partner-groups";
import {
  billingInsertId,
  buildPaymentSucceededCapture,
} from "../lib/posthog/billing-analytics";
import {
  captureServerEvent,
  identifyServerGroup,
  normalizePlanTier,
} from "../lib/posthog-server";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const dryRun = process.argv.includes("--dry-run");

type AdminSupabase = SupabaseClient<Database>;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name} in .env.local`);
  return value;
}

async function runLtvBackfill(
  supabase: AdminSupabase
): Promise<{ processed: number; synced: number }> {
  let offset = 0;
  let processed = 0;
  let synced = 0;

  while (true) {
    const userIds = await findLtvSyncCandidates(supabase, {
      limit: 200,
      offset,
    });
    if (userIds.length === 0) break;

    if (dryRun) {
      console.log(`[ltv] dry-run batch offset=${offset} users=${userIds.length}`);
    } else {
      const result = await syncLtvBatch(supabase, userIds);
      synced += result.synced;
      console.log(
        `[ltv] offset=${offset} processed=${userIds.length} synced=${result.synced} skipped=${result.skipped}`
      );
    }

    processed += userIds.length;
    if (userIds.length < 200) break;
    offset += 200;
  }

  return { processed, synced };
}

async function runPartnerGroupSync(
  supabase: AdminSupabase
): Promise<number> {
  const partners = await listActiveUniversityPartners(supabase, { limit: 200 });
  if (dryRun) {
    console.log(`[partners] dry-run would sync ${partners.length} group(s)`);
    return partners.length;
  }

  for (const partner of partners) {
    await identifyServerGroup(
      UNIVERSITY_PARTNER_GROUP_TYPE,
      partner.code,
      toPartnerGroupProperties(partner)
    );
  }
  console.log(`[partners] synced ${partners.length} group(s)`);
  return partners.length;
}

async function runBillingBackfill(
  supabase: AdminSupabase
): Promise<{ payments: number; subscriptions: number }> {
  const { data: payments, error: payErr } = await supabase
    .from("payment_transactions")
    .select(
      "user_id, amount, currency, stripe_payment_intent_id, plan_id, metadata"
    )
    .eq("status", "succeeded")
    .order("created_at", { ascending: true });

  if (payErr) throw new Error(payErr.message);

  let paymentCount = 0;
  for (const row of payments ?? []) {
    const meta = (row.metadata ?? {}) as Record<string, string | undefined>;
    const planTier = normalizePlanTier(
      row.plan_id || meta.planId || meta.plan_id || "pro"
    );
    const interval =
      meta.interval === "month" || meta.interval === "monthly"
        ? "monthly"
        : meta.interval === "year" || meta.interval === "yearly"
          ? "yearly"
          : undefined;

    if (dryRun) {
      paymentCount += 1;
      continue;
    }

    await captureServerEvent(
      row.user_id,
      "payment_succeeded",
      buildPaymentSucceededCapture({
        stripeEventId: row.stripe_payment_intent_id,
        planTier,
        interval,
        amountCents: row.amount,
        currency: row.currency || "usd",
      })
    );
    paymentCount += 1;
  }

  const { data: subs, error: subErr } = await supabase
    .from("profiles")
    .select("user_id, plan_tier")
    .eq("premium_status", true);

  if (subErr) throw new Error(subErr.message);

  let subCount = 0;
  for (const profile of subs ?? []) {
    if (dryRun) {
      subCount += 1;
      continue;
    }

    await captureServerEvent(profile.user_id, "subscription_started", {
      $insert_id: billingInsertId(
        "subscription_started",
        `backfill:${profile.user_id}`
      ),
      plan_tier: normalizePlanTier(profile.plan_tier),
      had_trial: false,
      is_upgrade: false,
      backfill: true,
    });
    subCount += 1;
  }

  console.log(
    `[billing] ${dryRun ? "dry-run" : "sent"} payment_succeeded=${paymentCount} subscription_started=${subCount}`
  );
  return { payments: paymentCount, subscriptions: subCount };
}

async function main(): Promise<void> {
  requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  requireEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN");

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log(`PostHog ops closure${dryRun ? " (dry-run)" : ""}…`);

  const ltv = await runLtvBackfill(supabase);
  const partners = await runPartnerGroupSync(supabase);
  const billing = await runBillingBackfill(supabase);

  console.log("\nSummary:", { ltv, partners, billing });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
