/** USCIS receipt prefixes accepted in client-side onboarding validation. */
export const VALID_USCIS_RECEIPT_PREFIXES = [
  "IOE",
  "EAC",
  "WAC",
  "LIN",
  "SRC",
  "MSC",
  "YSC",
] as const;

type ReceiptValidationResult =
  | { valid: true; normalized: string }
  | { valid: false; error: string };

type ReceiptValidationOptions = {
  /** When true, prefix must be in VALID_USCIS_RECEIPT_PREFIXES (onboarding wizard). */
  strictPrefix?: boolean;
};

const RECEIPT_PATTERN = /^[A-Z]{3}\d{10}$/;

/**
 * Client-side USCIS receipt validation (13 chars; optional known-prefix check).
 */
export function validateReceiptNumber(
  input: string,
  options: ReceiptValidationOptions = {}
): ReceiptValidationResult {
  const { strictPrefix = false } = options;
  const normalized = input.trim().toUpperCase();

  if (!normalized) {
    return { valid: false, error: "Please enter a receipt number or skip this step." };
  }

  if (normalized.length !== 13) {
    return {
      valid: false,
      error: "Receipt number must be exactly 13 characters (3 letters + 10 digits).",
    };
  }

  if (!RECEIPT_PATTERN.test(normalized)) {
    return {
      valid: false,
      error: "Invalid format. Use 3 letters followed by 10 digits (e.g., IOE1234567890).",
    };
  }

  if (strictPrefix) {
    const prefix = normalized.substring(0, 3);
    if (!VALID_USCIS_RECEIPT_PREFIXES.includes(prefix as (typeof VALID_USCIS_RECEIPT_PREFIXES)[number])) {
      return {
        valid: false,
        error: `Unknown prefix "${prefix}". Common prefixes: ${VALID_USCIS_RECEIPT_PREFIXES.join(", ")}.`,
      };
    }
  }

  return { valid: true, normalized };
}
