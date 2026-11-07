"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRICING_VALUE_ANCHOR, shouldShowDedicatedPlanForSale } from "@/lib/pricing/sales-copy";
import { DEDICATED_CONSULTATION_MINUTES } from "@/lib/legal/legal-config";

// ponytail: plain markup — framer-motion `initial` on this above-the-fold hero
// was a hydration #418 risk for no product value; CSS fade is enough if we want motion later.
export function PricingHero() {
    const showDedicated = shouldShowDedicatedPlanForSale();
    return (
        <section className="bg-background pt-32 pb-8 text-center">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                    One Missed Deadline Can End{" "}
                    <span className="text-primary">
                        Your OPT Status
                    </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
                    {showDedicated
                        ? `Pro automates unemployment tracking, USCIS monitoring, and deadline alerts. Dedicated adds priority support and one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial attorney consultation.`
                        : "Pro automates unemployment tracking, daily USCIS monitoring, and deadline alerts — so you catch status changes before they become problems."}
                </p>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                    {PRICING_VALUE_ANCHOR}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <Link
                        href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear"
                        className="inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground shadow-button hover:bg-primary-hover rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        Get Pro
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    {showDedicated ? (
                        <Link
                            href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear"
                            className="inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 border border-border bg-background text-foreground shadow-card hover:bg-muted rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            Get Dedicated + Attorney Consultation
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : null}
                </div>
            </div>
        </section>
    );
}
