"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { normalizeSearchText } from "@/lib/resume/latex-text-sync";

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

const FIT_PADDING_PX = 24;
const MIN_FIT_WIDTH = 280;
const MAX_DPR = 3;

function getOutputScale(): number {
    if (typeof window === "undefined") return 1;
    return Math.min(MAX_DPR, Math.max(1, window.devicePixelRatio || 1));
}

/** CSS layout scale — page fits preview pane width. */
function computeFitScale(unscaledPageWidth: number, containerWidth: number): number {
    const available = Math.max(MIN_FIT_WIDTH, containerWidth - FIT_PADDING_PX);
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
        }

        paint().catch((e) => {
            // pdf.js rejects with RenderingCancelledException when cancel() runs.
            if (cancelled) return;
            const name = e && typeof e === "object" && "name" in e ? String(e.name) : "";
            if (name === "RenderingCancelledException") return;
            console.error("[PdfPageView] render failed:", e);
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
                width: page.displayWidth,
                height: page.displayHeight,
                containerType: "inline-size",
            }}
        >
            <canvas
                ref={canvasRef}
                className="block pointer-events-none"
                aria-hidden
            />
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
    const pdfDocRef = useRef<PdfDocHandle | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [fitScale, setFitScale] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fitWidth, setFitWidth] = useState(0);
    const loadGenerationRef = useRef(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateWidth = () => setFitWidth(el.clientWidth);
        updateWidth();
        const ro = new ResizeObserver(updateWidth);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const loadPdf = useCallback(async (pdfBlob: Blob, containerWidth: number) => {
        const generation = ++loadGenerationRef.current;
        setLoading(true);
        setError(null);
        setPages([]);
        if (pdfDocRef.current) {
            void pdfDocRef.current.destroy();
            pdfDocRef.current = null;
        }

        try {
            const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
            pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/legacy/build/pdf.worker.mjs",
                import.meta.url
            ).toString();

            const buffer = await pdfBlob.arrayBuffer();
            const doc = await pdfjs.getDocument({ data: buffer }).promise;

            if (generation !== loadGenerationRef.current) {
                await doc.destroy();
                return;
            }

            const firstPage = await doc.getPage(1);
            const unscaled = firstPage.getViewport({ scale: 1 });
            const scale = computeFitScale(unscaled.width, containerWidth);
            const pageList: PageData[] = [];

            for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
                if (generation !== loadGenerationRef.current) return;

                const pdfPage = pageNum === 1 ? firstPage : await doc.getPage(pageNum);
                const viewport = pdfPage.getViewport({ scale });
                const textContent = await pdfPage.getTextContent();
                const spans: TextSpan[] = [];

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

                pageList.push({
                    pageNumber: pageNum,
                    displayWidth: viewport.width,
                    displayHeight: viewport.height,
                    textSpans: spans,
                });
            }

            if (generation === loadGenerationRef.current) {
                setFitScale(scale);
                pdfDocRef.current = doc as unknown as PdfDocHandle;
                setPages(pageList);
            } else {
                await doc.destroy();
            }
        } catch (e) {
            console.error("[PdfSelectablePreview]", e);
            if (generation === loadGenerationRef.current) {
                setError("Could not render PDF preview.");
            }
        } finally {
            if (generation === loadGenerationRef.current) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!blob) {
            setPages([]);
            if (pdfDocRef.current) {
                void pdfDocRef.current.destroy();
                pdfDocRef.current = null;
            }
            return;
        }
        if (fitWidth < 100) return;
        loadPdf(blob, fitWidth);
    }, [blob, fitWidth, loadPdf]);

    useEffect(() => {
        return () => {
            void pdfDocRef.current?.destroy();
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
            ) : pages.length > 0 && pdfDocRef.current ? (
                <>
                    <p className="text-xs text-gray-500 dark:text-gray-400 self-start px-1 shrink-0">
                        Select text in the PDF to jump to the matching LaTeX source.
                    </p>
                    {pages.map((page) => (
                        <PdfPageView
                            key={page.pageNumber}
                            pdfDoc={pdfDocRef.current!}
                            page={page}
                            fitScale={fitScale}
                            spanMatchesHighlight={spanMatchesHighlight}
                        />
                    ))}
                </>
            ) : null}
        </div>
    );
}
