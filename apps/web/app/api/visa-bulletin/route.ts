import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Phase 5 scaffold — visa bulletin integration placeholder.
 * Replace with State Dept / USCIS bulletin ingestion when ready.
 */
async function handleGET() {
  return NextResponse.json({
    ok: true,
    status: "coming_soon",
    message:
      "Visa bulletin tracking is on the roadmap. Subscribe to Pro case alerts for priority filing reminders today.",
    bulletin: null,
    lastChecked: new Date().toISOString(),
  });
}

export const GET = withSentryApiErrors(handleGET, '/api/visa-bulletin', 'GET');
