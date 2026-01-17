"use client";

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-gray-950">
            <style jsx>{`
                @keyframes loading-slide {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(100%);
                    }
                    100% {
                        transform: translateX(300%);
                    }
                }
                .animate-loading-bar {
                    animation: loading-slide 1.5s infinite linear;
                }
            `}</style>
            <div className="flex flex-col items-center">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-6">
                    {/* Logo Icon */}
                    <div className="flex items-center justify-center">
                        <img
                            src="/TrackMyOPT Logo/logo.gif"
                            alt="TrackMyOPT Logo"
                            className="w-16 h-16 object-contain"
                        />
                    </div>
                    {/* Logo Text */}
                    <span className="text-2xl font-semibold text-gray-900 dark:text-white">
                        TrackMyOPT
                    </span>
                </div>

                {/* Progress Bar Container */}
                <div className="w-48 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative">
                    {/* Animated Indeterminate Bar */}
                    <div
                        className="h-full bg-[#1e3a8a] rounded-full w-24 absolute top-0 left-0 animate-loading-bar"
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
