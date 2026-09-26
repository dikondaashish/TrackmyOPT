"use client";

import { RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Code, Loader2, Sparkles } from "lucide-react";
import { GenerationSteps } from "./GenerationSteps";
import type { GenerationStep } from "@/lib/resume/generation-steps";
import type { EditorViewMode } from "./LatexToolbar";

export type LatexEditorPaneProps = {
    viewMode: EditorViewMode;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    editorValue: string;
    generatedLatex: string;
    isGenerating: boolean;
    generationSteps: GenerationStep[];
    onChangeText: (value: string) => void;
    onSelectionSync: () => void;
    onOpenFeedback: () => void;
};

export function LatexEditorPane({
    viewMode,
    textareaRef,
    editorValue,
    generatedLatex,
    isGenerating,
    generationSteps,
    onChangeText,
    onSelectionSync,
    onOpenFeedback,
}: LatexEditorPaneProps) {
    const isWorking = generationSteps.some((step) => step.status === "active");
    const isReplacingSource = isGenerating || generationSteps.some((step) => step.id === "improve" && step.status === "active");

    return (
        <div
            className={`flex flex-col border-r border-gray-200 dark:border-gray-800 max-md:!w-full max-md:flex-1 ${viewMode === 'visual' ? 'hidden' : 'block'}`}
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
                        disabled={isWorking || !generatedLatex}
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-900">
                {isWorking && (
                    <div className={`shrink-0 border-b border-gray-800 p-5 text-gray-200 ${!editorValue ? "flex flex-1 items-center justify-center" : ""}`}>
                        <GenerationSteps steps={generationSteps} />
                    </div>
                )}
                <textarea
                    ref={textareaRef}
                    value={editorValue}
                    onChange={(e) => {
                        if (!isReplacingSource) onChangeText(e.target.value);
                    }}
                    onMouseUp={onSelectionSync}
                    onKeyUp={onSelectionSync}
                    readOnly={isReplacingSource}
                    aria-label="LaTeX source"
                    className={`w-full min-h-0 flex-1 p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none ${!editorValue && isWorking ? "hidden" : ""}`}
                    spellCheck={false}
                    placeholder="LaTeX code will appear here..."
                    style={{
                        lineHeight: '1.6',
                        tabSize: 2,
                    }}
                />

            </div>
        </div>

    );
}
