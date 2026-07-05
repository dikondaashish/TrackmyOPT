"use client";

import { useEffect, useRef, useState } from "react";
import posthog from "posthog-js";
import { captureOnboardingReceiptVariantExposed } from "@/lib/posthog-client";
import {
  normalizeOnboardingReceiptVariant,
  ONBOARDING_RECEIPT_VARIANT_FLAG,
  type OnboardingReceiptVariant,
} from "@/lib/posthog/onboarding-receipt-variant";

function resolveVariantFromPostHog(): OnboardingReceiptVariant {
  if (typeof window === "undefined" || typeof posthog?.getFeatureFlag !== "function") {
    return "control";
  }
  const raw = posthog.getFeatureFlag(ONBOARDING_RECEIPT_VARIANT_FLAG);
  if (typeof raw === "string") {
    return normalizeOnboardingReceiptVariant(raw);
  }
  return "control";
}

/**
 * Resolves the onboarding receipt experiment variant when the wizard opens.
 * Fires `onboarding_receipt_variant_exposed` once per wizard session.
 */
export function useOnboardingReceiptVariant(isOpen: boolean): {
  variant: OnboardingReceiptVariant;
  ready: boolean;
} {
  const [variant, setVariant] = useState<OnboardingReceiptVariant>("control");
  const [ready, setReady] = useState(false);
  const exposedRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      exposedRef.current = false;
      setReady(false);
      return;
    }

    const applyVariant = () => {
      const resolved = resolveVariantFromPostHog();
      setVariant(resolved);
      setReady(true);

      if (!exposedRef.current && typeof posthog?.getFeatureFlag === "function") {
        const raw = posthog.getFeatureFlag(ONBOARDING_RECEIPT_VARIANT_FLAG);
        if (raw != null && raw !== false) {
          exposedRef.current = true;
          captureOnboardingReceiptVariantExposed({ variant: resolved });
        }
      }
    };

    applyVariant();

    if (typeof posthog?.onFeatureFlags === "function") {
      return posthog.onFeatureFlags(applyVariant);
    }

    return undefined;
  }, [isOpen]);

  return { variant, ready };
}
