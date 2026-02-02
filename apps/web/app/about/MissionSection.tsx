"use client";

import { motion } from "framer-motion";
import { Target, Users, Shield, Zap } from "lucide-react";

const values = [
    {
        icon: Target,
        title: "Simple & Focused",
        description: "One tool that does OPT tracking really well. No bloat, no distractions.",
    },
    {
        icon: Users,
        title: "Built by Students",
        description: "Created by people who've been through the OPT process themselves.",
    },
    {
        icon: Shield,
        title: "Privacy First",
        description: "Your data is encrypted and never shared. Period.",
    },
    {
        icon: Zap,
        title: "Always Improving",
        description: "We ship updates weekly based on real user feedback.",
    },
];

export function MissionSection() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    {/* Left - Mission Statement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                            Our Mission
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                            Making OPT Compliance Simple
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                            We started TrackMyOPT because we experienced the stress of managing OPT deadlines ourselves.
                            Between tracking unemployment days, storing documents, and finding H-1B sponsors,
                            we knew there had to be a better way.
                        </p>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Today, we help thousands of international students stay compliant and focused on
                            building their careers — not worrying about paperwork.
                        </p>
                    </motion.div>

                    {/* Right - Values Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {values.map((value, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-5 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-border"
                            >
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                                    <value.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {value.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {value.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
