"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Users } from "lucide-react";
import Link from "next/link";

const channels = [
    {
        icon: Mail,
        title: "Email Support",
        description: "Get help via email. We typically respond within 24 hours.",
        action: "support@trackmyopt.com",
        href: "mailto:support@trackmyopt.com",
        responseTime: "< 24 hours",
    },
    {
        icon: MessageCircle,
        title: "Live Chat",
        description: "Chat with our team in real-time during business hours.",
        action: "Start Chat",
        href: "#",
        responseTime: "< 5 minutes",
    },
    {
        icon: Users,
        title: "Community",
        description: "Join our Discord community to connect with other students.",
        action: "Join Discord",
        href: "https://discord.gg/trackmyopt",
        responseTime: "Community",
    },
];

export function SupportChannels() {
    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Choose the best way to reach us
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 bg-gray-50 dark:bg-zinc-900 rounded-xl border border-border text-center"
                        >
                            <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-primary mx-auto mb-4">
                                <channel.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {channel.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {channel.description}
                            </p>
                            <div className="text-xs text-muted-foreground mb-4">
                                Response time: <span className="font-medium">{channel.responseTime}</span>
                            </div>
                            <Link
                                href={channel.href}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                            >
                                {channel.action}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
