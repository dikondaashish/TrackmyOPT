import { withSentryApiErrors } from '@/lib/sentry/api-errors';
import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { getSupabaseFilingsClient } from "@/lib/supabase/filings";
import {
  checkOracleFilingsHealth,
  hasSupabaseFilingsFallback,
  isOracleFilingsStoreSelected,
  reportOracleFilingsFailure,
} from "@/lib/career/h1b/filings-store";
import { sanitizeError, secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

async function probeSupabaseFilings() {
  try {
    const started = Date.now();
    const { data, error } = await getSupabaseFilingsClient()
      .from("h1b_filings")
      .select("id")
      .limit(1);
    if (error) {
      secureLog.error("filings keep-warm probe failed:", sanitizeError(error));
      return null;
    }
    return { rowsChecked: data?.length ?? 0, durationMs: Date.now() - started };
  } catch (error) {
    secureLog.error("filings keep-warm probe exception:", sanitizeError(error));
    return null;
  }
}

async function probeOracleFilings() {
  try {
    const result = await checkOracleFilingsHealth();
    return result.ok ? result : null;
  } catch {
    return null;
  }
}

/**
 * Daily probe of the filings store(s). With Oracle selected it also keeps the
 * Always Free Oracle database active; the Supabase filings project is probed
 * while it is still configured, so it does not pause before retirement.
 * Non-2xx responses are intentional for cron alerting.
 */
async function handleGET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;

  const oracleSelected = isOracleFilingsStoreSelected();
  const supabaseConfigured = hasSupabaseFilingsFallback();

  const [oracle, supabase] = await Promise.all([
    oracleSelected ? probeOracleFilings() : Promise.resolve(undefined),
    supabaseConfigured ? probeSupabaseFilings() : Promise.resolve(undefined),
  ]);

  if (oracleSelected && !oracle) {
    reportOracleFilingsFailure("health", false);
  }

  const primaryHealthy = oracleSelected ? Boolean(oracle) : Boolean(supabase);
  const body = {
    ok: primaryHealthy && supabase !== null,
    primary: oracleSelected ? "oracle" : "supabase",
    oracle: oracleSelected ? oracle ?? { ok: false } : undefined,
    supabase: supabaseConfigured ? supabase ?? { ok: false } : undefined,
  };

  if (!body.ok) {
    return NextResponse.json(
      { ...body, error: "Filings store unavailable" },
      { status: 503 }
    );
  }
  return NextResponse.json(body);
}

export const GET = withSentryApiErrors(handleGET, '/api/cron/filings-health', 'GET');
