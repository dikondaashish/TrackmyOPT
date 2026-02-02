"use client";

import { motion } from "framer-motion";
import { Target, Heart, Users, Sparkles } from "lucide-react";

export function MissionSection() {
    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Left Side - Mission Statement */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">
                            <Target className="w-4 h-4" />
                            Our Mission
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Empowering{" "}
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Every F-1 Student
                            </span>{" "}
                            to Succeed
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                            International students face unique challenges that domestic students never have to think about.
                            From tracking unemployment days to finding companies willing to sponsor visas, the journey is complex.
                        </p>

                        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                            <strong className="text-gray-900 dark:text-white">Our mission is simple:</strong> Remove the stress
                            and complexity from OPT management so you can focus on what matters — building your career and
                            achieving your American dream.
                        </p>
                    </motion.div>

                    {/* Right Side - Visual Cards */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {[
                            {
                                icon: Heart,
                                title: "Student-First",
                                description: "Every feature is designed with students in mind",
                                color: "from-rose-500 to-pink-600",
                            },
                            {
                                icon: Users,
                                title: "Community",
                                description: "Join 10,000+ students on the same journey",
                                color: "from-blue-500 to-indigo-600",
                            },
                            {
                                icon: Target,
                                title: "Accuracy",
                                description: "Up-to-date USCIS compliance information",
                                color: "from-emerald-500 to-teal-600",
                            },
                            {
                                icon: Sparkles,
                                title: "Innovation",
                                description: "AI-powered tools for your success",
                                color: "from-amber-500 to-orange-600",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {item.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
