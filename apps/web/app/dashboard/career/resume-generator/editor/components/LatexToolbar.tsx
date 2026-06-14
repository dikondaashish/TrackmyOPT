
import React from 'react';
import type { LucideIcon } from 'lucide-react';
import {
    Undo,
    Redo,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Image as ImageIcon,
    Table as TableIcon,
    Sigma,
    Type,
    Heading1,
    Heading2,
    Eye,
    Code,
    Columns,
    Search,
    Settings,
    MoreHorizontal
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export type EditorViewMode = 'code' | 'split' | 'visual';

interface LatexToolbarProps {
    onUndo: () => void;
    onRedo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onInsert: (start: string, end?: string) => void;
    viewMode: EditorViewMode;
    onViewModeChange: (mode: EditorViewMode) => void;
}

export function LatexToolbar({
    onUndo,
    onRedo,
    canUndo,
    canRedo,
    onInsert,
    viewMode,
    onViewModeChange
}: LatexToolbarProps) {
    return (
        <TooltipProvider>
            <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                <div className="flex items-center gap-1">
                    {/* History */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Undo}
                            label="Undo"
                            onClick={onUndo}
                            disabled={!canUndo}
                        />
                        <ToolbarButton
                            icon={Redo}
                            label="Redo"
                            onClick={onRedo}
                            disabled={!canRedo}
                        />
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    {/* Formatting */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Bold}
                            label="Bold (Cmd+B)"
                            onClick={() => onInsert('\\textbf{', '}')}
                        />
                        <ToolbarButton
                            icon={Italic}
                            label="Italic (Cmd+I)"
                            onClick={() => onInsert('\\textit{', '}')}
                        />
                        <ToolbarButton
                            icon={Underline}
                            label="Underline (Cmd+U)"
                            onClick={() => onInsert('\\underline{', '}')}
                        />
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    {/* Structure */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={Heading1}
                            label="Section"
                            onClick={() => onInsert('\\section{', '}')}
                        />
                        <ToolbarButton
                            icon={Heading2}
                            label="Subsection"
                            onClick={() => onInsert('\\subsection{', '}')}
                        />
                    </div>

                    <Separator orientation="vertical" className="h-6 mx-2" />

                    {/* Lists & Math */}
                    <div className="flex items-center gap-0.5">
                        <ToolbarButton
                            icon={List}
                            label="Bulleted List"
                            onClick={() => onInsert('\\begin{itemize}\n  \\item ', '\n\\end{itemize}')}
                        />
                        <ToolbarButton
                            icon={ListOrdered}
                            label="Numbered List"
                            onClick={() => onInsert('\\begin{enumerate}\n  \\item ', '\n\\end{enumerate}')}
                        />
                        <ToolbarButton
                            icon={Sigma}
                            label="Math Mode"
                            onClick={() => onInsert('$', '$')}
                        />
                        <ToolbarButton
                            icon={TableIcon}
                            label="Insert Table"
                            onClick={() => onInsert(
                                '\\begin{tabular}{|c|c|}\n  \\hline\n  Header 1 & Header 2 \\\\\n  \\hline\n  Cell 1 & Cell 2 \\\\\n  \\hline\n\\end{tabular}'
                            )}
                        />
                    </div>
                </div>

                {/* Right Side: Search & Settings (Visual check only for now) */}
                <div className="flex items-center gap-2">
                    {/* View Mode Switcher */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mr-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onViewModeChange('code')}
                                    className={`h-7 w-7 rounded ${viewMode === 'code' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    <Code className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Code Editor</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onViewModeChange('split')}
                                    className={`hidden md:flex h-7 w-7 rounded ${viewMode === 'split' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    <Columns className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Split View</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onViewModeChange('visual')}
                                    className={`h-7 w-7 rounded ${viewMode === 'visual' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
                                >
                                    <Eye className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Visual Preview</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Extra Tools */}
                    <ToolbarButton icon={Search} label="Find (Cmd+F)" onClick={() => { }} disabled />
                    <ToolbarButton icon={Settings} label="Editor Settings" onClick={() => { }} disabled />
                </div>
            </div>
        </TooltipProvider>
    );
}

function ToolbarButton({ icon: Icon, label, onClick, disabled }: { icon: LucideIcon, label: string, onClick: () => void, disabled?: boolean }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClick}
                    disabled={disabled}
                    className="max-md:min-h-11 max-md:min-w-11 h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    <Icon className="w-4 h-4" />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
                {label}
            </TooltipContent>
        </Tooltip>
    );
}
