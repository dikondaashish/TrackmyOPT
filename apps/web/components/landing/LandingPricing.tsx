"use client";

import { PricingModule, PricingPlan } from "@/components/pricing/PricingModule";
import {
    LANDING_DEDICATED_FEATURES,
    LANDING_FREE_FEATURES,
    LANDING_PRO_FEATURES,
} from "@/lib/pricing/plan-features";
import { LANDING_PLAN_COPY, shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { Layers, Rocket, ShieldCheck } from "lucide-react";

export function LandingPricing() {
    const plans: PricingPlan[] = [
        {
            id: "free",
            name: "Free",
            description: LANDING_PLAN_COPY.free.description,
            icon: <Layers className="w-10 h-10 text-muted-foreground" />,
            priceMonthly: 0,
            priceYearly: 0,
            users: LANDING_PLAN_COPY.free.users,
            buttonLabel: LANDING_PLAN_COPY.free.buttonLabel,
            features: LANDING_FREE_FEATURES,
            recommended: false,
        },
        {
            id: "pro",
            name: "Pro",
            description: LANDING_PLAN_COPY.pro.description,
            icon: <Rocket className="w-10 h-10 text-primary" />,
            priceMonthly: 4.99,
            priceMonthlyOriginal: 7.99,
            priceYearly: 49.99,
            priceYearlyOriginal: 79.99,
            users: LANDING_PLAN_COPY.pro.users,
            buttonLabel: LANDING_PLAN_COPY.pro.buttonLabel,
            features: LANDING_PRO_FEATURES,
            recommended: true,
            badge: "Most Popular",
        },
    ];

    if (shouldShowDedicatedPlanForSale()) {
        plans.push({
            id: "dedicated",
            name: "Dedicated",
            description: LANDING_PLAN_COPY.dedicated.description,
            icon: <ShieldCheck className="w-10 h-10 text-amber-600" />,
            priceMonthly: 14.99,
            priceMonthlyOriginal: 19.99,
            priceYearly: 149.99,
            priceYearlyOriginal: 199.99,
            users: LANDING_PLAN_COPY.dedicated.users,
            buttonLabel: LANDING_PLAN_COPY.dedicated.buttonLabel,
            features: LANDING_DEDICATED_FEATURES,
            recommended: false,
            badge: "Priority Support",
        });
    }

    return (
        <section id="pricing" className="py-24 relative">
            <div className="absolute inset-0 bg-white/30 dark:bg-black/20 backdrop-blur-[2px] -z-10" />
            <PricingModule
                title="Simple, Transparent Pricing"
                subtitle={
                    shouldShowDedicatedPlanForSale()
                        ? "Start free. Upgrade to Pro for daily auto-checks, or Dedicated for higher quotas and priority support."
                        : "Start free. Upgrade to Pro for daily USCIS auto-checks and status-change alerts."
                }
                annualBillingLabel="Annual Billing"
                buttonLabel={LANDING_PLAN_COPY.pro.buttonLabel}
                plans={plans}
                className="!bg-transparent !py-0"
                buildPlanHref={({ planId, interval }) => {
                    if (planId === "free") {
                        return `/login?redirect=${encodeURIComponent("/dashboard/case-status")}`;
                    }
                    return `/login?redirect=${encodeURIComponent(
                        `/premium/checkout?planId=${planId}&interval=${interval}`
                    )}`;
                }}
            />
        </section>
    );
}
