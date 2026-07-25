"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { capturePricingCtaViewed } from "@/lib/posthog-client";
import { useFeatureFlag } from "@/lib/posthog/use-feature-flag";
import {
  getPricingCtaCopy,
  normalizePricingCtaVariant,
  PRICING_CTA_EXPERIMENT_FLAG,
  type PricingCtaVariant,
} from "@/lib/posthog/pricing-cta-experiment";
import { shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";

const PRO_CHECKOUT_HREF =
  "/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear";
const DEDICATED_CHECKOUT_HREF =
  "/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear";
const EXPOSURE_FALLBACK_MS = 3_000;

/**
 * Final pricing-page CTA block with `pricing-cta-experiment` copy variants.
 * Fires `pricing_cta_viewed` once when flags load or after a control fallback timeout.
 */
export function PricingFinalCta() {
  const rawVariant = useFeatureFlag(PRICING_CTA_EXPERIMENT_FLAG);
  const variant = normalizePricingCtaVariant(
    typeof rawVariant === "string" ? rawVariant : undefined
  );
  const ctaText = getPricingCtaCopy(variant);
  const exposedRef = useRef(false);

  useEffect(() => {
    const fireExposure = (resolved: PricingCtaVariant) => {
      if (exposedRef.current) return;
      exposedRef.current = true;
      capturePricingCtaViewed({ variant: resolved });
    };

    const resolveFromPostHog = (): PricingCtaVariant | null => {
      if (typeof posthog?.getFeatureFlag !== "function") return null;
      const raw = posthog.getFeatureFlag(PRICING_CTA_EXPERIMENT_FLAG);
      if (raw == null || raw === false) return null;
      return normalizePricingCtaVariant(typeof raw === "string" ? raw : undefined);
    };

    const resolved = resolveFromPostHog();
    if (resolved) {
      fireExposure(resolved);
    }

    const fallbackTimer = setTimeout(() => {
      fireExposure("control");
    }, EXPOSURE_FALLBACK_MS);

    let unsubscribe: (() => void) | undefined;
    if (typeof posthog?.onFeatureFlags === "function") {
      unsubscribe = posthog.onFeatureFlags(() => {
        const next = resolveFromPostHog();
        if (next) {
          fireExposure(next);
          clearTimeout(fallbackTimer);
        }
      });
    }

    return () => {
      clearTimeout(fallbackTimer);
      unsubscribe?.();
    };
  }, []);

  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            Track Every OPT Deadline Before It Becomes a Problem
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join 2,500+ F-1 students who use TrackMyOPT Pro for daily reminders,
            unemployment alerts, and case monitoring.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={PRO_CHECKOUT_HREF}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
            >
              {ctaText} <ArrowRight className="w-4 h-4" />
            </Link>
            {shouldShowDedicatedPlanForSale() ? (
              <Link
                href={DEDICATED_CHECKOUT_HREF}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
              >
                Get Dedicated Support
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : null}
          </div>
          <p className="text-sm text-blue-100/80 mt-4">
            {shouldShowDedicatedPlanForSale()
              ? "Pro from $4.17/mo billed yearly · Dedicated adds priority email support"
              : "Pro from $4.17/mo billed yearly · cancel anytime"}
          </p>
        </div>
      </div>
    </section>
  );
}
