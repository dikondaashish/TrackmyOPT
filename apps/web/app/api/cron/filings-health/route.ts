import { NextRequest, NextResponse } from "next/server";
import { verifyCronAuth } from "@/lib/api/verify-cron-auth";
import { getSupabaseFilingsClient } from "@/lib/supabase/filings";
import { sanitizeError, secureLog } from "@/lib/secure-logger";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/** Lightweight daily keep-warm probe for the secondary filings project. */
export async function GET(request: NextRequest) {
  const denied = verifyCronAuth(request);
  if (denied) return denied;

  try {
    const started = Date.now();
    const { data, error } = await getSupabaseFilingsClient()
      .from("h1b_filings")
      .select("id")
      .limit(1);

    if (error) {
      secureLog.error("filings keep-warm probe failed:", sanitizeError(error));
      return NextResponse.json(
        { ok: false, error: "Filings project unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      ok: true,
      rowsChecked: data?.length ?? 0,
      durationMs: Date.now() - started,
    });
  } catch (error) {
    secureLog.error("filings keep-warm probe exception:", sanitizeError(error));
    return NextResponse.json(
      { ok: false, error: "Filings project unavailable" },
      { status: 503 }
    );
  }
}
