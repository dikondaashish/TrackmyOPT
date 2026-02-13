import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
    "🧠 Thinking...",
    "🔍 Analyzing your profile...",
    "🎯 Optimizing ATS keywords...",
    "📐 Structuring LaTeX document...",
    "✍️ Formatting sections...",
    "✨ Polishing final details..."
];

interface GenerationLoadingStateProps {
    className?: string;
}

export function GenerationLoadingState({ className }: GenerationLoadingStateProps) {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000); // Cycle every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={cn("flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300", className)}>
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin relative z-10" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 min-h-[1.75rem] transition-all duration-300">
                {LOADING_MESSAGES[messageIndex]}
            </h3>

            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Gemini 2.5 Pro is crafting your resume. This usually takes about 10-15 seconds.
            </p>
        </div>
    );
}
