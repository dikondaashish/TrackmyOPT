"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion"; // Fix imports
import { ChevronsLeftRight, FileX, FileCheck2 } from "lucide-react";

export function ResumeComparisonSlider() {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => { // Type fix
        if (!containerRef.current) return;
        const { width, left } = containerRef.current.getBoundingClientRect();
        const clientX = (info.point.x); // Use framer motion point

        // Calculate percentage
        let percentage = ((clientX - left) / width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));

        setSliderPosition(percentage);
    };

    // Generic Resume Representation
    const ResumeContent = ({ type }: { type: "bad" | "good" }) => (
        <div className={`h-full w-full p-6 md:p-8 flex flex-col gap-4 ${type === 'good' ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50 dark:bg-zinc-950'}`}>
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 border-gray-100 dark:border-zinc-800">
                <div className="space-y-2">
                    <div className={`h-6 rounded w-48 ${type === 'good' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-400 dark:bg-zinc-600'}`} />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-32" />
                </div>
                {type === 'good' && (
                    <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold rounded uppercase">
                        ATS Optimized
                    </div>
                )}
            </div>

            {/* Content Logic */}
            <div className="grid grid-cols-3 gap-6 h-full">
                {/* Left Column (Skills) - Only for Good Resume */}
                <div className="col-span-1 space-y-3 hidden md:block">
                    <div className="h-3 bg-gray-300 dark:bg-zinc-700 rounded w-16 mb-2" />
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-2 rounded w-full ${type === 'good' ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-gray-200 dark:bg-zinc-800'}`} />
                    ))}
                </div>

                {/* Main Content */}
                <div className={`${type === 'good' ? 'md:col-span-2' : 'col-span-3'} space-y-4`}>
                    {[1, 2, 3].map((section) => (
                        <div key={section} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className={`h-4 w-24 rounded ${type === 'good' ? 'bg-gray-800 dark:bg-zinc-600' : 'bg-gray-400 dark:bg-zinc-700'}`} />
                                {type === 'bad' && section === 1 && <span className="text-[10px] text-red-500 font-mono">Missing Keywords</span>}
                            </div>
                            <div className="space-y-1.5">
                                <div className={`h-2 w-full rounded ${type === 'good' ? 'bg-gray-600 dark:bg-zinc-500' : 'bg-gray-300 dark:bg-zinc-800'}`} />
                                <div className={`h-2 w-[90%] rounded ${type === 'good' ? 'bg-gray-600 dark:bg-zinc-500' : 'bg-gray-300 dark:bg-zinc-800'}`} />
                                <div className={`h-2 w-[95%] rounded ${type === 'good' ? 'bg-gray-600 dark:bg-zinc-500' : 'bg-gray-300 dark:bg-zinc-800'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Overlay Label */}
            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg
                ${type === 'good'
                    ? 'bg-green-50/90 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800'
                    : 'bg-red-50/90 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800'
                }`}>
                {type === 'good' ? <span className="flex items-center gap-1"><FileCheck2 size={12} /> Optimized</span> : <span className="flex items-center gap-1"><FileX size={12} /> Before</span>}
            </div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-zinc-800 select-none cursor-ew-resize"
        >
            {/* Underlying Image (Before / Good) - Actually let's flip it. Often Before is Left. */}
            {/* Let's do: Left = Bad, Right = Good. */}

            {/* Background Layer (Right Side / Good Resume) */}
            <div className="absolute inset-0 z-0">
                <ResumeContent type="good" />
            </div>

            {/* Foreground Layer (Left Side / Bad Resume) - Clip Path */}
            <div
                className="absolute inset-0 z-10 overflow-hidden border-r border-white/50"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <ResumeContent type="bad" />
            </div>

            {/* Slider Handle */}
            <motion.div
                className="absolute top-0 bottom-0 z-20 w-1 bg-blue-500 cursor-ew-resize hover:bg-blue-400 transition-colors"
                style={{ left: `${sliderPosition}%` }}
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => setIsDragging(false)}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-xl border-2 border-white cursor-ew-resize">
                    <ChevronsLeftRight className="w-4 h-4 text-white" />
                </div>
            </motion.div>

        </div>
    );
}
