/**
 * Shared receipt enrollment: POST /api/case-status then poll until USCIS status is available.
 * Used by onboarding wizard and case-status dashboard (single save path).
 */

export type CaseStatusRecord = {
  receipt_number: string;
  current_status: string | null;
  last_checked_at: string | null;
  [key: string]: unknown;
};

type SaveReceiptAndPollResult =
  | { ok: true; data: CaseStatusRecord; statusResolved: boolean }
  | { ok: false; error: string; code?: string };

type SaveReceiptOptions = {
  notificationsEnabled?: boolean;
  maxAttempts?: number;
  pollIntervalMs?: number;
};

function isResolvedStatus(data: CaseStatusRecord | null | undefined): boolean {
  if (!data?.current_status || !data.last_checked_at) return false;
  return data.current_status !== "Status will be fetched shortly...";
}

async function fetchCaseStatus(): Promise<CaseStatusRecord | null> {
  const response = await fetch("/api/case-status", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;

  const result = await response.json();
  if (result.ok && result.data) {
    return result.data as CaseStatusRecord;
  }
  return null;
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
    maxAttempts = 10,
    pollIntervalMs = 2000,
  } = options;

  const response = await fetch("/api/case-status", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      receipt_number: receiptNumber,
      notifications_enabled: notificationsEnabled,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || !result.ok) {
    return {
      ok: false,
      error:
        (typeof result.error === "string" && result.error) ||
        "Failed to save receipt number.",
      code: typeof result.code === "string" ? result.code : undefined,
    };
  }

  const saved = (result.data ?? null) as CaseStatusRecord | null;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    const data = await fetchCaseStatus();
    if (isResolvedStatus(data)) {
      return { ok: true, data: data!, statusResolved: true };
    }
  }

  const latest = (await fetchCaseStatus()) ?? saved;
  if (latest) {
    return { ok: true, data: latest, statusResolved: isResolvedStatus(latest) };
  }

  return { ok: false, error: "Could not load case status after saving." };
}
