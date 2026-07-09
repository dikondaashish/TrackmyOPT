/**
 * Weekly partner group sync — refreshes university_partner group properties in PostHog.
 *
 * Schedule on cron-job.org (not Vercel Cron). Suggested: weekly Monday 7:00 AM UTC.
 *
 * Env: POSTHOG_PARTNER_GROUPS_SYNC_ENABLED=true
 *
 * Manual test:
 *   curl -s "https://www.trackmyopt.com/api/cron/posthog-partner-groups-sync" \
 *     -H "Authorization: Bearer YOUR_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { createClient } from "@supabase/supabase-js";
import {
  listActiveUniversityPartners,
  toPartnerGroupProperties,
  UNIVERSITY_PARTNER_GROUP_TYPE,
} from "@/lib/posthog/university-partner-groups";
import { identifyServerGroup } from "@/lib/posthog-server";
import { sanitizeError, secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const cronAuthError = verifyCronAuth(req);
  if (cronAuthError) return cronAuthError;

  if (process.env.POSTHOG_PARTNER_GROUPS_SYNC_ENABLED !== "true") {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "POSTHOG_PARTNER_GROUPS_SYNC_ENABLED is not true.",
    });
  }

  try {
    const partners = await listActiveUniversityPartners(supabase, { limit: 200 });
    let synced = 0;

    for (const partner of partners) {
      await identifyServerGroup(
        UNIVERSITY_PARTNER_GROUP_TYPE,
        partner.code,
        toPartnerGroupProperties(partner)
      );
      synced += 1;
    }

    return NextResponse.json({
      ok: true,
      synced,
      durationMs: Date.now() - startTime,
    });
  } catch (error: unknown) {
    secureLog.error("posthog-partner-groups-sync error:", sanitizeError(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
