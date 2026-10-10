/** Low-cardinality attribution only. Never accept arbitrary URLs or user data. */
export const PRO_CHECKOUT_SOURCES = [
  'case_status',
  'pricing_modal',
  'checkout_page',
] as const;
export type ProCheckoutSource = (typeof PRO_CHECKOUT_SOURCES)[number];
export function normalizeProCheckoutSource(
  value: unknown
): ProCheckoutSource | 'unknown' {
  return PRO_CHECKOUT_SOURCES.includes(value as ProCheckoutSource)
    ? (value as ProCheckoutSource)
    : 'unknown';
}
