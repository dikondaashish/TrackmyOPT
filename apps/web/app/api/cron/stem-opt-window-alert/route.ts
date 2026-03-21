/**
 * STEM OPT extension window alert — cron (90 days before OPT EAD end).
 *
 * Triggered by cron-job.org via GET + Authorization: Bearer CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendStemOptWindowEmail } from "@/lib/notifications/transactional-emails";
import { sanitizeError } from "@/lib/secure-logger";

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

  const authHeader = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expectedAuth) {
    console.error("⚠️ Unauthorized stem-opt-window-alert cron attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      console.error("❌ Error fetching opt_status:", optErr);
      return NextResponse.json({ error: optErr.message }, { status: 500 });
    }

    const rawCount = optRows?.length ?? 0;
    console.log(
      `📊 STEM OPT window query: ${rawCount} row(s) with opt_ead_end_date between ${minEad} and ${maxEad} (UTC), stem_start_date IS NULL`
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
      console.error("❌ Error fetching profiles:", profErr);
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
        console.log(`ℹ️ No profile for user ${row.user_id}, skipping`);
        continue;
      }
      const toEmail = resolveStemOptTargetEmail(prof);
      if (!toEmail) {
        console.log(`ℹ️ No sendable email for user ${row.user_id}, skipping`);
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
    console.log(`📊 STEM OPT window: ${processed} user(s) ready to process (after profile + email resolution)`);

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
            console.log(`⏭️ Dedup skip (60d): ${c.toEmail} user=${c.user_id}`);
          } else if (result.skipped === "blocked") {
            skipped_blocked++;
            console.log(`🚫 Blocked: ${c.toEmail} user=${c.user_id}`);
          } else {
            sent++;
            console.log(`✅ stem_opt_window_open sent: ${c.toEmail} user=${c.user_id}`);
          }
        } else {
          failed++;
          console.error(`❌ sendStemOptWindowEmail failed user=${c.user_id}: ${result.error}`);
        }

        await new Promise((r) => setTimeout(r, 200));
      } catch (err: unknown) {
        failed++;
        console.error(`❌ Error user ${c.user_id}:`, sanitizeError(err));
      }
    }

    const duration_ms = Date.now() - startTime;
    console.log(
      `✅ STEM OPT window job done in ${duration_ms}ms — processed=${processed} sent=${sent} skipped_dedup=${skipped_dedup} skipped_blocked=${skipped_blocked} failed=${failed}`
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
    console.error("❌ stem-opt-window-alert cron error:", sanitizeError(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
