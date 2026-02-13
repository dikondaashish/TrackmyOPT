import { useState, useEffect, useCallback, useRef } from "react";

interface UseStreamingEffectProps {
    text: string;
    isEnabled: boolean;
    speed?: number; // ms per char
    onComplete?: () => void;
}

export function useStreamingEffect({ text, isEnabled, speed = 8, onComplete }: UseStreamingEffectProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);

    // Refs to keep track of implementation details without causing re-renders
    const indexRef = useRef(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const fullTextRef = useRef(text);

    // Update full text ref when prop changes
    useEffect(() => {
        fullTextRef.current = text;
    }, [text]);

    const stopStreaming = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        setIsStreaming(false);
        setDisplayedText(fullTextRef.current);
        if (onComplete) onComplete();
    }, [onComplete]);

    const startStreaming = useCallback(() => {
        // Clear any existing timer
        if (timerRef.current) clearInterval(timerRef.current);

        setIsStreaming(true);
        setDisplayedText("");
        indexRef.current = 0;

        timerRef.current = setInterval(() => {
            if (indexRef.current < fullTextRef.current.length) {
                // Natural typing cadence
                // 2-3 chars per frame at 12ms interval = ~150-250 chars/sec
                // This feels like a very fast typer but readable
                const chunkSize = 2;
                const chunk = fullTextRef.current.slice(indexRef.current, indexRef.current + chunkSize);
                setDisplayedText(prev => prev + chunk);
                indexRef.current += chunkSize;
            } else {
                // Done
                stopStreaming();
            }
        }, 12); // Fast typing speed
    }, [speed, stopStreaming]);

    // Effect to trigger stream when `isEnabled` becomes true or text changes significantly while enabled
    // We need a way to distinguish "correction" vs "new generation". 
    // The parent controls `isEnabled`.
    useEffect(() => {
        if (isEnabled && text) {
            // Only restart streaming if text is different from what we successfully displayed? 
            // Or if `isEnabled` just toggled to true.
            // For now, if enabled and text exists, start.
            startStreaming();
        } else if (!isEnabled) {
            // If disabled, ensure we show full text immediately
            setDisplayedText(text);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            setIsStreaming(false);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isEnabled, text, startStreaming]);

    return {
        displayedText,
        isStreaming,
        stopStreaming
    };
}
