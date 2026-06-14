"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Code, Eye, Check, Timer } from "lucide-react";

export const ResumeEditorMockup = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    // Sample "Before" and "After" text
    const beforeText = "Software Engineer\nUsed React and Node.js to build web apps.\nFixed bugs and improved performance.";
    const afterText = "Software Engineer\n• Architected scalable web applications using React and Node.js, serving 10k+ daily users.\n• Optimized frontend performance by 40% through code splitting and memoization.\n• Resolved critical production bugs, improving system stability by 99.9%.";

    const [displayText, setDisplayText] = useState(beforeText);

    const handleEnhance = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setDisplayText(afterText);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="relative bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-border/50 overflow-hidden h-full flex flex-col">
            {/* Window Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground mr-2">Step 3 of 3</span>
                    <div className="flex gap-1">
                        <div className="w-4 h-1 rounded-full bg-blue-500" />
                        <div className="w-4 h-1 rounded-full bg-blue-500" />
                        <div className="w-4 h-1 rounded-full bg-blue-500" />
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 py-2 border-b border-border/50 flex items-center justify-between bg-white dark:bg-zinc-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-foreground">Resume Editor</h3>
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    <button
                        onClick={handleEnhance}
                        disabled={isGenerating || displayText === afterText}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all
                            ${isGenerating || displayText === afterText
                                ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 opacity-80"
                                : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-500"}`}
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        {isGenerating ? "Enhancing..." : displayText === afterText ? "AI Enhanced" : "Enhance with AI"}
                    </button>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-700/50 p-0.5 rounded-lg">
                    <div className="p-1 rounded bg-white dark:bg-zinc-600 shadow-sm">
                        <Code className="w-3 h-3 text-foreground" />
                    </div>
                    <div className="p-1 rounded text-muted-foreground">
                        <Eye className="w-3 h-3" />
                    </div>
                </div>
            </div>

            {/* Marketing Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/20 px-4 py-1.5 flex items-center justify-center">
                <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <Timer className="w-3.5 h-3.5 shrink-0" />
                    We cook your resume in 2 minutes — faster than Maggi.
                </p>
            </div>

            {/* Split View Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Side (Left) */}
                <div className="w-1/2 border-r border-border/50 bg-gray-50/30 dark:bg-zinc-900/10 flex flex-col">
                    <div className="p-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Role</label>
                            <div className="w-full p-2 bg-white dark:bg-zinc-800 border border-border/50 rounded-lg text-xs font-medium">
                                Software Engineer
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex justify-between">
                                Description
                                {displayText === afterText && (
                                    <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Improved
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <motion.div
                                    className="w-full h-32 p-3 bg-white dark:bg-zinc-800 border border-border/50 rounded-lg text-xs leading-relaxed resize-none font-mono"
                                    initial={false}
                                    animate={{
                                        backgroundColor: isGenerating ? "rgba(168, 85, 247, 0.05)" : "rgba(255, 255, 255, 0)",
                                        color: displayText === afterText ? "var(--foreground)" : "var(--muted-foreground)"
                                    }}
                                >
                                    {displayText}
                                    {isGenerating && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-800/50 backdrop-blur-[1px]">
                                            <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                        </div>
                                    )}
                                </motion.div>

                                <AnimatePresence>
                                    {displayText === afterText && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute -right-2 -top-2"
                                        >
                                            <div className="bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                                +40% Impact
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview Side (Right) */}
                <div className="w-1/2 bg-white dark:bg-zinc-800 relative flex flex-col p-4 shadow-[inset_4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <span className="text-[60px] font-serif text-gray-100 dark:text-zinc-700/20 select-none">Aa</span>
                    </div>

                    {/* Simulated Document */}
                    <motion.div
                        className="flex-1 space-y-3 opacity-80"
                        animate={{ opacity: isGenerating ? 0.5 : 0.9 }}
                    >
                        {/* Doc Header */}
                        <div className="border-b-2 border-black dark:border-white/20 pb-2 mb-2">
                            <div className="h-4 w-1/2 bg-gray-800 dark:bg-white/80 rounded mb-1" />
                            <div className="flex gap-2">
                                <div className="h-2 w-16 bg-gray-400 dark:bg-white/40 rounded" />
                                <div className="h-2 w-16 bg-gray-400 dark:bg-white/40 rounded" />
                            </div>
                        </div>

                        {/* Experience Section */}
                        <div className="space-y-2">
                            <div className="h-3 w-1/3 bg-gray-600 dark:bg-white/60 rounded uppercase" />
                            <div className="space-y-2 pl-2 border-l-2 border-gray-200 dark:border-zinc-700">
                                <div className="flex justify-between">
                                    <div className="h-3 w-32 bg-gray-800 dark:bg-white/70 rounded" />
                                    <div className="h-2 w-16 bg-gray-400 dark:bg-white/30 rounded" />
                                </div>

                                {/* Dynamic Content */}
                                <motion.div
                                    className="space-y-1.5 pt-1"
                                    layout
                                >
                                    {isGenerating ? (
                                        <>
                                            <div className="h-2 w-full bg-purple-100 dark:bg-purple-900/30 rounded animate-pulse" />
                                            <div className="h-2 w-5/6 bg-purple-100 dark:bg-purple-900/30 rounded animate-pulse" />
                                            <div className="h-2 w-4/6 bg-purple-100 dark:bg-purple-900/30 rounded animate-pulse" />
                                        </>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="space-y-1.5"
                                        >
                                            {displayText.split('\n').slice(1).map((line, i) => (
                                                <div key={i} className="flex gap-1.5 items-start">
                                                    <div className="w-1 h-1 rounded-full bg-gray-400 dark:bg-white/40 mt-1.5 shrink-0" />
                                                    <div className={`text-[8px] leading-3 ${displayText === afterText ? "text-gray-700 dark:text-gray-300 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                                                        {line.replace(/^• /, '')}
                                                    </div>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ATS Badge Pop-in */}
                    <AnimatePresence>
                        {displayText === afterText && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="absolute bottom-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-1.5"
                            >
                                <div className="p-0.5 bg-white/20 rounded-full">
                                    <Check className="w-2.5 h-2.5" />
                                </div>
                                <div className="text-xs font-bold">92% ATS Score</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
