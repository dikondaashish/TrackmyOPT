"use client";

import { useState } from "react";
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
import { TemplatePdfPreview } from "./TemplatePdfPreview";
import { useResumeStore } from "@/store/resume-store";
import { RESUME_TEMPLATES, Template, TemplateColor } from "@/lib/documents/templates";

/** Soft tint behind the card copy only — never applied to the resume preview. */
const TEMPLATE_INFO_BG: Record<string, string> = {
    modern: "bg-sky-50 dark:bg-sky-950/40",
    tech: "bg-teal-50 dark:bg-teal-950/40",
    professional: "bg-stone-50 dark:bg-stone-900/50",
    executive: "bg-indigo-50 dark:bg-indigo-950/40",
    academic: "bg-amber-50 dark:bg-amber-950/30",
    creative: "bg-violet-50 dark:bg-violet-950/40",
};


export default function TemplateSelectionPage() {
    const router = useRouter();
    const {
        selectedTemplateId, setSelectedTemplateId,
        resumeText, jobDescription,
        applicationId,
        setSelectedColor,
        setGeneratedLatex,
        setCompiledPdfUrl,
        setAtsAnalysis
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

        // CRITICAL: Clear previous generation results to force new generation
        setGeneratedLatex('');
        setCompiledPdfUrl('');
        setAtsAnalysis(null);

        const editorPath = applicationId
            ? `/dashboard/career/resume-generator/editor?applicationId=${encodeURIComponent(applicationId)}`
            : "/dashboard/career/resume-generator/editor";
        router.push(editorPath);
    };

    return (
        <div className="min-w-0 overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 -mx-3 sm:-mx-6 px-3 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800">
                <div className="max-w-7xl mx-auto py-4">
                    <div className="flex items-center justify-between gap-3">
                        {/* Back Button */}
                        <Link
                            href="/dashboard/career/resume-generator"
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors shrink-0"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Back</span>
                        </Link>

                        {/* Title + Progress */}
                        <div className="text-center min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
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
                        <div className="w-10 sm:w-20 shrink-0" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:py-8 min-w-0">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                                Resume loaded: {resumeText.length} characters
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                                Job description: {jobDescription.length} characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
                    {RESUME_TEMPLATES.map((template) => (
                        <Card
                            key={template.id}
                            onClick={() => handleSelectTemplate(template.id)}
                            className={`relative cursor-pointer overflow-hidden transition-shadow duration-300 hover:shadow-xl group min-w-0 ${selectedTemplateId === template.id
                                ? "ring-2 ring-blue-600 dark:ring-blue-400 shadow-xl shadow-blue-500/20"
                                : "border-gray-200 dark:border-gray-800"
                                }`}
                        >
                            {/* Preview Area — the real compiled template, page 1 */}
                            <div className="relative bg-gray-100 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-3 overflow-hidden">
                                <div className="rounded-md shadow-md ring-1 ring-black/10 overflow-hidden bg-white">
                                    <TemplatePdfPreview
                                        templateId={template.id}
                                        maxPages={1}
                                        compact
                                    />
                                </div>

                                {/* Hover Overlay with Preview Button */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <Button
                                        onClick={(e) => handlePreview(e, template)}
                                        className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all shadow-lg"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Quick Preview
                                    </Button>
                                </div>

                                {/* Badges */}
                                <div className="absolute top-3 left-3 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-md z-10 pointer-events-none">
                                    ATS-Safe
                                </div>
                                {template.isPremium && (
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1 shadow-md z-10 pointer-events-none">
                                        <Crown className="w-3 h-3" />
                                        Premium
                                    </div>
                                )}

                                {/* Selected Check */}
                                {selectedTemplateId === template.id && (
                                    <div className="absolute bottom-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-200 z-10">
                                        <Check className="w-5 h-5 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Template Info — light tint only on this copy block */}
                            <div
                                className={`p-5 relative min-w-0 ${TEMPLATE_INFO_BG[template.id] ?? "bg-slate-50 dark:bg-slate-900/50"}`}
                            >
                                <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                        {template.name}
                                    </h3>
                                    <span className="text-xs px-2.5 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-gray-600 dark:text-gray-400 font-medium border border-gray-200/80 dark:border-gray-700 shrink-0">
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 truncate">
                                    {template.bestFor}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {template.description}
                                </p>

                                {/* Color Dots Preview */}
                                <div className="mt-4 flex gap-1.5">
                                    {template.colors.map((color) => (
                                        <div
                                            key={color.hex}
                                            className={`w-3 h-3 rounded-full ring-1 ring-black/5 ${color.class}`}
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
                        className="px-10 py-7 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed group rounded-2xl"
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
