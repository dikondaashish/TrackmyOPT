"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

/**
 * Bridges the singleton from instrumentation-client / posthog-browser into
 * posthog-js/react hooks (useFeatureFlagVariantKey, etc.).
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <PHProvider client={posthog}>{children}</PHProvider>;
}
