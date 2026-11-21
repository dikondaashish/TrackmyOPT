import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import {
  checkOracleFilingsHealth,
  reportOracleFilingsFailure,
} from "@/lib/career/h1b/filings-store";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

async function probeOracleFilings() {
  try {
    const result = await checkOracleFilingsHealth();
    return result.ok ? result : null;
  } catch {
    return null;
  }
}

/**
 * Daily probe of the Oracle filings copy through the API service. It also
 * keeps the Always Free Oracle database active. Non-2xx responses are
 * intentional for cron alerting.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;

  const oracle = await probeOracleFilings();
  if (!oracle) {
    reportOracleFilingsFailure("health");
    return NextResponse.json(
      { ok: false, oracle: { ok: false }, error: "Filings store unavailable" },
      { status: 503 }
    );
  }
  return NextResponse.json({ ok: true, oracle });
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/filings-health', 'GET');
