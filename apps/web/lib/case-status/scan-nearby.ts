/**
 * Lazy, rate-limited scanner that fills the shared uscis_case_cache for
 * nearby-case cohort analysis. Designed to run in the background so a cohort
 * grows over time without hammering the USCIS API.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { checkUSCISStatus } from "@/lib/immigration/uscis-checker";
import { parseReceipt } from "@/lib/case-status/receipt-cohort";
import { assertNearbyScanEnabled } from "@/lib/uscis/nearby-scan";

/** Max receipts scanned per background invocation (USCIS is 10 TPS / 400k/day). */
export const SCAN_BATCH_LIMIT = 20;
/** Delay between USCIS calls to stay well under rate limits. */
const SCAN_DELAY_MS = 150;
/** Re-scan a cached receipt only after this many ms (1 day). */
export const RESCAN_AFTER_MS = 24 * 60 * 60 * 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function latestHistDate(
  hist: Array<{ date: string }> | undefined
): string | null {
  if (!hist?.length) return null;
  let latest: number | null = null;
  let latestRaw: string | null = null;
  for (const item of hist) {
    const ts = Date.parse(item.date);
    if (!Number.isNaN(ts) && (latest === null || ts > latest)) {
      latest = ts;
      latestRaw = item.date;
    }
  }
  return latestRaw;
}

export type ScanResult = { scanned: number; valid: number; invalid: number };

/**
 * Scan up to SCAN_BATCH_LIMIT of the provided receipts that are not already
 * fresh in the cache, writing results (including invalid 404s) back.
 */
export async function scanNearbyReceipts(
  supabase: SupabaseClient,
  receipts: string[]
): Promise<ScanResult> {
  assertNearbyScanEnabled();
  if (!process.env.USCIS_CLIENT_ID || !process.env.USCIS_CLIENT_SECRET) {
    return { scanned: 0, valid: 0, invalid: 0 };
  }

  const cutoff = new Date(Date.now() - RESCAN_AFTER_MS).toISOString();

  const { data: fresh } = await supabase
    .from("uscis_case_cache")
    .select("receipt_number")
    .in("receipt_number", receipts)
    .gte("last_scanned_at", cutoff);

  const freshSet = new Set((fresh ?? []).map((r) => r.receipt_number as string));
  const toScan = receipts.filter((r) => !freshSet.has(r)).slice(0, SCAN_BATCH_LIMIT);

  let valid = 0;
  let invalid = 0;

  for (const receipt of toScan) {
    const parsed = parseReceipt(receipt);
    if (!parsed) continue;

    const result = await checkUSCISStatus(receipt);
    const nowIso = new Date().toISOString();

    if (result.success) {
      valid += 1;
      await supabase.from("uscis_case_cache").upsert(
        {
          receipt_number: receipt,
          prefix: parsed.prefix,
          serial: parsed.serial,
          current_status: result.data.status,
          case_type: result.data.caseType,
          received_date: result.data.receivedDate,
          status_date: latestHistDate(result.data.histCaseStatus),
          is_valid: true,
          last_scanned_at: nowIso,
        },
        { onConflict: "receipt_number" }
      );
    } else if (result.error.code === 404 || result.error.code === 422) {
      invalid += 1;
      await supabase.from("uscis_case_cache").upsert(
        {
          receipt_number: receipt,
          prefix: parsed.prefix,
          serial: parsed.serial,
          current_status: null,
          case_type: null,
          is_valid: false,
          last_scanned_at: nowIso,
        },
        { onConflict: "receipt_number" }
      );
    }
    // For 429/5xx we skip writing so it retries on a later pass.

    await sleep(SCAN_DELAY_MS);
  }

  return { scanned: toScan.length, valid, invalid };
}
