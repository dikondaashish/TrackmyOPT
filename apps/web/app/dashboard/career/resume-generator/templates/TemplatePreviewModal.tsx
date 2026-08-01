"use client";

import { useCallback, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Check,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    ShieldCheck,
    FileText,
    Type,
} from "lucide-react";
import {
    Template,
    TemplateColor,
    RESUME_TEMPLATE_SECTION_ORDER,
} from "@/lib/documents/templates";
import { TemplatePdfPreview } from "./TemplatePdfPreview";

interface TemplatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onSelect: (templateId: string, color: TemplateColor) => void;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.6;

export function TemplatePreviewModal({
    isOpen,
    onClose,
    template,
    onSelect,
}: TemplatePreviewModalProps) {
    if (!template) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            {/* Keyed on the template id so zoom/colour/page state resets on switch
                without a synchronous setState in an effect. */}
            <TemplatePreviewBody
                key={template.id}
                template={template}
                onClose={onClose}
                onSelect={onSelect}
            />
        </Dialog>
    );
}

function TemplatePreviewBody({
    template,
    onClose,
    onSelect,
}: {
    template: Template;
    onClose: () => void;
    onSelect: (templateId: string, color: TemplateColor) => void;
}) {
    const [selectedColor, setSelectedColor] = useState<TemplateColor>(template.colors[0]);
    const [zoom, setZoom] = useState(1);
    const [pageCount, setPageCount] = useState<number | null>(null);

    const handlePageCount = useCallback((count: number) => setPageCount(count), []);

    const currentColor = selectedColor;

    return (
        <DialogContent className="max-w-6xl w-[96vw] h-[92vh] p-0 gap-0 flex flex-col overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <div className="flex items-start justify-between gap-4 pr-8">
                        <div className="min-w-0">
                            <DialogTitle className="text-xl font-bold truncate">
                                {template.name}
                            </DialogTitle>
                            <DialogDescription className="mt-0.5 text-sm">
                                {template.bestFor}
                            </DialogDescription>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Zoom out"
                                disabled={zoom <= MIN_ZOOM}
                                onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z - 0.15).toFixed(2)))}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <span className="text-xs tabular-nums text-gray-500 dark:text-gray-400 w-10 text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                aria-label="Zoom in"
                                disabled={zoom >= MAX_ZOOM}
                                onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z + 0.15).toFixed(2)))}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
                    {/* Document preview — the actual compiled PDF */}
                    <div className="flex-1 min-h-0 overflow-auto bg-gray-100 dark:bg-gray-950 p-6">
                        <div className="mx-auto" style={{ maxWidth: 850 }}>
                            <TemplatePdfPreview
                                templateId={template.id}
                                zoom={zoom}
                                onPageCount={handlePageCount}
                            />
                        </div>
                    </div>

                    {/* Details rail */}
                    <aside className="lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto">
                        <div className="p-5 space-y-5">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {template.description}
                            </p>

                            <div className="flex items-start gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3">
                                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-green-800 dark:text-green-200">
                                    Single column, no tables or graphics — parses cleanly in Workday,
                                    Greenhouse, and Taleo.
                                </p>
                            </div>

                            <dl className="space-y-2.5 text-sm">
                                <div className="flex items-start gap-2">
                                    <Type className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="sr-only">Typeface</dt>
                                        <dd className="text-gray-700 dark:text-gray-300">
                                            {template.typeface}
                                        </dd>
                                        <dd className="text-xs text-gray-500 dark:text-gray-400">
                                            {template.typography}
                                        </dd>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div>
                                        <dt className="sr-only">Length</dt>
                                        <dd className="text-gray-700 dark:text-gray-300">
                                            {pageCount ? `${pageCount} page${pageCount > 1 ? "s" : ""} in this sample` : "Sizing to sample…"}
                                        </dd>
                                        <dd className="text-xs text-gray-500 dark:text-gray-400">
                                            Length is set by how much you actually have — every role,
                                            internship, and project you list is kept. This sample&apos;s
                                            length means nothing for your resume.
                                        </dd>
                                    </div>
                                </div>
                            </dl>

                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                                    Section order
                                </h4>
                                <ol className="space-y-1">
                                    {RESUME_TEMPLATE_SECTION_ORDER.map((section, i) => (
                                        <li
                                            key={section}
                                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                                        >
                                            <span className="w-4 text-xs text-gray-400 tabular-nums">
                                                {i + 1}
                                            </span>
                                            {section}
                                        </li>
                                    ))}
                                    {template.id === "academic" && (
                                        <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                            <span className="w-4 text-xs text-gray-400 tabular-nums">+</span>
                                            Publications
                                        </li>
                                    )}
                                </ol>
                            </div>

                            {template.colors.length > 1 && (
                                <div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                                        Accent colour
                                    </h4>
                                    <div className="flex gap-2">
                                        {template.colors.map((color) => (
                                            <button
                                                key={color.hex}
                                                type="button"
                                                title={color.name}
                                                aria-label={color.name}
                                                aria-pressed={currentColor?.hex === color.hex}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-7 h-7 rounded-full ${color.class} transition-transform hover:scale-110 ${
                                                    currentColor?.hex === color.hex
                                                        ? `ring-2 ring-offset-2 dark:ring-offset-gray-900 ${color.ring}`
                                                        : ""
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-1.5">
                                {template.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="px-5 py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 flex items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                        This preview is the template compiled by the same engine that builds your final PDF.
                    </p>
                    <div className="flex items-center gap-2 ml-auto">
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            onClick={() => currentColor && onSelect(template.id, currentColor)}
                            className="font-semibold"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Use this template
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>
        </DialogContent>
    );
}
