"use client";

import { useFeatureFlagVariantKey } from "posthog-js/react";

/**
 * Client hook for multivariate / experiment flags. Wraps posthog-js React bindings
 * against the singleton initialized in lib/posthog/posthog-browser.ts.
 */
export function useFeatureFlag(flagKey: string): string | boolean | undefined {
  const variant = useFeatureFlagVariantKey(flagKey);
  if (variant === false) return undefined;
  return variant;
}
