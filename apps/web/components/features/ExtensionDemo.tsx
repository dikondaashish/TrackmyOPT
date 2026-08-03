"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Building2, MapPin, Bookmark, Chrome, ExternalLink, MoreHorizontal } from "lucide-react";
import { useState } from "react";

export function ExtensionDemo() {
    const [isSaved, setIsSaved] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    const handleSave = () => {
        setIsSaved(!isSaved);
        if (!isSaved) {
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto font-sans">
            {/* Notification Toast */}
            <motion.div
                className="absolute top-4 right-4 z-50 bg-white dark:bg-zinc-800 shadow-xl rounded-lg p-3 flex items-center gap-3 border border-gray-100 dark:border-zinc-700 pointer-events-none"
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: showNotification ? 1 : 0, y: showNotification ? 0 : -20, scale: showNotification ? 1 : 0.9 }}
            >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Job Saved to Tracker</p>
                    <p className="text-xs text-gray-500">TrackMyOPT Status: Applied</p>
                </div>
            </motion.div>

            {/* Browser Window Chrome */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-zinc-800">
                {/* Header */}
                <div className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 p-3 flex items-center justify-between">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 dark:border-zinc-700 flex-1 mx-4 max-w-sm">
                        <Lock className="w-3 h-3" />
                        linkedin.com/jobs/view/3928...
                    </div>
                    <div className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Chrome className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Job Content */}
                <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 relative">
                    {/* Floating Extension Widget */}
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute right-0 top-32 bg-white dark:bg-zinc-800 shadow-[-5px_5px_20px_-5px_rgba(0,0,0,0.1)] border-l border-y border-gray-200 dark:border-zinc-700 rounded-l-xl p-3 z-20 flex flex-col gap-3 items-center"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="font-bold text-white text-xs">TM</span>
                        </div>
                        <div className="w-1 h-8 bg-gray-100 dark:bg-zinc-700 rounded-full" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowNotification(true)}
                            className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 cursor-pointer"
                        >
                            <Bookmark className="w-4 h-4" />
                        </motion.button>
                    </motion.div>

                    {/* Job Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                                <Building2 className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Senior Software Engineer</h2>
                                <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900 dark:text-gray-200">TechCorp Inc.</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> San Francisco, CA (Hybrid)</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="text-green-600 font-medium">Actively recruiting</span>
                                    <span>•</span>
                                    <span>Posted 2 days ago</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Injected Badge Area */}
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="mb-6 overflow-hidden"
                    >
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-lg p-3 flex items-start gap-3">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded-full shrink-0 mt-0.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                    Sponsorship Verified
                                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-800/50 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-300 font-normal">TrackMyOPT Intel</span>
                                </h4>
                                <div className="flex gap-4 mt-1.5 text-xs text-emerald-700 dark:text-emerald-400/80">
                                    <span className="flex items-center gap-1"><strong>245</strong> H-1B Approvals (2025)</span>
                                    <span className="w-1 h-1 bg-emerald-300 rounded-full self-center" />
                                    <span>E-Verify Enrolled</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mb-8">
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-full flex items-center justify-center gap-2 transition-colors">
                            Apply Now <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 rounded-full font-semibold border transition-all ${isSaved ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                        >
                            {isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    {/* Description Mock */}
                    <div className="space-y-3 opacity-60">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded" />
                        <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-4/5 bg-gray-100 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-full bg-gray-100 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Lock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
