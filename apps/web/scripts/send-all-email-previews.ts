/**
 * Send one copy of every product email template to support@trackmyopt.com for visual QA.
 *
 * Usage:
 *   npx tsx scripts/send-all-email-previews.ts
 *   npx tsx scripts/send-all-email-previews.ts --to support@trackmyopt.com
 *   npx tsx scripts/send-all-email-previews.ts --dry-run
 *
 * Requires SMTP_* in apps/web/.env.local (same as production transactional mail).
 *
 * Not included (configured in Supabase Dashboard only):
 *   - Sign up / email confirmation
 *   - Password reset
 *   - Magic link
 */

import * as dotenv from "dotenv";
import path from "path";
import { getSmtpFromHeader, sendMailWithRetry } from "../lib/notifications/email-smtp";
import {
  DEFAULT_PREVIEW_RECIPIENT,
  getAllEmailPreviews,
} from "../lib/notifications/email-preview-catalog";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const DELAY_MS = 1200;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const toIdx = argv.indexOf("--to");
  const to =
    toIdx >= 0 && argv[toIdx + 1]
      ? argv[toIdx + 1].trim().toLowerCase()
      : DEFAULT_PREVIEW_RECIPIENT;
  return { dryRun, to };
}

async function main() {
  const { dryRun, to } = parseArgs(process.argv.slice(2));
  const previews = getAllEmailPreviews("Alex");

  if (!process.env.SMTP_HOST && !dryRun) {
    console.error("Missing SMTP_HOST — add apps/web/.env.local or use --dry-run");
    process.exit(1);
  }

  console.log(`Recipient: ${to}`);
  console.log(`Templates: ${previews.length}`);
  console.log(dryRun ? "Mode: DRY RUN (no SMTP)" : "Mode: SEND");
  console.log("---");

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < previews.length; i++) {
    const p = previews[i]!;
    const n = i + 1;
    const subject = `[Preview ${n}/${previews.length}] [${p.category}] ${p.subject}`;

    if (dryRun) {
      console.log(`${n}. ${p.id} — ${subject}`);
      continue;
    }

    try {
      const info = await sendMailWithRetry({
        from: getSmtpFromHeader(),
        to,
        subject,
        html: p.html,
        text: `Preview: ${p.id}\n\nOpen the HTML version of this message to review the template.`,
      });
      console.log(`✓ ${n}/${previews.length} ${p.id} → ${info.messageId}`);
      sent++;
      if (i < previews.length - 1) await sleep(DELAY_MS);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`✗ ${n}/${previews.length} ${p.id}: ${msg}`);
      failed++;
    }
  }

  console.log("---");
  if (dryRun) {
    console.log(`Listed ${previews.length} templates. Re-run without --dry-run to send.`);
  } else {
    console.log(`Done. Sent: ${sent}, failed: ${failed}`);
    console.log(
      "\nNote: Supabase Auth emails (signup confirm, password reset, magic link) are not sent from this script."
    );
  }

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
