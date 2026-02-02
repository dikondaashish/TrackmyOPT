"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

type Category = "general" | "technical" | "billing" | "partnership";

export function ContactForm() {
    const [category, setCategory] = useState<Category>("general");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const categories: { id: Category; label: string }[] = [
        { id: "general", label: "General Inquiry" },
        { id: "technical", label: "Technical Support" },
        { id: "billing", label: "Billing" },
        { id: "partnership", label: "Partnership" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-border"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Message Sent!
                        </h3>
                        <p className="text-muted-foreground">
                            We'll get back to you within 24 hours.
                        </p>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-50 dark:bg-zinc-900/50">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Send Us a Message
                    </h2>
                    <p className="text-muted-foreground">
                        Fill out the form below and we'll get back to you
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onSubmit={handleSubmit}
                    className="p-6 lg:p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-border"
                >
                    {/* Category Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                            What can we help you with?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${category === cat.id
                                            ? "bg-primary text-white border-primary"
                                            : "bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white border-border hover:border-primary/50"
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name & Email */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Subject
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Brief subject"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                            placeholder="Tell us more about your inquiry..."
                            required
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                        Send Message
                    </button>
                </motion.form>
            </div>
        </section>
    );
}
