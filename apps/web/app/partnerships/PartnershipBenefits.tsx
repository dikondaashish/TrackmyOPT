"use client";

import { motion } from "framer-motion";
import { Clock, Shield, BarChart3, Headphones, FileCheck, Users } from "lucide-react";

const benefits = [
    {
        icon: Clock,
        title: "Reduce DSO Workload",
        description: "Students self-track their OPT timeline and unemployment days, reducing repetitive questions to your office.",
    },
    {
        icon: Shield,
        title: "Improve Compliance Rates",
        description: "Automated reminders and deadline tracking help students stay compliant, reducing violations and RFEs.",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Get insights into student employment status, common issues, and OPT utilization across your program.",
    },
    {
        icon: Headphones,
        title: "Dedicated Support",
        description: "Priority support channel for DSOs and advisors with response times under 4 hours.",
    },
    {
        icon: FileCheck,
        title: "Document Management",
        description: "Students store I-20s, EADs, and employment letters in one secure place, ready when you need them.",
    },
    {
        icon: Users,
        title: "Student Success Tools",
        description: "Resume builder, H-1B sponsor database, and job tracker help students find employment faster.",
    },
];

export function PartnershipBenefits() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Why Universities Partner With Us
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        TrackMyOPT helps your international student office work smarter, not harder
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-border hover:border-primary/30 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mb-4">
                                <benefit.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
