/**
 * Send policy update notice to registered TrackMyOPT users.
 *
 * Default: dry-run (no SMTP). Requires --send for real delivery.
 *
 * Examples:
 *   pnpm tsx scripts/send-policy-update-notice.ts --dry-run
 *   pnpm tsx scripts/send-policy-update-notice.ts --test-email support@trackmyopt.com --send
 *   pnpm tsx scripts/send-policy-update-notice.ts --limit 10 --send
 *   pnpm tsx scripts/send-policy-update-notice.ts --send
 */

import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import {
  POLICY_UPDATE_NOTICE_TYPE,
  buildPolicyUpdateNoticeEmailContent,
  loadAlreadySentNoticeEmails,
  loadBlockedEmails,
  loadPolicyNoticeRecipients,
  sendPolicyUpdateNoticeToRecipient,
  type PolicyNoticeRecipient,
} from "../lib/compliance/policy-update-notice";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run") || !argv.includes("--send");
  const limitArg = argv.find((a) => a.startsWith("--limit="));
  const limitFlagIdx = argv.indexOf("--limit");
  let limit: number | undefined;
  if (limitArg) {
    limit = parseInt(limitArg.split("=")[1] ?? "", 10);
  } else if (limitFlagIdx >= 0 && argv[limitFlagIdx + 1]) {
    limit = parseInt(argv[limitFlagIdx + 1], 10);
  }

  const testEmailIdx = argv.indexOf("--test-email");
  const testEmail =
    testEmailIdx >= 0 && argv[testEmailIdx + 1] ? argv[testEmailIdx + 1].trim().toLowerCase() : undefined;

  return { dryRun, limit, testEmail, send: argv.includes("--send") };
}

async function main() {
  const { dryRun, limit, testEmail, send } = parseArgs(process.argv.slice(2));

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  if (!dryRun && !send) {
    console.error("Real sends require --send (or use --dry-run explicitly).");
    process.exit(1);
  }

  if (!dryRun && !process.env.SMTP_HOST) {
    console.error("SMTP_HOST is required for --send");
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  console.log("TrackMyOPT policy update notice");
  console.log(`Mode: ${dryRun ? "DRY RUN (no emails sent)" : "SEND"}`);
  console.log(`Notice type: ${POLICY_UPDATE_NOTICE_TYPE}`);

  const [blocked, alreadySent] = await Promise.all([
    loadBlockedEmails(supabase),
    loadAlreadySentNoticeEmails(supabase),
  ]);

  const { eligible, excluded, stats } = await loadPolicyNoticeRecipients(supabase, {
    blockedEmails: blocked,
    alreadySentEmails: alreadySent,
  });

  if (testEmail) {
    console.log(`Test email override: ${testEmail}`);
    const { subject, text } = buildPolicyUpdateNoticeEmailContent("Team");
    console.log(`Subject: ${subject}`);
    console.log("--- body preview (text) ---");
    console.log(text.slice(0, 400) + "...");
    if (dryRun) {
      console.log("Dry run: would send test email only when --send is set.");
      return;
    }

    const profileMatch = eligible.find((r) => r.email === testEmail);
    const testRecipient: PolicyNoticeRecipient = profileMatch ?? {
      userId: "00000000-0000-0000-0000-000000000000",
      email: testEmail,
      firstName: null,
    };

    const result = await sendPolicyUpdateNoticeToRecipient({
      supabase,
      recipient: testRecipient,
      dryRun: false,
    });
    console.log("Test send result:", result);
    return;
  }

  console.log("\n--- Recipient counts ---");
  console.log(`Total registered (profiles + active auth): ${stats.totalRegistered}`);
  console.log(`Eligible to send: ${stats.eligible}`);
  console.log(`Excluded total: ${stats.excludedTotal}`);
  console.log(`Duplicate emails removed: ${stats.duplicateEmailsRemoved}`);
  for (const row of excluded) {
    console.log(`  - ${row.reason}: ${row.count}`);
  }
  console.log(`Already sent (skipped): ${alreadySent.size}`);

  const targets = typeof limit === "number" && limit > 0 ? eligible.slice(0, limit) : eligible;
  console.log(`\nBatch targets this run: ${targets.length}`);

  if (dryRun) {
    console.log("\nDry run complete. No emails sent. Review counts, then use --send with --test-email or --limit.");
    return;
  }

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    console.log(`\nSending batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} recipients)...`);

    for (const recipient of batch) {
      const result = await sendPolicyUpdateNoticeToRecipient({
        supabase,
        recipient,
        dryRun: false,
      });

      if (result.status === "sent") {
        sent += 1;
      } else if (result.status === "skipped") {
        skipped += 1;
      } else {
        failed += 1;
        console.error(`Failed ${recipient.userId}: ${result.error}`);
      }
    }

    if (i + BATCH_SIZE < targets.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log("\n--- Send summary ---");
  console.log(`Sent: ${sent}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
