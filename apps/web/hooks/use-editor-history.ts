
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
    // Track current text separately from history to allow non-historic updates (e.g. streaming)
    const [currentText, setCurrentText] = useState(initialText);

    // Sync with external updates if needed (optional, but good if parent updates prop)
    // useEffect(() => setCurrentText(initialText), [initialText]); 

    const updateText = useCallback((newText: string, saveToHistory = true) => {
        setCurrentText(newText);
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
            setCurrentText(previousText);
            onUpdate(previousText);
        }
    }, [currentIndex, history, onUpdate]);

    const redo = useCallback(() => {
        if (currentIndex < history.length - 1) {
            const newIndex = currentIndex + 1;
            const nextText = history[newIndex];
            setCurrentIndex(newIndex);
            setCurrentText(nextText);
            onUpdate(nextText);
        }
    }, [currentIndex, history, onUpdate]);

    return {
        text: currentText,
        updateText,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1
    };
}
