"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const channels = [
    {
        icon: Mail,
        title: "Email Support",
        description: "Send us a detailed message and we'll get back to you.",
        action: "support@trackmyopt.com",
        actionHref: "mailto:support@trackmyopt.com",
        responseTime: "24 hours",
        color: "from-blue-500 to-indigo-600",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        icon: MessageCircle,
        title: "Live Chat",
        description: "Chat with our team in real-time during business hours.",
        action: "Start Chat",
        actionHref: "#",
        responseTime: "5 minutes",
        color: "from-emerald-500 to-teal-600",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
        badge: "Premium",
    },
    {
        icon: Users,
        title: "Community",
        description: "Join our Discord community to connect with other students.",
        action: "Join Discord",
        actionHref: "https://discord.gg/trackmyopt",
        responseTime: "Community support",
        color: "from-purple-500 to-pink-600",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
];

export function SupportChannels() {
    return (
        <section className="py-24 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-sm font-medium mb-6">
                        Choose Your Channel
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Multiple Ways to Reach Us
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Pick the support channel that works best for you. We&apos;re here to help however you prefer.
                    </p>
                </motion.div>

                {/* Channel Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {channels.map((channel, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="relative"
                        >
                            <div className={`h-full p-8 rounded-3xl ${channel.bgColor} border border-gray-200 dark:border-zinc-700 transition-all duration-300 hover:shadow-xl`}>
                                {/* Badge */}
                                {channel.badge && (
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${channel.color} text-white`}>
                                            {channel.badge}
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${channel.color} flex items-center justify-center mb-6 shadow-lg`}>
                                    <channel.icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {channel.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    {channel.description}
                                </p>

                                {/* Response Time */}
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
                                    <Clock className="w-4 h-4" />
                                    <span>Typical response: {channel.responseTime}</span>
                                </div>

                                {/* Action */}
                                <Link
                                    href={channel.actionHref}
                                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r ${channel.color} text-white font-semibold hover:shadow-lg transition-all duration-300 group`}
                                >
                                    {channel.action}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
