import "server-only";

import * as Sentry from "@sentry/nextjs";

export type FilingRecord = Record<string, unknown>;

const ORACLE_TIMEOUT_MS = 8_000;

/** True only when an explicit opt-in serves filings from the Oracle copy. */
export function isOracleFilingsStoreSelected() {
  return process.env.H1B_FILINGS_STORE === "oracle";
}

/** The Supabase filings project remains a fallback while it is configured. */
export function hasSupabaseFilingsFallback() {
  return Boolean(
    process.env.SUPABASE_FILINGS_URL &&
      process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY
  );
}

function apiConfiguration() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiUrl || !apiKey) throw new Error("Filings API is not configured");
  return { apiUrl, apiKey };
}

async function getFromApi<T>(path: string): Promise<T> {
  const { apiUrl, apiKey } = apiConfiguration();
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { "x-api-key": apiKey },
    cache: "no-store",
    signal: AbortSignal.timeout(ORACLE_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Filings API responded ${response.status}`);
  }
  return (await response.json()) as T;
}

/**
 * Filings for a sponsor profile from the Oracle copy, via the API service.
 * The API runs the same sponsor-id / employer-name lookup as before.
 */
export async function listOracleFilings(
  sponsorId: string,
  employerName: string | null | undefined
): Promise<FilingRecord[]> {
  const params = new URLSearchParams({ sponsorId });
  if (employerName) params.set("employerName", employerName);
  const payload = await getFromApi<{ filings?: unknown }>(
    `/sponsor-data/filings?${params.toString()}`
  );
  if (!Array.isArray(payload.filings)) {
    throw new Error("Filings API returned an invalid payload");
  }
  return payload.filings as FilingRecord[];
}

export async function checkOracleFilingsHealth() {
  return getFromApi<{ ok?: boolean; rowsChecked?: number; durationMs?: number }>(
    "/sponsor-data/filings/health"
  );
}

/**
 * Report an Oracle read failure without applicant data. Called even when the
 * request still succeeds through the Supabase fallback, so the degraded path
 * is visible in Sentry.
 */
export function reportOracleFilingsFailure(
  stage: "profile" | "health",
  fallback: boolean
) {
  Sentry.captureException(
    new Error(
      `H-1B filings Oracle ${stage} read failed${fallback ? "; served from Supabase fallback" : ""}`
    )
  );
}
