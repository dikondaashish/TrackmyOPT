"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Send, CheckCircle, Search, FileText, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface Suggestion {
    id: string;
    title: string;
    link: string;
}

const KNOWLEDGE_BASE: Suggestion[] = [
    { id: "1", title: "How to check my OPT application status?", link: "#" },
    { id: "2", title: "What to do if I receive an RFE?", link: "#" },
    { id: "3", title: "Report unemployment days", link: "#" },
    { id: "4", title: "Update employer information", link: "#" },
    { id: "5", title: "Premium subscription billing", link: "#" },
];

export function SmartContactForm() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

    useEffect(() => {
        if (subject.length > 3) {
            // Simulate searching knowledge base
            const hits = KNOWLEDGE_BASE.filter(item =>
                item.title.toLowerCase().includes(subject.toLowerCase())
            );
            setSuggestions(hits.slice(0, 3));
        } else {
            setSuggestions([]);
        }
    }, [subject]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsLoading(true);
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, subject, message }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.success) {
                setSubmitError(
                    typeof data?.error === "string"
                        ? data.error
                        : "Something went wrong. Try again."
                );
                return;
            }
            setIsSubmitted(true);
        } catch {
            setSubmitError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <section className="py-24">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200 dark:border-zinc-800 p-12 text-center shadow-xl"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 mx-auto mb-6"
                        >
                            <CheckCircle className="w-10 h-10" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message sent!</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                            Check your email for confirmation. We&apos;ll get back to you within 24–48 hours.
                        </p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => setIsSubmitted(false)} className="text-blue-600 font-medium hover:underline">
                                Send another message
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-24" id="contact-form">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* Left: Heading & Context */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                Drop Us a Line
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Whether you have a technical issue or just want to say hi, our team is ready to help.
                            </p>
                        </motion.div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-2xl p-6 mb-8">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Instant Answers
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                                Typing your subject below will automatically search our Help Center for quick solutions.
                            </p>

                            {/* Suggestions Area */}
                            <AnimatePresence>
                                {suggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        {suggestions.map((sug) => (
                                            <Link
                                                key={sug.id}
                                                href={sug.link}
                                                className="block bg-white dark:bg-zinc-800 p-3 rounded-lg border border-blue-100 dark:border-blue-900 hover:border-blue-300 transition-colors flex items-center justify-between group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{sug.title}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right: The Form */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 shadow-lg"
                    >
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Message</label>
                                <textarea
                                    rows={5}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none font-medium"
                                    placeholder="Tell us a bit more..."
                                    required
                                />
                            </div>

                            {submitError && (
                                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                                    {submitError}
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.form>
                </div>
            </div>
        </section>
    );
}
