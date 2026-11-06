"use client";

import { motion } from "framer-motion";
import { GraduationCap, Briefcase, FileText, AlertTriangle, Plane } from "lucide-react";

const steps = [
    {
        icon: GraduationCap,
        year: "May",
        title: "Graduation",
        desc: "Program End Date",
        color: "blue"
    },
    {
        icon: FileText,
        year: "June",
        title: "OPT Start",
        desc: "EAD Card Received",
        color: "purple"
    },
    {
        icon: AlertTriangle,
        year: "Sept",
        title: "90-Day Limit",
        desc: "Unemployment Max",
        color: "amber" // Use amber instead of yellow for better contrast/tailwind class availability usually
    },
    {
        icon: Briefcase,
        year: "Oct",
        title: "STEM Filing",
        desc: "Apply for 2-Year Ext",
        color: "green"
    },
    {
        icon: Plane,
        year: "Year 3",
        title: "Transition",
        desc: "H-1B or Departure",
        color: "gray"
    }
];

export function ComplianceTimeline() {
    return (
        <div className="w-full overflow-x-auto pb-12 pt-4 px-4 scrollbar-hide">
            <div className="min-w-[800px] max-w-5xl mx-auto relative">
                {/* Connecting Line */}
                <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 dark:bg-zinc-800 rounded-full" />

                <div className="flex justify-between relative z-10">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="flex flex-col items-center"
                        >
                            {/* Icon Circle */}
                            <div className={`
                                w-16 h-16 rounded-lg flex items-center justify-center mb-4 border-4 border-white dark:border-zinc-950
                                ${step.color === 'blue' ? 'bg-blue-500 text-white' : ''}
                                ${step.color === 'purple' ? 'bg-purple-500 text-white' : ''}
                                ${step.color === 'amber' ? 'bg-amber-500 text-white' : ''}
                                ${step.color === 'green' ? 'bg-green-500 text-white' : ''}
                                ${step.color === 'gray' ? 'bg-gray-500 text-white' : ''}
                            `}>
                                <step.icon className="w-7 h-7" />
                            </div>

                            {/* Content */}
                            <div className="text-center">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {step.year}
                                </span>
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1">{step.title}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                            </div>

                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
