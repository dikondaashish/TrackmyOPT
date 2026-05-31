/**
 * Send policy update notice to registered TrackMyOPT users.
 *
 * Default: dry-run (no SMTP). Requires --send for real delivery.
 *
 * Examples:
 *   pnpm policy-notice:dry-run
 *   npx tsx scripts/send-policy-update-notice.ts --test-email support@trackmyopt.com --send
 *   npx tsx scripts/send-policy-update-notice.ts --limit 10 --send
 *   npx tsx scripts/send-policy-update-notice.ts --send
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
  redactEmail,
  sendPolicyUpdateNoticeToRecipient,
  type PolicyNoticeRecipient,
} from "../lib/compliance/policy-update-notice";
import { getSmtpFromHeader } from "../lib/notifications/email-smtp";

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

  return {
    dryRun,
    limit,
    testEmail,
    send: argv.includes("--send"),
    debugRedacted: argv.includes("--debug-redacted"),
  };
}

function printProviderReadiness(): void {
  const smtpHost = process.env.SMTP_HOST?.trim() || "(missing)";
  const smtpPort = process.env.SMTP_PORT?.trim() || "465";
  const smtpUserSet = Boolean(process.env.SMTP_USER?.trim());
  const smtpPassSet = Boolean(process.env.SMTP_PASS?.trim());
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || "(default: no-reply@trackmyopt.com)";
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "TrackMyOPT";
  const fromHeader = getSmtpFromHeader();

  console.log("\n--- Email provider readiness (env only; verify DNS in Zoho/ZeptoMail) ---");
  console.log(`SMTP_HOST: ${smtpHost}`);
  console.log(`SMTP_PORT: ${smtpPort}`);
  console.log(`SMTP_USER set: ${smtpUserSet}`);
  console.log(`SMTP_PASS set: ${smtpPassSet}`);
  console.log(`From header: ${fromHeader}`);
  console.log(`SMTP_FROM_EMAIL: ${fromEmail}`);
  console.log(`EMAIL_FROM_NAME: ${fromName}`);
  console.log("Reply-To: (not set on policy notice — uses From mailbox; confirm support@trackmyopt.com in provider)");
  console.log("SPF/DKIM/DMARC: verify in Zoho ZeptoMail / DNS (not checked from this script)");
  console.log("Provider message ID: stored in policy_notice_email_events + email_queue on send");
}

function printDryRunStats(
  stats: Awaited<ReturnType<typeof loadPolicyNoticeRecipients>>["stats"],
  excluded: Awaited<ReturnType<typeof loadPolicyNoticeRecipients>>["excluded"],
  alreadySentCount: number,
  finalTargetCount: number
): void {
  console.log("\n--- Recipient counts ---");
  console.log(`Active auth users (valid email, not deleted): ${stats.activeAuthUsers}`);
  console.log(`Users with profiles: ${stats.usersWithProfiles}`);
  console.log(`Auth users without profiles: ${stats.authOnlyUsers}`);
  console.log(`Eligible profile-backed: ${stats.eligibleProfileBacked}`);
  console.log(`Eligible auth-only: ${stats.eligibleAuthOnly}`);
  console.log(`Total eligible: ${stats.totalEligible}`);
  console.log(`Excluded total: ${stats.excludedTotal}`);
  console.log(`  - blocked: ${stats.excludedBlocked}`);
  console.log(`  - internal/test/invalid domain: ${stats.excludedInternalOrTest}`);
  console.log(`  - invalid email: ${stats.excludedInvalid}`);
  console.log(`Duplicate emails removed: ${stats.duplicateEmailsRemoved}`);
  console.log(`Already-sent notice skipped (in filter): ${stats.alreadySentSkipped}`);
  console.log(`Already sent in DB (total): ${alreadySentCount}`);
  for (const row of excluded) {
    if (
      row.reason !== "blocked_email" &&
      row.reason !== "invalid_email" &&
      row.reason !== "test_account" &&
      row.reason !== "internal_account" &&
      row.reason !== "invalid_domain"
    ) {
      console.log(`  - ${row.reason}: ${row.count}`);
    }
  }
  console.log(`\nFinal target count this run: ${finalTargetCount}`);
}

async function main() {
  const { dryRun, limit, testEmail, send, debugRedacted } = parseArgs(process.argv.slice(2));

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

  printProviderReadiness();

  const [blocked, alreadySent] = await Promise.all([
    loadBlockedEmails(supabase),
    loadAlreadySentNoticeEmails(supabase),
  ]);

  const { eligible, excluded, stats } = await loadPolicyNoticeRecipients(supabase, {
    blockedEmails: blocked,
    alreadySentEmails: alreadySent,
  });

  if (debugRedacted && dryRun) {
    console.log("\n--- Debug: redacted eligible emails (first 20) ---");
    eligible.slice(0, 20).forEach((r) => {
      console.log(`  ${redactEmail(r.email)} profile=${r.firstName ? "yes" : "no"}`);
    });
    if (eligible.length > 20) {
      console.log(`  ... and ${eligible.length - 20} more`);
    }
  }

  if (testEmail) {
    console.log(`\nTest email override: ${redactEmail(testEmail)}`);
    const { subject, text } = buildPolicyUpdateNoticeEmailContent("Team");
    console.log(`Subject: ${subject}`);
    console.log("--- body preview (text) ---");
    console.log(text.slice(0, 400) + "...");
    if (dryRun) {
      printDryRunStats(stats, excluded, alreadySent.size, 0);
      console.log("\nDry run: would send test email only when --send is set.");
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
    console.log("Test send result:", {
      status: result.status,
      ...(result.status === "sent" ? { providerMessageId: result.providerMessageId } : {}),
      ...(result.status === "failed" ? { error: result.error } : {}),
      ...(result.status === "skipped" ? { reason: result.reason } : {}),
    });
    return;
  }

  const targets = typeof limit === "number" && limit > 0 ? eligible.slice(0, limit) : eligible;
  printDryRunStats(stats, excluded, alreadySent.size, targets.length);

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
        console.error(`Failed user_id=${recipient.userId}: ${result.error}`);
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
