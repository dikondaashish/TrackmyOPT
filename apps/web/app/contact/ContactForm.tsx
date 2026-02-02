"use client";

import { motion } from "framer-motion";
import { Send, Paperclip, CheckCircle } from "lucide-react";
import { useState } from "react";

const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "billing", label: "Billing & Subscription" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Report a Bug" },
    { value: "partnership", label: "Partnership" },
];

export function ContactForm() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        category: "",
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <section className="py-24 relative bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Send Us a Message
                        </h2>
                        <p className="text-cyan-100">
                            Fill out the form below and we&apos;ll get back to you as soon as possible.
                        </p>

                        {/* Progress Steps */}
                        <div className="flex items-center gap-4 mt-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s
                                            ? "bg-white text-cyan-600"
                                            : "bg-white/20 text-white"
                                        }`}>
                                        {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div className={`w-12 h-1 rounded-full transition-all ${step > s ? "bg-white" : "bg-white/20"
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {/* Step 1: Category Selection */}
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    What can we help you with?
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => {
                                                setFormData({ ...formData, category: cat.value });
                                                handleNext();
                                            }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 ${formData.category === cat.value
                                                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                                                    : "border-gray-200 dark:border-zinc-700"
                                                }`}
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {cat.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Contact Info */}
                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Your Contact Information
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="you@university.edu"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Brief description of your inquiry"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Message */}
                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Tell us more
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Your Message *
                                    </label>
                                    <textarea
                                        rows={6}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Please describe your issue or question in detail..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
                                    />
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-dashed border-gray-300 dark:border-zinc-600">
                                    <Paperclip className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Drag and drop files here, or click to upload (max 10MB)
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-zinc-700">
                            <button
                                onClick={handleBack}
                                className={`px-6 py-3 rounded-xl font-medium transition-all ${step === 1
                                        ? "invisible"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    }`}
                            >
                                Back
                            </button>

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                    Continue
                                </button>
                            ) : (
                                <button
                                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
                                >
                                    <Send className="w-5 h-5" />
                                    Submit Request
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
