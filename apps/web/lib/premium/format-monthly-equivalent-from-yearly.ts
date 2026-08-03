/**
 * Display-only: per-month figure from an annual total (e.g. for "billed yearly" UI).
 * Checkout still uses the yearly amount in cents from Stripe price IDs / env.
 */
export function formatMonthlyEquivalentFromYearly(yearlyTotal: number): string {
  if (yearlyTotal <= 0) return "0.00";
  return (yearlyTotal / 12).toFixed(2);
}
