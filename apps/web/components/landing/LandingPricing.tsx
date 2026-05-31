"use client";

import { PricingModule, PricingPlan } from "@/components/pricing/pricing-module";
import {
    LANDING_DEDICATED_FEATURES,
    LANDING_FREE_FEATURES,
    LANDING_PRO_FEATURES,
} from "@/lib/pricing/plan-features";
import { Layers, Rocket, ShieldCheck } from "lucide-react";

export function LandingPricing() {
    const plans: PricingPlan[] = [
        {
            id: "free",
            name: "Free",
            description: "Essential timeline tracking for every F-1 student.",
            icon: <Layers className="w-10 h-10 text-muted-foreground" />,
            priceMonthly: 0,
            priceYearly: 0,
            users: "Forever Free",
            buttonLabel: "Create Free Account",
            features: LANDING_FREE_FEATURES,
            recommended: false,
        },
        {
            id: "pro",
            name: "Pro",
            description: "Accelerate your job search & compliance.",
            icon: <Rocket className="w-10 h-10 text-primary" />,
            priceMonthly: 4.99,
            priceMonthlyOriginal: 7.99,
            priceYearly: 49.99,
            priceYearlyOriginal: 79.99,
            users: "7-Day Free Trial",
            buttonLabel: "Start 7-Day Free Trial",
            features: LANDING_PRO_FEATURES,
            recommended: true,
            badge: "Most Popular",
        },
        {
            id: "dedicated",
            name: "Dedicated",
            description: "Ultimate peace of mind with legal backup.",
            icon: <ShieldCheck className="w-10 h-10 text-primary" />,
            priceMonthly: 14.99,
            priceMonthlyOriginal: 19.99,
            priceYearly: 149.99,
            priceYearlyOriginal: 199.99,
            users: "1-Hr Attorney Session Included",
            buttonLabel: "Get Started",
            features: LANDING_DEDICATED_FEATURES,
            recommended: false,
            badge: "Best Value",
        },
    ];

    return (
        <section id="pricing" className="py-24 relative">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />
            <PricingModule
                title="Simple, Transparent Pricing"
                subtitle="Start for free, upgrade when you're ready. Cancel anytime."
                annualBillingLabel="Annual Billing"
                buttonLabel="Start 7-Day Free Trial"
                plans={plans}
                className="!bg-transparent !py-0" // Override internal styles
                buildPlanHref={({ planId, interval }) => {
                    if (planId === "free") {
                        return `/login?redirect=${encodeURIComponent("/dashboard")}`;
                    }
                    return `/login?redirect=${encodeURIComponent(
                        `/premium/checkout?planId=${planId}&interval=${interval}`
                    )}`;
                }}
            />
        </section>
    );
}
