/**
 * STEM OPT extension window alert — cron (90 days before OPT EAD end).
 *
 * Triggered by cron-job.org via GET + Authorization: Bearer CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import { sendStemOptWindowEmail } from "@/lib/notifications/transactional/alerts";
import { sanitizeError, secureLog, logIdPrefix } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/** Today (UTC) + n calendar days, as YYYY-MM-DD for DATE column filters */
function utcDatePlusDays(days: number): string {
  const now = new Date();
  const utc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  utc.setUTCDate(utc.getUTCDate() + days);
  return utc.toISOString().slice(0, 10);
}

function resolveStemOptTargetEmail(p: {
  stem_apply_email: string | null;
  notification_email: string | null;
  email: string | null;
}): string | null {
  const a = p.stem_apply_email?.trim();
  if (a) return a;
  const b = p.notification_email?.trim();
  if (b) return b;
  const c = p.email?.trim();
  if (c) return c;
  return null;
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  const minEad = utcDatePlusDays(89);
  const maxEad = utcDatePlusDays(91);

  let processed = 0;
  let sent = 0;
  let skipped_dedup = 0;
  let skipped_blocked = 0;
  let failed = 0;

  try {
    const { data: optRows, error: optErr } = await supabase
      .from("opt_status")
      .select("user_id, opt_ead_end_date, stem_start_date")
      .is("stem_start_date", null)
      .gte("opt_ead_end_date", minEad)
      .lte("opt_ead_end_date", maxEad);

    if (optErr) {
      secureLog.error("Error fetching opt_status (stem-opt-window):", sanitizeError(optErr));
      return NextResponse.json({ error: optErr.message }, { status: 500 });
    }

    const rawCount = optRows?.length ?? 0;
    secureLog.info(
      `STEM OPT window query: ${rawCount} row(s) opt_ead_end_date ${minEad}–${maxEad} (UTC), stem_start_date IS NULL`,
    );

    if (rawCount === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        sent: 0,
        skipped_dedup: 0,
        skipped_blocked: 0,
        failed: 0,
      });
    }

    const userIds = [...new Set((optRows || []).map((r) => r.user_id))];

    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("user_id, first_name, email, notification_email, stem_apply_email")
      .in("user_id", userIds);

    if (profErr) {
      secureLog.error("Error fetching profiles (stem-opt-window):", sanitizeError(profErr));
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    const profileByUser = new Map((profiles || []).map((p) => [p.user_id, p]));

    type Candidate = {
      user_id: string;
      opt_ead_end_date: string;
      first_name: string | null;
      toEmail: string;
    };

    const candidates: Candidate[] = [];

    for (const row of optRows || []) {
      const prof = profileByUser.get(row.user_id);
      if (!prof) {
        secureLog.info(`No profile for user ${logIdPrefix(row.user_id)}, skipping`);
        continue;
      }
      const toEmail = resolveStemOptTargetEmail(prof);
      if (!toEmail) {
        secureLog.info(`No sendable email for user ${logIdPrefix(row.user_id)}, skipping`);
        continue;
      }
      candidates.push({
        user_id: row.user_id,
        opt_ead_end_date: row.opt_ead_end_date as string,
        first_name: prof.first_name,
        toEmail,
      });
    }

    processed = candidates.length;
    secureLog.info(`STEM OPT window: ${processed} user(s) ready to process`);

    for (const c of candidates) {
      try {
        const result = await sendStemOptWindowEmail({
          supabase,
          userId: c.user_id,
          toEmail: c.toEmail,
          firstName: c.first_name,
          optEadEndDate: c.opt_ead_end_date,
        });

        if (result.ok) {
          if (result.skipped === "deduped") {
            skipped_dedup++;
            secureLog.info(`Dedup skip (60d) user=${logIdPrefix(c.user_id)}`);
          } else if (result.skipped === "blocked") {
            skipped_blocked++;
            secureLog.info(`Blocked user=${logIdPrefix(c.user_id)}`);
          } else {
            sent++;
            secureLog.info(`stem_opt_window_open sent user=${logIdPrefix(c.user_id)}`);
          }
        } else {
          failed++;
          secureLog.error(`sendStemOptWindowEmail failed user=${logIdPrefix(c.user_id)}: ${result.error}`);
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (err: unknown) {
        failed++;
        secureLog.error(`Error user ${logIdPrefix(c.user_id)}:`, sanitizeError(err));
      }
    }

    const duration_ms = Date.now() - startTime;
    secureLog.info(
      `STEM OPT window job done in ${duration_ms}ms — processed=${processed} sent=${sent} skipped_dedup=${skipped_dedup} skipped_blocked=${skipped_blocked} failed=${failed}`,
    );

    return NextResponse.json({
      success: true,
      processed,
      sent,
      skipped_dedup,
      skipped_blocked,
      failed,
    });
  } catch (error: unknown) {
    secureLog.error("stem-opt-window-alert cron error:", sanitizeError(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
