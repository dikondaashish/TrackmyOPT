"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    ArrowLeft,
    Check,
    Crown,
    Sparkles,
    ChevronRight,
    FileText,
    Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemplatePreviewModal } from "./TemplatePreviewModal";
import { useResumeStore } from "@/store/resume-store";
import { RESUME_TEMPLATES, Template, TemplateColor } from "@/lib/templates";


export default function TemplateSelectionPage() {
    const router = useRouter();
    const {
        selectedTemplateId, setSelectedTemplateId,
        resumeText, jobDescription,
        setSelectedColor
    } = useResumeStore();

    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
    };

    const handlePreview = (e: React.MouseEvent, template: Template) => {
        e.stopPropagation();
        setPreviewTemplate(template);
    };

    const handleContinue = (templateId?: string, color?: TemplateColor) => {
        const idToUse = templateId || selectedTemplateId;
        if (!idToUse) return;

        // Store template selection
        if (color) {
            setSelectedColor(color);
        } else {
            setSelectedColor(null);
        }

        router.push("/dashboard/career/resume-generator/editor");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <Link
                            href="/dashboard/career/resume-generator"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        {/* Title + Progress */}
                        <div className="text-center">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                                Select Template
                            </h1>
                            <div className="flex items-center justify-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <div className="w-8 h-1 rounded-full bg-blue-600" />
                                    <div className="w-8 h-1 rounded-full bg-blue-600" />
                                    <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">Step 2 of 3</span>
                            </div>
                        </div>

                        {/* Placeholder for alignment */}
                        <div className="w-20" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                Resume loaded: {resumeText.length} characters
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Job description: {jobDescription.length} characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {RESUME_TEMPLATES.map((template) => (
                        <Card
                            key={template.id}
                            onClick={() => handleSelectTemplate(template.id)}
                            className={`relative cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${selectedTemplateId === template.id
                                ? "ring-2 ring-blue-600 dark:ring-blue-400 shadow-xl shadow-blue-500/20"
                                : "border-gray-200 dark:border-gray-800"
                                }`}
                        >
                            {/* Preview Area */}
                            <div className={`h-48 bg-gradient-to-br ${template.previewGradient} relative group-hover:scale-105 transition-transform duration-500`}>
                                {/* Template Preview Placeholder */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-32 bg-white/90 dark:bg-gray-900/90 rounded shadow-lg p-2 transform group-hover:-translate-y-2 transition-transform duration-300">
                                        <div className="h-3 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-18 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                                        <div className="h-2 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
                                        <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
                                        <div className="h-2 w-18 bg-gray-200 dark:bg-gray-800 rounded" />
                                    </div>
                                </div>

                                {/* Hover Overlay with Preview Button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                    <Button
                                        onClick={(e) => handlePreview(e, template)}
                                        className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Quick Preview
                                    </Button>
                                </div>

                                {/* Premium Badge */}
                                {template.isPremium && (
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md z-10">
                                        <Crown className="w-3 h-3" />
                                        Premium
                                    </div>
                                )}

                                {/* Selected Check */}
                                {selectedTemplateId === template.id && (
                                    <div className="absolute top-2 left-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200 z-10">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="p-5 relative bg-white dark:bg-gray-900">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {template.name}
                                    </h3>
                                    <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-700">
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {template.description}
                                </p>

                                {/* Color Dots Preview */}
                                <div className="mt-4 flex gap-1.5">
                                    {template.colors.map((color, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-3 h-3 rounded-full ${color.class}`}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="mt-12 flex justify-center pb-12">
                    <Button
                        onClick={() => handleContinue()}
                        disabled={!selectedTemplateId}
                        className="px-10 py-7 text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group rounded-2xl"
                    >
                        <Sparkles className="w-5 h-5 mr-3" />
                        Generate Resume with Selected
                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>

                {!selectedTemplateId && (
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                        Select a template above to continue
                    </p>
                )}
            </div>

            {/* Preview Modal */}
            <TemplatePreviewModal
                isOpen={!!previewTemplate}
                onClose={() => setPreviewTemplate(null)}
                template={previewTemplate}
                onSelect={(id, color) => handleContinue(id, color)}
            />
        </div>
    );
}
