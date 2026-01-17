"use client";

import { useEffect, useState } from "react";

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
    const [progress, setProgress] = useState(0);

    // Animate progress bar
    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    // Slow down near the end to simulate waiting
                    return prev + 0.5;
                }
                return prev + Math.random() * 15;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950">
            <div className="flex flex-col items-center">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-6">
                    {/* Logo Icon */}
                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a] flex items-center justify-center">
                        <span className="text-white font-bold text-xl">T</span>
                    </div>
                    {/* Logo Text */}
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        TrackMyOPT
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    {/* Animated Progress */}
                    <div
                        className="h-full bg-[#1e3a8a] rounded-full transition-all duration-200 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Optional Message */}
                {message && (
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

// Smaller inline loading spinner for components
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    return (
        <div className="flex items-center justify-center">
            <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin`} />
        </div>
    );
}

// Card/Section loading placeholder
export function LoadingCard() {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
            </div>
        </div>
    );
}
