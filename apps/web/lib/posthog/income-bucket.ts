export type IncomeBucket =
  | "0_1000"
  | "1001_2000"
  | "2001_4000"
  | "4001_plus"
  | "unknown";

/** Bucket monthly income for analytics — never send exact amounts to PostHog. */
export function bucketMonthlyIncome(raw: string | number | null | undefined): IncomeBucket {
  if (raw === null || raw === undefined || raw === "") {
    return "unknown";
  }

  const value = typeof raw === "number" ? raw : parseFloat(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(value) || value < 0) {
    return "unknown";
  }
  if (value <= 1000) return "0_1000";
  if (value <= 2000) return "1001_2000";
  if (value <= 4000) return "2001_4000";
  return "4001_plus";
}
