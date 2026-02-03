"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeAfterResumeProps {
    className?: string;
}

export function BeforeAfterResume({ className }: BeforeAfterResumeProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = useCallback((event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const x = "touches" in event ? event.touches[0].clientX : event.clientX;
        const position = ((x - rect.left) / rect.width) * 100;
        setSliderPosition(Math.min(100, Math.max(0, position)));
    }, [isDragging]);

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = () => setIsDragging(false);

    useEffect(() => {
        const handleGlobalMove = (e: MouseEvent | TouchEvent) => handleMove(e);
        const handleGlobalUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener("mousemove", handleGlobalMove);
            window.addEventListener("touchmove", handleGlobalMove);
            window.addEventListener("mouseup", handleGlobalUp);
            window.addEventListener("touchend", handleGlobalUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleGlobalMove);
            window.removeEventListener("touchmove", handleGlobalMove);
            window.removeEventListener("mouseup", handleGlobalUp);
            window.removeEventListener("touchend", handleGlobalUp);
        };
    }, [isDragging, handleMove]);

    return (
        <div className={cn("relative w-full max-w-3xl mx-auto h-[500px] select-none rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800", className)} ref={containerRef}>
            {/* Before Image (Background) */}
            <div className="absolute inset-0 bg-white dark:bg-zinc-900 flex flex-col p-8">
                <div className="mb-4 text-center">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Before</span>
                </div>
                <div className="space-y-4 opacity-50 blur-[1px]">
                    {/* Skeleton for "Bad" Resume */}
                    <div className="h-8 bg-gray-200 dark:bg-zinc-700 w-1/3 mb-6" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-5/6" />
                        <div className="h-4 bg-gray-200 dark:bg-zinc-700 w-4/6" />
                    </div>
                    <div className="h-40 bg-gray-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center">
                        <p className="text-gray-400 font-mono text-sm">Generic content...</p>
                    </div>
                    <ul className="list-disc pl-5 space-y-2 text-gray-400">
                        <li>Responsible for managing projects</li>
                        <li>Worked with a team</li>
                        <li>Good communication skills</li>
                    </ul>
                </div>
            </div>

            {/* After Image (Clipped) */}
            <div
                className="absolute inset-0 bg-white dark:bg-zinc-900 overflow-hidden"
                style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
            >
                <div className="absolute inset-0 flex flex-col p-8 bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-zinc-900">
                    <div className="mb-4 text-center">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">After Optimization</span>
                    </div>
                    <div className="space-y-4">
                        {/* "Good" Resume Content */}
                        <div className="h-8 bg-gray-800 dark:bg-white w-1/3 mb-6 rounded" />
                        <div className="space-y-2">
                            <div className="h-4 bg-purple-200 dark:bg-purple-900/50 w-full rounded" />
                            <div className="h-4 bg-purple-200 dark:bg-purple-900/50 w-5/6 rounded" />
                        </div>

                        {/* High Impact Bullets */}
                        <div className="space-y-4 mt-8">
                            <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Led cross-functional team of 5 engineers to deliver Q4 roadmap (JIRA, Agile).</p>
                                    <p className="text-xs text-emerald-600 font-medium">✨ Impact + Keywords</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Reduced query latency by 40% using Redis caching strategies.</p>
                                    <p className="text-xs text-emerald-600 font-medium">✨ Quantified Results</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Secured H-1B sponsorship with Top 10 Tech Co. due to specialized skill set.</p>
                                    <p className="text-xs text-emerald-600 font-medium">✨ Sponsor Friendly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-20 group"
                style={{ left: `${sliderPosition}%` }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 text-gray-400 group-hover:scale-110 transition-transform">
                    <GripVertical className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
