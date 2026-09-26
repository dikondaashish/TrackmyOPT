"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { PdfPreviewLoading } from "./PdfPreviewLoading";
import { collapseSpacedGlyphs, normalizeSearchText } from "@/lib/resume/latex-text-sync";

interface PdfSelectablePreviewProps {
    blob: Blob | null;
    onTextSelect?: (text: string) => void;
    highlightQuery?: string | null;
}

interface TextSpan {
    text: string;
    left: number;
    top: number;
    fontSize: number;
}

interface PageData {
    pageNumber: number;
    displayWidth: number;
    displayHeight: number;
    textSpans: TextSpan[];
}

type PdfDocHandle = {
    numPages: number;
    getPage: (pageNumber: number) => Promise<{
        getViewport: (params: { scale: number }) => { width: number; height: number };
        render: (params: {
            canvasContext: CanvasRenderingContext2D;
            viewport: { width: number; height: number };
            transform?: readonly number[];
            canvas: HTMLCanvasElement;
        }) => { promise: Promise<void>; cancel?: () => void };
        getTextContent: () => Promise<{ items: unknown[] }>;
    }>;
    destroy: () => Promise<void>;
};

type DestroyablePdfDocument = {
    destroy?: () => void | Promise<void>;
};

function isPdfRenderCancellation(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        String(error.name) === "RenderingCancelledException"
    );
}

async function destroyPdfDocument(document: DestroyablePdfDocument | null): Promise<void> {
    try {
        await document?.destroy?.();
    } catch (error) {
        // Switching away from Preview intentionally cancels active PDF.js work.
        if (!isPdfRenderCancellation(error)) {
            console.error("[PdfSelectablePreview] document cleanup failed:", error);
        }
    }
}

const FIT_PADDING_PX = 24;
const MAX_DPR = 2;
const NEAREST_SPAN_PX = 36;

function nearestPdfSpan(
    container: HTMLElement | null,
    x: number,
    y: number
): HTMLElement | null {
    if (!container) return null;
    const spans = container.querySelectorAll<HTMLElement>("[data-pdf-text]");
    let best: HTMLElement | null = null;
    let bestDist = NEAREST_SPAN_PX * NEAREST_SPAN_PX;

    for (const span of spans) {
        const rect = span.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
            return span;
        }
        const dx = x - (rect.left + rect.width / 2);
        const dy = y - (rect.top + rect.height / 2);
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
            bestDist = dist;
            best = span;
        }
    }
    return best;
}

