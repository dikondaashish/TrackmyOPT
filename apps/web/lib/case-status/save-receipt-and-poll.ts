/**
 * Shared receipt enrollment: POST /api/case-status then poll until USCIS status is available.
 * Used by onboarding wizard and case-status dashboard (single save path).
 */

import type { FilingCategory } from "@/lib/case-status/filing-category";
import {
  reportReceiptEntryFailure,
  trackReceiptEntry,
  type ReceiptEntrySource,
} from "./receipt-entry-observability";

export type CaseStatusRecord = {
  receipt_number: string;
  current_status: string | null;
  last_checked_at: string | null;
  filing_category?: FilingCategory | string | null;
  [key: string]: unknown;
};

type SaveReceiptAndPollResult =
  | { ok: true; data: CaseStatusRecord; statusResolved: boolean }
  | { ok: false; error: string; code?: string };

type SaveReceiptOptions = {
  notificationsEnabled?: boolean;
  filingCategory?: FilingCategory;
  maxAttempts?: number;
  pollIntervalMs?: number;
  source?: ReceiptEntrySource;
  setPrimary?: boolean;
};

function isResolvedStatus(data: CaseStatusRecord | null | undefined): boolean {
  if (!data?.current_status || !data.last_checked_at) return false;
  return data.current_status !== "Status will be fetched shortly...";
}

/**
 * Saves receipt via the existing case-status API (fires server-side receipt_added on first save).
 * Triggers the initial USCIS check server-side; polls GET until status is ready or attempts exhaust.
 */
export async function saveReceiptAndPoll(
  receiptNumber: string,
  options: SaveReceiptOptions = {}
): Promise<SaveReceiptAndPollResult> {
  const {
    notificationsEnabled = true,
    filingCategory,
    maxAttempts = 10,
    pollIntervalMs = 2000,
    source = "onboarding_wizard",
    setPrimary,
  } = options;

  let response: Response;
  try {
    response = await fetch("/api/case-status", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receipt_number: receiptNumber,
        notifications_enabled: notificationsEnabled,
        ...(filingCategory ? { filing_category: filingCategory } : {}),
        ...(setPrimary !== undefined ? { set_primary: setPrimary } : {}),
      }),
    });
  } catch {
    reportReceiptEntryFailure(source, "save", "network");
    trackReceiptEntry("receipt_entry_save_failed", source, "network");
    return {
      ok: false,
      error:
        "Could not save your receipt. Check your connection and try again.",
    };
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result?.ok) {
    // API 5xx responses are already reported by the server wrapper and browser
    // HTTP integration. Explicitly report application/invalid-body failures.
    if (response.ok) reportReceiptEntryFailure(source, "save", "response");
    trackReceiptEntry(
      "receipt_entry_save_failed",
      source,
      result?.code === "case_limit_reached" ? "limit" : "request"
    );
    return {
      ok: false,
      error:
        (typeof result?.error === "string" && result.error) ||
        "Failed to save receipt number.",
      code: typeof result?.code === "string" ? result.code : undefined,
    };
  }

  const saved = (result.data ?? null) as CaseStatusRecord | null;
  if (!saved || saved.receipt_number !== receiptNumber) {
    reportReceiptEntryFailure(source, "save", "response");
    trackReceiptEntry("receipt_entry_save_failed", source, "response");
    return {
      ok: false,
      error: "Could not confirm your receipt was saved. Please try again.",
    };
  }
  trackReceiptEntry("receipt_entry_saved", source);

  // Resolve the receipt just saved, not another primary case on this account.
  let pollFailureReported = false;
  const reportPollFailure = (kind: "network" | "response") => {
    if (pollFailureReported) return;
    pollFailureReported = true;
    reportReceiptEntryFailure(source, "poll", kind);
  };
  const fetchCaseStatus = async (): Promise<CaseStatusRecord | null> => {
    let pollResponse: Response;
    try {
      pollResponse = await fetch("/api/case-status", {
        credentials: "include",
        cache: "no-store",
      });
    } catch {
      reportPollFailure("network");
      return null;
    }
    if (!pollResponse.ok) return null;
    try {
      const pollResult = await pollResponse.json();
      if (!pollResult.ok) {
        reportPollFailure("response");
        return null;
      }
      const cases: CaseStatusRecord[] = Array.isArray(pollResult.cases)
        ? pollResult.cases
        : pollResult.data
          ? [pollResult.data]
          : [];
      return cases.find((c) => c.receipt_number === receiptNumber) ?? null;
    } catch {
      reportPollFailure("response");
      return null;
    }
  };

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    const data = await fetchCaseStatus();
    if (isResolvedStatus(data)) {
      trackReceiptEntry("receipt_entry_status_resolved", source);
      return { ok: true, data: data!, statusResolved: true };
    }
  }

  const latest = (await fetchCaseStatus()) ?? saved;
  if (latest) {
    const statusResolved = isResolvedStatus(latest);
    if (statusResolved)
      trackReceiptEntry("receipt_entry_status_resolved", source);
    return { ok: true, data: latest, statusResolved };
  }

  return { ok: false, error: "Could not load case status after saving." };
}
