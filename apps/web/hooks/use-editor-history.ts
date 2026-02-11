
import { useState, useCallback } from 'react';

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

    // Current text (can be ahead of history if we haven't saved yet, e.g. typing)
    // But for simplicity, let's keep them in sync or just use the parent's text?
    // Actually, distinct history state is safer.

    const updateText = useCallback((newText: string, saveToHistory = true) => {
        onUpdate(newText);

        if (saveToHistory) {
            setHistory(prev => {
                const newHistory = prev.slice(0, currentIndex + 1);
                newHistory.push(newText);
                return newHistory;
            });
            setCurrentIndex(prev => prev + 1);
        }
    }, [currentIndex, onUpdate]);

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
