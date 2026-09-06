"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Code, Loader2, Sparkles } from "lucide-react";
import { GeneratingOverlay } from "./GeneratingOverlay";
import type { EditorViewMode } from "./LatexToolbar";

export type LatexEditorPaneProps = {
    viewMode: EditorViewMode;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    editorValue: string;
    generatedLatex: string;
    isGenerating: boolean;
    isStreaming: boolean;
    onChangeText: (value: string) => void;
    onSelectionSync: () => void;
    onOpenFeedback: () => void;
    onStopStreaming: () => void;
};

export function LatexEditorPane({
    viewMode,
    textareaRef,
    editorValue,
    generatedLatex,
    isGenerating,
    isStreaming,
    onChangeText,
    onSelectionSync,
    onOpenFeedback,
    onStopStreaming,
}: LatexEditorPaneProps) {
    return (
        <div
            className={`flex flex-col border-r border-gray-200 dark:border-gray-800 transition-all duration-300 max-md:!w-full max-md:flex-1 ${viewMode === 'visual' ? 'hidden' : 'block'}`}
            style={{ width: viewMode === 'code' ? '100%' : viewMode === 'split' ? '50%' : '0%' }}
        >
            {/* Editor Header */}
            <div className="flex-shrink-0 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">LaTeX Editor</span>
                    <span className="hidden lg:inline text-xs text-gray-400">Select text to locate in PDF →</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onOpenFeedback}
                        disabled={isGenerating}
                        className="h-6 px-2 text-xs text-purple-600"
                    >
                        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
                        Optimize
                    </Button>
                    <span className="text-xs text-gray-400">
                        {generatedLatex.split('\n').length} lines
                    </span>
                </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 overflow-hidden relative group">
                <textarea
                    ref={textareaRef}
                    value={editorValue}
                    onChange={(e) => {
                        if (!isStreaming) onChangeText(e.target.value);
                    }}
                    onMouseUp={onSelectionSync}
                    onKeyUp={onSelectionSync}
                    readOnly={isStreaming}
                    className={`w-full h-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none ${isStreaming ? 'cursor-not-allowed opacity-90' : ''}`}
                    spellCheck={false}
                    placeholder="LaTeX code will appear here..."
                    style={{
                        lineHeight: '1.6',
                        tabSize: 2,
                    }}
                />

                {/* AI Generating Overlay — shown while waiting for Gemini */}
                {isGenerating && !editorValue && <GeneratingOverlay />}

                {/* Stop Streaming Button */}
                {isStreaming && (
                    <div className="absolute bottom-6 right-6 z-10">
                        <Button
                            onClick={onStopStreaming}
                            variant="secondary"
                            size="sm"
                            className="shadow-lg bg-white text-gray-900 hover:bg-gray-100"
                        >
                            <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse" />
                            Stop Generating
                        </Button>
                    </div>
                )}
            </div>
        </div>

    );
}
