import { withSentryApiErrors } from '@/lib/sentry/api-errors';
/**
 * DISABLED — USCIS API compliance (July 2026).
 *
 * Former behavior: scanned sequential neighbor receipts around Pro users' enrolled
 * cases into uscis_case_cache. Implementation preserved in:
 * - lib/case-status/scan-nearby.ts
 * - lib/case-status/receipt-cohort.ts
 *
 * Pause the cron-job.org job; do not re-enable without counsel + USCIS sign-off.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function handleGET() {
  return NextResponse.json(
    {
      ok: false,
      error: "Nearby receipt scanning is permanently disabled for USCIS API compliance.",
      code: "nearby_scan_disabled",
    },
    { status: 410 }
  );
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/scan-nearby-cases', 'GET');
