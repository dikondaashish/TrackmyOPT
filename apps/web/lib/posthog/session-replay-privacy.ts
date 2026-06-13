/**
 * PostHog session replay privacy selectors.
 * Apply `data-ph-mask` / `ph-mask` on immigration, receipt, document, and payment UI.
 * Apply `data-ph-no-capture` / `ph-no-capture` to block entire regions from replay.
 */

export const POSTHOG_MASK_TEXT_SELECTOR = [
  "[data-ph-mask]",
  ".ph-mask",
  "[data-sensitive]",
  "[data-receipt-display]",
  ".receipt-number-display",
].join(", ");

export const POSTHOG_BLOCK_SELECTOR = [
  "[data-ph-no-capture]",
  ".ph-no-capture",
  "[data-document-vault]",
].join(", ");

export const POSTHOG_SESSION_RECORDING = {
  maskAllInputs: true,
  maskTextSelector: POSTHOG_MASK_TEXT_SELECTOR,
  blockSelector: POSTHOG_BLOCK_SELECTOR,
} as const;
