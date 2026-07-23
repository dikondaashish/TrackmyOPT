"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PRICING_VALUE_ANCHOR } from "@/lib/pricing/sales-copy";

// ponytail: plain markup — framer-motion `initial` on this above-the-fold hero
// was a hydration #418 risk for no product value; CSS fade is enough if we want motion later.
export function PricingHero() {
    return (
        <section className="pt-32 pb-8 text-center">
            <div className="max-w-4xl mx-auto px-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-6">
                    <AlertTriangle className="w-4 h-4" />
                    One compliance mistake can end your F-1 status
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    One Missed Deadline Can End{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Your OPT Status
                    </span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-4">
                    Pro automates unemployment tracking, USCIS monitoring, and deadline
                    alerts. Dedicated adds monthly attorney access for complex cases.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    {PRICING_VALUE_ANCHOR}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <Link
                        href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Dpro%26interval%3Dyear"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors"
                    >
                        Start Pro Free Trial
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/login?redirect=%2Fpremium%2Fcheckout%3FplanId%3Ddedicated%26interval%3Dyear"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-colors"
                    >
                        Get Dedicated Support
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