function wordAroundSpan(span: HTMLElement): string {
    const rowTop = span.getBoundingClientRect().top;
    const parent = span.parentElement;
    if (!parent) return (span.dataset.pdfText ?? "").trim();

    const row = Array.from(parent.children).filter((el): el is HTMLElement => {
        if (!(el instanceof HTMLElement) || el.dataset.pdfText == null) return false;
        return Math.abs(el.getBoundingClientRect().top - rowTop) < 4;
    });
    if (row.length === 0) return (span.dataset.pdfText ?? "").trim();

    const joined = row.map((el) => el.dataset.pdfText ?? "").join("");
    const index = row.indexOf(span);
    const offset = row
        .slice(0, Math.max(0, index))
        .reduce((sum, el) => sum + (el.dataset.pdfText?.length ?? 0), 0);

    const word = /[\w+#.-]+/g;
    let match: RegExpExecArray | null;
    while ((match = word.exec(joined))) {
        const start = match.index;
        const end = start + match[0].length;
        if (offset >= start && offset < end) return match[0];
        if (offset === end) return match[0];
    }

    const raw = (span.dataset.pdfText ?? "").trim();
    return raw.length >= 2 ? raw : joined.trim();
}

function getOutputScale(): number {
    if (typeof window === "undefined") return 1;
    return Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
}

/** CSS layout scale — page fits preview pane width. */
function computeFitScale(unscaledPageWidth: number, containerWidth: number): number {
    const available = Math.max(1, containerWidth - FIT_PADDING_PX);
    return available / unscaledPageWidth;
}

function PdfPageView({
    pdfDoc,
    page,
    fitScale,
    spanMatchesHighlight,
}: {
    pdfDoc: PdfDocHandle;
    page: PageData;
    fitScale: number;
    spanMatchesHighlight: (text: string) => boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [paintState, setPaintState] = useState<{ document: PdfDocHandle; scale: number; failed: boolean } | null>(null);
    const settled = paintState?.document === pdfDoc && paintState.scale === fitScale;
    const renderFailed = settled && paintState.failed;
    const rendered = settled && !paintState.failed;

    useEffect(() => {
        let cancelled = false;
        let renderTask: { promise: Promise<void>; cancel?: () => void } | null = null;

        async function paint() {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const pdfPage = await pdfDoc.getPage(page.pageNumber);
            if (cancelled) return;

            const viewport = pdfPage.getViewport({ scale: fitScale });
            const outputScale = getOutputScale();
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            const transform =
                outputScale !== 1
                    ? ([outputScale, 0, 0, outputScale, 0, 0] as const)
                    : undefined;

            renderTask = pdfPage.render({
                canvasContext: ctx,
                viewport,
                transform,
                canvas,
            });
            await renderTask.promise;
            if (!cancelled) setPaintState({ document: pdfDoc, scale: fitScale, failed: false });
        }

        paint().catch((e) => {
            // pdf.js rejects with RenderingCancelledException when cancel() runs.
            if (cancelled) return;
            if (isPdfRenderCancellation(e)) return;
            console.error("[PdfPageView] render failed:", e);
            setPaintState({ document: pdfDoc, scale: fitScale, failed: true });
        });

        return () => {
            cancelled = true;
            try {
                renderTask?.cancel?.();
            } catch {
                /* cancel is best-effort */
            }
        };
    }, [pdfDoc, page.pageNumber, fitScale, page.displayWidth, page.displayHeight]);

    return (
        <div
            className="relative bg-white shadow-lg rounded-lg overflow-hidden shrink-0 mx-auto"
            style={{
                width: page.displayWidth * fitScale,
                height: page.displayHeight * fitScale,
                containerType: "inline-size",
            }}
        >
            <canvas
                ref={canvasRef}
                className="block pointer-events-none"
                aria-hidden
            />
            {!rendered && (
                <div role="status" className="absolute inset-0 flex items-center justify-center gap-2 bg-white text-xs text-gray-500">
                    {renderFailed ? "Could not draw this page. Try refreshing the PDF." : <><Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />Rendering page {page.pageNumber}…</>}
                </div>
            )}
            <div className="absolute inset-0">
                {page.textSpans.map((span, i) => {
                    const isMatch = spanMatchesHighlight(span.text);
                    const leftPct = (span.left / page.displayWidth) * 100;
                    const topPct = (span.top / page.displayHeight) * 100;
                    const fontSizePct = (span.fontSize / page.displayWidth) * 100;
                    return (
                        <span
                            key={`${page.pageNumber}-${i}`}
                            data-pdf-text={span.text}
                            style={{
                                position: "absolute",
                                left: `${leftPct}%`,
                                top: `${topPct}%`,
                                fontSize: `${fontSizePct}cqw`,
                                lineHeight: 1,
                                color: "transparent",
                                whiteSpace: "pre",
                                cursor: "text",
                                userSelect: "text",
                                backgroundColor: isMatch
                                    ? "rgba(59, 130, 246, 0.35)"
                                    : undefined,
                            }}
                        >
                            {span.text}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}

export function PdfSelectablePreview({
    blob,
    onTextSelect,
    highlightQuery,
}: PdfSelectablePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfDoc, setPdfDoc] = useState<PdfDocHandle | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fitWidth, setFitWidth] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let frame = 0;
        const updateWidth = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                // Keep the last visible width when switching to the code view.
                if (el.clientWidth > 0) setFitWidth(Math.round(el.clientWidth));
            });
        };
        updateWidth();
        const observer = new ResizeObserver(updateWidth);
        observer.observe(el);
        return () => {
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        let loadingTask: { destroy: () => Promise<void> } | null = null;
        if (!blob) return;

        async function loadPdf(pdfBlob: Blob) {
            try {
                const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
                if (cancelled) return;
                setError(null);
                setPages([]);
                setPdfDoc(null);
                pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                    "pdfjs-dist/legacy/build/pdf.worker.mjs",
                    import.meta.url
                ).toString();

                const buffer = await pdfBlob.arrayBuffer();
                if (cancelled) return;
                const task = pdfjs.getDocument({ data: buffer });
                loadingTask = task;
                const doc = await task.promise;
                if (cancelled) return;
                setPdfDoc(doc as unknown as PdfDocHandle);

                await Promise.all(Array.from({ length: doc.numPages }, async (_, index) => {
                    const pageNumber = index + 1;
                    const pdfPage = await doc.getPage(pageNumber);
                    if (cancelled) return;
                    // Geometry stays at scale 1. Resizing only repaints the canvas;
                    // it never reloads the document or extracts its text again.
                    const viewport = pdfPage.getViewport({ scale: 1 });
                    const page: PageData = {
                        pageNumber,
                        displayWidth: viewport.width,
                        displayHeight: viewport.height,
                        textSpans: [],
                    };
                    setPages((current) => [...current, page].sort((a, b) => a.pageNumber - b.pageNumber));

                    // Painting can start before text selection or other pages are ready.
                    try {
                        const textContent = await pdfPage.getTextContent();
                        if (cancelled) return;
                        const textSpans: TextSpan[] = [];
                        for (const item of textContent.items) {
                            if (!("str" in item) || !item.str?.trim()) continue;
                            const tx = pdfjs.Util.transform(viewport.transform, item.transform);
                            const fontSize = Math.hypot(tx[2], tx[3]);
                            textSpans.push({ text: item.str, left: tx[4], top: tx[5] - fontSize, fontSize });
                        }
                        setPages((current) => current.map((entry) => entry.pageNumber === pageNumber ? { ...entry, textSpans } : entry));
                    } catch (error) {
                        if (!cancelled) console.error("[PdfSelectablePreview] text layer failed:", error);
                    }
                }));
            } catch (error) {
                if (cancelled || isPdfRenderCancellation(error)) return;
                console.error("[PdfSelectablePreview]", error);
                setError("Could not render PDF preview. Try Refresh PDF.");
            }
        }

        void loadPdf(blob);
        return () => {
            cancelled = true;
            // Also terminates a pending document load, not just completed documents.
            void destroyPdfDocument(loadingTask);
        };
    }, [blob]);

    useEffect(() => {
        const query = normalizeSearchText(highlightQuery ?? "");
        if (query.length < 2) return;

        const container = containerRef.current;
        if (!container) return;

        const lowerQuery = query.toLowerCase();
        const spans = container.querySelectorAll<HTMLElement>("[data-pdf-text]");
        for (const span of spans) {
            const text = span.dataset.pdfText?.toLowerCase() ?? "";
            if (text.includes(lowerQuery) || lowerQuery.includes(text.trim())) {
                span.scrollIntoView({ behavior: "smooth", block: "center" });
                break;
            }
        }
    }, [highlightQuery, pages]);

    const handleMouseUp = useCallback(
        (event: React.MouseEvent<HTMLDivElement>) => {
            const selected = collapseSpacedGlyphs(window.getSelection()?.toString() ?? "");
            if (selected.length >= 2) {
                onTextSelect?.(selected);
                return;
            }

            const span = nearestPdfSpan(containerRef.current, event.clientX, event.clientY);
            if (!span) return;
            const word = collapseSpacedGlyphs(wordAroundSpan(span));
            if (word.length >= 2) onTextSelect?.(word);
        },
        [onTextSelect]
    );

    const highlightLower = normalizeSearchText(highlightQuery ?? "").toLowerCase();
    const highlightWords = useMemo(
        () =>
            highlightLower.length >= 2
                ? highlightLower.split(/\s+/).filter((word) => word.length >= 3)
                : [],
        [highlightLower]
    );

    const spanMatchesHighlight = useCallback(
        (spanText: string): boolean => {
            if (highlightLower.length < 2) return false;
            const lower = spanText.toLowerCase().trim();
            if (!lower) return false;
            if (lower.includes(highlightLower) || highlightLower.includes(lower)) return true;
            return highlightWords.some((word) => lower.includes(word) || word.includes(lower));
        },
        [highlightLower, highlightWords]
    );

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto flex flex-col items-center gap-4 p-2 select-text cursor-text"
            onMouseUp={handleMouseUp}
        >
            {!blob ? (
                <div className="flex items-center justify-center flex-1 text-sm text-gray-500">
                    Compile to preview PDF
                </div>
            ) : pages.length === 0 && !error ? (
                <PdfPreviewLoading label="Rendering preview…" />
            ) : error && pages.length === 0 ? (
                <div className="flex items-center justify-center flex-1 text-sm text-red-500">
                    {error}
                </div>
            ) : pages.length > 0 && pdfDoc ? (
                <>
                    {error && <p role="alert" className="text-xs text-red-500">{error}</p>}
                    <p className="text-xs text-gray-500 dark:text-gray-400 self-start px-1 shrink-0">
                        Select text in the PDF to jump to the matching LaTeX source.
                    </p>
                    {pages.map((page) => (
                        <PdfPageView
                            key={page.pageNumber}
                            pdfDoc={pdfDoc}
                            page={page}
                            fitScale={computeFitScale(page.displayWidth, fitWidth || page.displayWidth + FIT_PADDING_PX)}
                            spanMatchesHighlight={spanMatchesHighlight}
                        />
                    ))}
                </>
            ) : null}
        </div>
    );
}
