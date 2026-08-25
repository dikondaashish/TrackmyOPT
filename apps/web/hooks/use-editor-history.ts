
import { useState, useCallback } from 'react';

const MAX_HISTORY = 100;

interface UseEditorHistoryReturn {
    text: string;
    updateText: (newText: string, saveToHistory?: boolean) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
}

export function useEditorHistory(initialText: string, onUpdate: (text: string) => void): UseEditorHistoryReturn {
    // History stack
    const [history, setHistory] = useState<string[]>([initialText]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const updateText = useCallback((newText: string, saveToHistory = true) => {
        onUpdate(newText);

        if (saveToHistory) {
            // Use functional updater for currentIndex to avoid stale closure
            setCurrentIndex(prevIndex => {
                setHistory(prev => {
                    const newHistory = prev.slice(0, prevIndex + 1);
                    newHistory.push(newText);
                    // Cap history to prevent memory bloat
                    if (newHistory.length > MAX_HISTORY) {
                        return newHistory.slice(newHistory.length - MAX_HISTORY);
                    }
                    return newHistory;
                });
                // Adjust index if history was capped
                const nextIndex = prevIndex + 1;
                return Math.min(nextIndex, MAX_HISTORY - 1);
            });
        }
    }, [onUpdate]);

    const undo = useCallback(() => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const previousText = history[newIndex];
            setCurrentIndex(newIndex);
            onUpdate(previousText);
        }
    }, [currentIndex, history, onUpdate]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            const nextText = history[newIndex];
            setCurrentIndex(newIndex);
            onUpdate(nextText);
        }
    }, [currentIndex, history, onUpdate]);

    return {
        text: history[currentIndex], // This might be laggy if we don't track intermediate typing
        updateText,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1
    };
}
