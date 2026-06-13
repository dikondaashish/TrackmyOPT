/** Safe 3-letter receipt prefix only (e.g. IOE). Never pass full receipt numbers. */
export function getReceiptPrefix(receiptNumber: string | null | undefined): string | null {
  if (!receiptNumber || typeof receiptNumber !== "string") return null;
  const trimmed = receiptNumber.trim().toUpperCase();
  if (trimmed.length < 3) return null;
  return trimmed.substring(0, 3);
}

/** Normalized USCIS status bucket — never send raw USCIS text to PostHog. */
export function normalizeStatusCategory(status: string | null | undefined): string {
  if (!status) return "unknown";
  const s = status.toLowerCase();

  if (s.includes("delivered") || s.includes("produced") || s.includes("approved")) {
    return "approved";
  }
  if (s.includes("denied") || s.includes("rejected")) {
    return "denied";
  }
  if (s.includes("withdraw")) {
    return "withdrawn";
  }
  if (s.includes("request for evidence") || s.includes("rfe")) {
    return "rfe";
  }
  if (s.includes("transferred")) {
    return "transferred";
  }
  if (s.includes("received")) {
    return "received";
  }
  if (
    s.includes("pending") ||
    s.includes("under review") ||
    s.includes("being processed") ||
    s.includes("fingerprints") ||
    s.includes("interview")
  ) {
    return "pending";
  }

  return "other";
}

export function isPendingStatus(status: string | null | undefined): boolean {
  const category = normalizeStatusCategory(status);
  return (
    category === "pending" ||
    category === "received" ||
    category === "rfe" ||
    category === "other" ||
    category === "unknown"
  );
}
