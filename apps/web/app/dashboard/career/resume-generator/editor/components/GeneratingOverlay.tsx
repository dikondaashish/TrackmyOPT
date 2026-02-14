"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const STAGES = [
    { text: "Analyzing your resume", icon: "📄" },
    { text: "Matching job requirements", icon: "🔍" },
    { text: "Extracting key skills", icon: "⚙️" },
    { text: "Optimizing for ATS", icon: "🎯" },
    { text: "Adding impact metrics", icon: "📊" },
    { text: "Structuring sections", icon: "📐" },
    { text: "Polishing final draft", icon: "✨" },
];

export function GeneratingOverlay() {
    const [stageIndex, setStageIndex] = useState(0);
    const [dots, setDots] = useState("");

    // Cycle through stages
    useEffect(() => {
        const interval = setInterval(() => {
            setStageIndex((prev) => (prev + 1) % STAGES.length);
        }, 2800);
        return () => clearInterval(interval);
    }, []);

    // Animate dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 400);
        return () => clearInterval(interval);
    }, []);

    const stage = STAGES[stageIndex];

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/95 backdrop-blur-sm">
            {/* Animated sparkle icon */}
            <div className="relative mb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
                </div>
                {/* Orbiting dot */}
                <div className="absolute inset-0 animate-spin" style={{ animationDuration: "3s" }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400/60" />
                </div>
            </div>

            {/* Stage text */}
            <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2.5 text-gray-200 text-sm font-medium min-h-[24px]">
                    <span className="text-base">{stage.icon}</span>
                    <span>{stage.text}{dots}</span>
                </div>

                {/* Progress bar */}
                <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                    />
                </div>

                {/* Sub-text */}
                <p className="text-xs text-gray-500">AI is crafting your resume</p>
            </div>
        </div>
    );
}
