"use client";

import { motion } from "framer-motion";
import { MessageSquare, ThumbsUp, CheckCircle2, MoreHorizontal } from "lucide-react";

export function DiscussionThreadPreview() {
    return (
        <div className="relative w-full max-w-[500px] mx-auto">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-orange-600">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">Recent Interview Questions</h4>
                        <p className="text-xs text-gray-500">Posted in #interview-prep • 2h ago</p>
                    </div>
                </div>

                <div className="p-4 space-y-4 bg-gray-50 dark:bg-zinc-950/50 min-h-[300px]">

                    {/* Visual Thread */}
                    {/* Post 1 (Question) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0" />
                        <div className="bg-white dark:bg-zinc-900 p-3 rounded-tr-xl rounded-b-xl border border-gray-200 dark:border-zinc-800 shadow-sm max-w-[80%]">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Alex Chen</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Just finished my Google L3 onsite! Here were the topics covered...</p>
                            <div className="mt-2 flex gap-2">
                                <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500">#google</span>
                                <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-500">#system-design</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Post 2 (Reply) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        viewport={{ once: true }}
                        className="flex gap-3 flex-row-reverse"
                    >
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-purple-600 relative">
                            SM
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-0.5">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-tl-xl rounded-b-xl border border-purple-100 dark:border-purple-900/30 shadow-sm max-w-[80%]">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">Sarah Miller</p>
                                <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 rounded-full font-medium">Alumni Mentor</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Congrats Alex! For the system design round, did they focus more on scalability or data modeling? Usually for L3 it's heavily...</p>
                            <div className="mt-2 flex items-center gap-4">
                                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-purple-600 transition-colors">
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>12 Helpful</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Typing Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        viewport={{ once: true }}
                        className="flex gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-800 flex-shrink-0 animate-pulse" />
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800/50 px-3 py-2 rounded-full">
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
