"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { normalizeSearchText } from "@/lib/resume/latex-text-sync";

interface PdfSelectablePreviewProps {
    blob: Blob | null;
    onTextSelect?: (text: string) => void;
    highlightQuery?: string | null;
}

interface PageRender {
    pageNumber: number;
    width: number;
    height: number;
    imageUrl: string;
    textSpans: { text: string; left: number; top: number; fontSize: number }[];
}

const FIT_PADDING_PX = 24;
const MIN_FIT_WIDTH = 280;

/** Scale pdf.js viewport so the page fits the preview pane width. */
function computeFitScale(unscaledPageWidth: number, containerWidth: number): number {
    const available = Math.max(MIN_FIT_WIDTH, containerWidth - FIT_PADDING_PX);
    const scale = available / unscaledPageWidth;
    return Math.min(1.25, Math.max(0.45, scale));
}

export function PdfSelectablePreview({
    blob,
    onTextSelect,
    highlightQuery,
}: PdfSelectablePreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pages, setPages] = useState<PageRender[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fitWidth, setFitWidth] = useState(0);
    const imageUrlsRef = useRef<string[]>([]);
    const renderGenerationRef = useRef(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateWidth = () => {
            setFitWidth(el.clientWidth);
        };

        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const renderPdf = useCallback(async (pdfBlob: Blob, containerWidth: number) => {
        const generation = ++renderGenerationRef.current;
        setLoading(true);
        setError(null);

        imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        imageUrlsRef.current = [];
        setPages([]);

        try {
            const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
            pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/legacy/build/pdf.worker.mjs",
                import.meta.url
            ).toString();

            const buffer = await pdfBlob.arrayBuffer();
            const doc = await pdfjs.getDocument({ data: buffer }).promise;

            const firstPage = await doc.getPage(1);
            const unscaled = firstPage.getViewport({ scale: 1 });
            const scale = computeFitScale(unscaled.width, containerWidth);

            const rendered: PageRender[] = [];

            for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
                if (generation !== renderGenerationRef.current) return;

                const page = pageNum === 1 ? firstPage : await doc.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) continue;

                await page.render({ canvasContext: ctx, viewport, canvas }).promise;

                const blobOut = await new Promise<Blob | null>((resolve) =>
                    canvas.toBlob(resolve, "image/png")
                );
                if (!blobOut) continue;

                const imageUrl = URL.createObjectURL(blobOut);
                imageUrlsRef.current.push(imageUrl);

                const textContent = await page.getTextContent();
                const spans: PageRender["textSpans"] = [];

                for (const item of textContent.items) {
                    if (!("str" in item) || !item.str?.trim()) continue;
                    const tx = pdfjs.Util.transform(viewport.transform, item.transform);
                    const fontSize = Math.hypot(tx[2], tx[3]);
                    spans.push({
                        text: item.str,
                        left: tx[4],
                        top: tx[5] - fontSize,
                        fontSize,
                    });
                }

                rendered.push({
                    pageNumber: pageNum,
                    width: viewport.width,
                    height: viewport.height,
                    imageUrl,
                    textSpans: spans,
                });
            }

            if (generation === renderGenerationRef.current) {
                setPages(rendered);
            }
        } catch (e) {
            console.error("[PdfSelectablePreview]", e);
            if (generation === renderGenerationRef.current) {
                setError("Could not render PDF preview.");
            }
        } finally {
            if (generation === renderGenerationRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!blob) {
            imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
            imageUrlsRef.current = [];
            setPages([]);
            return;
        }
        if (fitWidth < 100) return;
        renderPdf(blob, fitWidth);
    }, [blob, fitWidth, renderPdf]);

    useEffect(() => {
        return () => {
            imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []);

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

    const handleMouseUp = useCallback(() => {
        const selection = window.getSelection();
        const text = normalizeSearchText(selection?.toString() ?? "");
        if (text.length >= 2) {
            onTextSelect?.(text);
        }
    }, [onTextSelect]);

    const highlightLower = normalizeSearchText(highlightQuery ?? "").toLowerCase();
    const highlightWords =
        highlightLower.length >= 2
            ? highlightLower.split(/\s+/).filter((w) => w.length >= 3)
            : [];

    const spanMatchesHighlight = (spanText: string): boolean => {
        if (highlightLower.length < 2) return false;
        const lower = spanText.toLowerCase().trim();
        if (!lower) return false;
        if (lower.includes(highlightLower) || highlightLower.includes(lower)) return true;
        return highlightWords.some((word) => lower.includes(word) || word.includes(lower));
    };

    return (
        <div
            ref={containerRef}
            className="h-full w-full overflow-y-auto flex flex-col items-center gap-4 p-2 select-text"
            onMouseUp={handleMouseUp}
        >
            {!blob ? (
                <div className="flex items-center justify-center flex-1 text-sm text-gray-500">
                    Compile to preview PDF
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-2 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-sm">Rendering PDF…</span>
                </div>
            ) : error ? (
                <div className="flex items-center justify-center flex-1 text-sm text-red-500">
                    {error}
                </div>
            ) : (
                <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 self-start px-1 shrink-0">
                        Select text in the PDF to jump to the matching LaTeX source.
                    </p>
                    {pages.map((page) => (
                        <div
                            key={page.pageNumber}
                            className="relative bg-white shadow-lg rounded-lg overflow-hidden shrink-0 w-full mx-auto"
                            style={{
                                maxWidth: page.width,
                                aspectRatio: `${page.width} / ${page.height}`,
                                containerType: "inline-size",
                            }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={page.imageUrl}
                                alt={`Resume page ${page.pageNumber}`}
                                className="block w-full h-full pointer-events-none object-contain"
                                draggable={false}
                            />
                            <div className="absolute inset-0">
                                {page.textSpans.map((span, i) => {
                                    const isMatch = spanMatchesHighlight(span.text);
                                    const leftPct = (span.left / page.width) * 100;
                                    const topPct = (span.top / page.height) * 100;
                                    const fontSizePct = (span.fontSize / page.width) * 100;
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
                    ))}
                </>
            )}
        </div>
    );
}
