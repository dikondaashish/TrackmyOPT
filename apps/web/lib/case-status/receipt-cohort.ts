/**
 * Receipt number parsing and range generation for nearby-case cohort analysis.
 * USCIS receipts are a 3-letter prefix + 10-digit serial (e.g. IOE9822487119).
 */

export type ParsedReceipt = { prefix: string; serial: number };

const RECEIPT_PATTERN = /^([A-Z]{3})(\d{10})$/;

export function parseReceipt(receipt: string): ParsedReceipt | null {
  const match = receipt.trim().toUpperCase().match(RECEIPT_PATTERN);
  if (!match) return null;
  return { prefix: match[1]!, serial: Number(match[2]!) };
}

export function formatReceipt(prefix: string, serial: number): string {
  return `${prefix}${String(serial).padStart(10, "0")}`;
}

/** Largest cohort window we will ever scan/serve in one request. */
export const MAX_COHORT_RANGE = 500;
/** Default window shown to Pro users. */
export const DEFAULT_COHORT_RANGE = 100;

/**
 * Build the list of receipt numbers around a center receipt.
 * Returns receipts from serial-before to serial+after (inclusive), excluding
 * serials that would underflow below zero.
 */
export function buildReceiptRange(
  receipt: string,
  before: number,
  after: number
): { center: ParsedReceipt; receipts: string[] } | null {
  const parsed = parseReceipt(receipt);
  if (!parsed) return null;

  const safeBefore = Math.max(0, Math.min(before, MAX_COHORT_RANGE));
  const safeAfter = Math.max(0, Math.min(after, MAX_COHORT_RANGE));

  const start = Math.max(0, parsed.serial - safeBefore);
  const end = parsed.serial + safeAfter;

  const receipts: string[] = [];
  for (let serial = start; serial <= end; serial++) {
    receipts.push(formatReceipt(parsed.prefix, serial));
  }

  return { center: parsed, receipts };
}
