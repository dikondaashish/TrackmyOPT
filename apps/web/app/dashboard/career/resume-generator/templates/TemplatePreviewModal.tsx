"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, FileText, Download, ChevronRight, Eye } from "lucide-react";

export interface TemplateColor {
    name: string;
    class: string; // Tailwind gradient or bg class
    ring: string; // Ring color for selection
}

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    isPremium: boolean;
    preview: string; // Default preview class
    colors: TemplateColor[];
}

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onSelect: (templateId: string, color: TemplateColor) => void;
}

export function TemplatePreviewModal({ isOpen, onClose, template, onSelect }: TemplatePreviewModalProps) {
    const [selectedColor, setSelectedColor] = useState<TemplateColor | null>(null);
    const [isPdfView, setIsPdfView] = useState(false);

    if (!template) return null;

    // Set default color when template changes
    if (!selectedColor && template.colors.length > 0) {
        setSelectedColor(template.colors[0]);
    }

    const currentColor = selectedColor || template.colors[0];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden bg-white dark:bg-gray-950 flex flex-col md:flex-row gap-0">
                {/* Close Button (Absolute) */}


                {/* Left: Preview Area (Scrollable) */}
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-8 relative flex items-center justify-center">

                    {/* View Toggle */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 p-1 flex gap-1 z-10">
                        <button
                            onClick={() => setIsPdfView(false)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${!isPdfView ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                Web View
                            </span>
                        </button>
                        <button
                            onClick={() => setIsPdfView(true)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${isPdfView ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Download className="w-3.5 h-3.5" />
                                PDF View
                            </span>
                        </button>
                    </div>

                    {/* Resume Document Preview */}
                    <div
                        className={`w-full max-w-[800px] bg-white dark:bg-white shadow-2xl transition-all duration-500 origin-top
                            ${isPdfView ? 'aspect-[1/1.414] scale-95' : 'aspect-[1/1.414]'}
                        `}
                        style={{ minHeight: '1000px' }} // Simulation height
                    >
                        {/* Simulated Resume Header based on selected color */}
                        <div className={`h-8 w-full ${currentColor.class}`}></div>
                        <div className="p-12 space-y-8">
                            {/* Header */}
                            <div className="space-y-4">
                                <div className="h-10 w-2/3 bg-gray-800/10 rounded-md animate-pulse"></div>
                                <div className="h-4 w-1/3 bg-gray-500/10 rounded animate-pulse"></div>
                                <div className="flex gap-4 pt-2">
                                    <div className="h-4 w-24 bg-gray-400/10 rounded"></div>
                                    <div className="h-4 w-24 bg-gray-400/10 rounded"></div>
                                    <div className="h-4 w-24 bg-gray-400/10 rounded"></div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="space-y-3">
                                <div className={`h-6 w-32 ${currentColor.class} opacity-20 rounded mb-2`}></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                                    <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            {/* Experience */}
                            <div className="space-y-6">
                                <div className={`h-6 w-32 ${currentColor.class} opacity-20 rounded mb-2`}></div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-40 bg-gray-800/10 rounded font-bold"></div>
                                        <div className="h-4 w-24 bg-gray-400/10 rounded"></div>
                                    </div>
                                    <div className="h-3 w-32 bg-gray-300 rounded"></div>
                                    <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                        <div className="h-3 w-11/12 bg-gray-100 rounded"></div>
                                        <div className="h-3 w-10/12 bg-gray-100 rounded"></div>
                                        <div className="h-3 w-full bg-gray-100 rounded"></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-40 bg-gray-800/10 rounded font-bold"></div>
                                        <div className="h-4 w-24 bg-gray-400/10 rounded"></div>
                                    </div>
                                    <div className="h-3 w-32 bg-gray-300 rounded"></div>
                                    <div className="pl-4 space-y-2 border-l-2 border-gray-100">
                                        <div className="h-3 w-11/12 bg-gray-100 rounded"></div>
                                        <div className="h-3 w-10/12 bg-gray-100 rounded"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-3">
                                <div className={`h-6 w-32 ${currentColor.class} opacity-20 rounded mb-2`}></div>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="h-6 w-20 bg-gray-100 rounded-full border border-gray-200"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Customization Sidebar */}
                <div className="w-full md:w-[350px] bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full">
                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="mb-6">
                            <span className="text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase mb-1 block">
                                {template.category}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {template.name}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {template.description}
                            </p>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mb-8">
                            {/* Color Theme selection removed as requested */}
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                Features
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    ATS-Optimized Layout
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Smart Section Organization
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-green-500" />
                                    Professional Typography
                                </li>
                                {template.isPremium && (
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-amber-500" />
                                        Premium Design Elements
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                        <Button
                            onClick={() => onSelect(template.id, currentColor)}
                            className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                        >
                            Use This Template
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                        <p className="text-center text-xs text-gray-400 mt-3">
                            You can customize sections in the next step
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
