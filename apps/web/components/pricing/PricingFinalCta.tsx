"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { capturePricingCtaViewed } from "@/lib/posthog-client";
import { useFeatureFlag } from "@/lib/posthog/use-feature-flag";
import {
  getPricingCtaCopy,
  normalizePricingCtaVariant,
  PRICING_CTA_EXPERIMENT_FLAG,
} from "@/lib/posthog/pricing-cta-experiment";

const PRO_CHECKOUT_HREF =
  "/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear";
const DEDICATED_CHECKOUT_HREF =
  "/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear";

/**
 * Final pricing-page CTA block with `pricing-cta-experiment` copy variants.
 * Fires `pricing_cta_viewed` once when the flag resolves.
 */
export function PricingFinalCta() {
  const rawVariant = useFeatureFlag(PRICING_CTA_EXPERIMENT_FLAG);
  const variant = normalizePricingCtaVariant(
    typeof rawVariant === "string" ? rawVariant : undefined
  );
  const ctaText = getPricingCtaCopy(variant);
  const exposedRef = useRef(false);

  useEffect(() => {
    if (exposedRef.current || rawVariant == null || rawVariant === false) return;
    exposedRef.current = true;
    capturePricingCtaViewed({ variant });
  }, [rawVariant, variant]);

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
            <Link
              href={DEDICATED_CHECKOUT_HREF}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
            >
              Get Dedicated Support
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-sm text-blue-100/80 mt-4">
            Pro from $4.17/mo billed yearly · Dedicated includes monthly attorney
            access
          </p>
        </div>
      </div>
    </section>
  );
}
