"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2,
    ChevronRight,
    MessageSquare,
    Chrome,
    ArrowRight,
    Send,
    Heart,
    Loader2,
} from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

interface FeedbackOption {
    id: string;
    label: string;
    followUp?: string;
    followUpPlaceholder?: string;
    subOptions?: { id: string; label: string }[];
}

const feedbackCategories: {
    category: string;
    options: FeedbackOption[];
}[] = [
    {
        category: "Extension experience",
        options: [
            {
                id: "too_many_popups",
                label: "The extension shows too many popups or badges.",
                followUp: "Can you tell us more?",
                followUpPlaceholder: "What specifically bothered you...",
            },
            {
                id: "doesnt_work",
                label: "The extension doesn't work on certain websites.",
                followUp: "Which websites?",
                followUpPlaceholder: "e.g., LinkedIn, Indeed, Glassdoor...",
                subOptions: [
                    { id: "doesnt_work_linkedin", label: "LinkedIn" },
                    { id: "doesnt_work_indeed", label: "Indeed" },
                    { id: "doesnt_work_glassdoor", label: "Glassdoor" },
                    { id: "doesnt_work_other", label: "Other job sites" },
                ],
            },
            {
                id: "interferes",
                label: "The extension interferes with my websites or apps.",
                followUp: "Can you elaborate on the issue?",
                followUpPlaceholder: "Describe how it interfered...",
            },
            {
                id: "doesnt_show",
                label: "The extension doesn't show up when I need it.",
            },
            {
                id: "missing_features",
                label: "The extension doesn't have the features I want.",
                followUp: "What features would you like?",
                followUpPlaceholder: "Tell us what you'd like to see...",
            },
        ],
    },
    {
        category: "Usability",
        options: [
            {
                id: "gets_in_way",
                label: "The extension gets in my way or is difficult to use.",
            },
            {
                id: "not_intuitive",
                label: "The extension is not intuitive to use.",
            },
            {
                id: "badge_annoying",
                label: "The sponsor verification badge is distracting.",
            },
        ],
    },
    {
        category: "Privacy & performance",
        options: [
            {
                id: "privacy_concerns",
                label: "I have privacy or security concerns.",
                followUp: "What are your concerns?",
                followUpPlaceholder: "Tell us about your concerns...",
            },
            {
                id: "slows_browser",
                label: "The extension slows down my browser.",
                followUp: "Can you tell us more?",
                followUpPlaceholder: "Describe the performance issue...",
                subOptions: [
                    { id: "slow_load", label: "Websites take longer to load" },
                    { id: "slow_laggy", label: "Websites are laggy" },
                    { id: "slow_typing", label: "Typing is slower" },
                    { id: "slow_other", label: "Something else" },
                ],
            },
        ],
    },
    {
        category: "Other",
        options: [
            {
                id: "no_account",
                label: "I don't want to create an account.",
            },
            {
                id: "not_interested",
                label: "I'm not interested in premium features.",
            },
            {
                id: "not_allowed_work",
                label: "I'm not allowed to use extensions at work.",
            },
            {
                id: "found_alternative",
                label: "I found a better alternative.",
                followUp: "Which one?",
                followUpPlaceholder: "Name of the alternative...",
            },
            {
                id: "graduated",
                label: "I graduated and no longer need OPT tracking.",
            },
            {
                id: "got_h1b",
                label: "I got my H-1B visa and no longer need this.",
            },
        ],
    },
];

