"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export function PricingHero() {
    return (
        <section className="pt-32 pb-8 text-center">
            <div className="max-w-4xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
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
                        TrackMyOPT Premium automates unemployment
                        tracking, USCIS deadline alerts, and STEM OPT
                        compliance — so you never risk your F-1 status
                        over a missed date.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Free plan available. Premium from $4.99/mo —
                        less than a single missed deadline costs.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