export default function ExtensionUninstallPage() {
    const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
    const [selectedSubOptions, setSelectedSubOptions] = useState<Set<string>>(new Set());
    const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, string>>({});
    const [additionalFeedback, setAdditionalFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const toggleReason = (id: string) => {
        setSelectedReasons((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSubOption = (id: string) => {
        setSelectedSubOptions((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await fetch("/api/extension/uninstall-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reasons: Array.from(selectedReasons),
                    subOptions: Array.from(selectedSubOptions),
                    followUpAnswers,
                    additionalFeedback,
                    timestamp: new Date().toISOString(),
                }),
            });
            setIsSubmitted(true);
        } catch {
            setIsSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
            <LandingNavbar />

            <div className="pt-28 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <AnimatePresence mode="wait">
                        {!isSubmitted ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Header */}
                                <div className="text-center mb-12">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 mb-6"
                                    >
                                        <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                    </motion.div>
                                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                                        Help Us Improve
                                    </h1>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                                        Why did you uninstall the TrackMyOPT Chrome Extension?
                                        <br />
                                        <span className="text-sm text-gray-500">Check all that apply:</span>
                                    </p>
                                </div>

                                {/* Feedback Form */}
                                <div className="space-y-8">
                                    {feedbackCategories.map((category, catIdx) => (
                                        <motion.div
                                            key={category.category}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 + catIdx * 0.1 }}
                                        >
                                            <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 pl-1">
                                                {category.category}
                                            </h3>
                                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-zinc-800">
                                                {category.options.map((option) => {
                                                    const isSelected = selectedReasons.has(option.id);
                                                    return (
                                                        <div key={option.id}>
                                                            <button
                                                                onClick={() => toggleReason(option.id)}
                                                                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
                                                            >
                                                                <div
                                                                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                                                                        isSelected
                                                                            ? "bg-blue-600 border-blue-600"
                                                                            : "border-gray-300 dark:border-zinc-600"
                                                                    }`}
                                                                >
                                                                    {isSelected && (
                                                                        <motion.div
                                                                            initial={{ scale: 0 }}
                                                                            animate={{ scale: 1 }}
                                                                            transition={{ type: "spring", stiffness: 500 }}
                                                                        >
                                                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                        </motion.div>
                                                                    )}
                                                                </div>
                                                                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                                                    {option.label}
                                                                </span>
                                                                {(option.followUp || option.subOptions) && isSelected && (
                                                                    <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                                                                )}
                                                            </button>

                                                            {/* Follow-up section */}
                                                            <AnimatePresence>
                                                                {isSelected && (option.followUp || option.subOptions) && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="px-5 pb-4 pl-13">
                                                                            {option.subOptions && (
                                                                                <div className="flex flex-wrap gap-2 mb-3 pl-8">
                                                                                    {option.subOptions.map((sub) => (
                                                                                        <button
                                                                                            key={sub.id}
                                                                                            onClick={() => toggleSubOption(sub.id)}
                                                                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                                                                                                selectedSubOptions.has(sub.id)
                                                                                                    ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                                                                                                    : "bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700 hover:border-blue-300"
                                                                                            }`}
                                                                                        >
                                                                                            {sub.label}
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                            {option.followUp && (
                                                                                <div className="pl-8">
                                                                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">
                                                                                        {option.followUp}
                                                                                    </label>
                                                                                    <textarea
                                                                                        value={followUpAnswers[option.id] || ""}
                                                                                        onChange={(e) =>
                                                                                            setFollowUpAnswers((prev) => ({
                                                                                                ...prev,
                                                                                                [option.id]: e.target.value,
                                                                                            }))
                                                                                        }
                                                                                        placeholder={option.followUpPlaceholder}
                                                                                        className="w-full px-3 py-2 rounded-xl text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                                                                                        rows={2}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Additional feedback */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 pl-1">
                                            Anything else?
                                        </h3>
                                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
                                            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                                How else can we improve the TrackMyOPT Extension?
                                            </label>
                                            <textarea
                                                value={additionalFeedback}
                                                onChange={(e) => setAdditionalFeedback(e.target.value)}
                                                placeholder="Your feedback helps us build a better product for international students..."
                                                className="w-full px-4 py-3 rounded-xl text-sm bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
                                                rows={4}
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Personal note from founder */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6"
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                                    <Image
                                                        src="/TrackMyOPT Logo/Favicon.png"
                                                        alt="TrackMyOPT"
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                                    As former international students ourselves, we built this extension to help
                                                    F-1 students make smarter career decisions. Our team works hard to bring
                                                    sponsor data right where you need it.
                                                </p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                                                    We know our extension isn&apos;t perfect, but we&apos;re committed to making it the best
                                                    tool for international students. Your feedback helps us understand how we can
                                                    improve, and we hope to see you again in the future.
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    The TrackMyOPT Team
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Submit & Reinstall */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="flex flex-col sm:flex-row items-center gap-4 pt-2"
                                    >
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || selectedReasons.size === 0}
                                            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-zinc-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:shadow-none hover:-translate-y-0.5 disabled:translate-y-0 w-full sm:w-auto"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {isSubmitting ? "Sending..." : "Submit Feedback"}
                                        </button>
                                        <Link
                                            href="https://chrome.google.com/webstore"
                                            target="_blank"
                                            className="flex items-center gap-2 px-6 py-3.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all w-full sm:w-auto justify-center"
                                        >
                                            <Chrome className="w-4 h-4" />
                                            Reinstall Extension
                                        </Link>
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            /* Thank you state */
                            <motion.div
                                key="thankyou"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-center py-16"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-8"
                                >
                                    <Heart className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </motion.div>

                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                    Thank you for your feedback!
                                </h2>
                                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-10">
                                    Your input helps us build a better tool for international students everywhere.
                                    We&apos;re committed to improving, and we hope to see you again.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                                    <Link
                                        href="https://chrome.google.com/webstore"
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                                    >
                                        <Chrome className="w-5 h-5" />
                                        Reinstall Extension
                                    </Link>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-8 py-4 text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all"
                                    >
                                        Go to TrackMyOPT
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>

                                {/* Quick links */}
                                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800">
                                    <p className="text-sm text-gray-500 mb-6">Explore TrackMyOPT</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
                                        {[
                                            { label: "OPT Timeline", href: "/features/compliance" },
                                            { label: "Job Tracker", href: "/features/job-tracker" },
                                            { label: "AI Resume", href: "/features/resume-ai" },
                                            { label: "H-1B Sponsors", href: "/features/sponsors" },
                                        ].map((link) => (
                                            <Link
                                                key={link.label}
                                                href={link.href}
                                                className="px-4 py-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <LandingFooter />
        </main>
    );
}
