"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, FileText } from "lucide-react";

import previewAssets from "@/lib/documents/template-preview-assets.json";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

type PdfPage = { pageNumber: number; width: number; height: number };

async function destroyPdfDocument(document: PDFDocumentProxy | null): Promise<void> {
    const destroy = (document as (PDFDocumentProxy & {
        destroy?: () => void | Promise<void>;
    }) | null)?.destroy;
    if (destroy) await destroy.call(document);
}

interface TemplatePdfPreviewProps {
    templateId: string;
    /** Render at most this many pages (thumbnails only need page 1). */
    maxPages?: number;
    /** Multiplier applied on top of fit-to-container width. */
    zoom?: number;
    /** Rendered inside a card thumbnail — suppresses page chrome. */
    compact?: boolean;
    onPageCount?: (count: number) => void;
}

const previewBytesCache = new Map<string, ArrayBuffer>();
const previewInflight = new Map<string, Promise<ArrayBuffer>>();

/** pdf.js transfers `data` to its worker and detaches it — never hand out the cached original. */
function copyArrayBuffer(buffer: ArrayBuffer): ArrayBuffer {
    return buffer.slice(0);
}

/** Minimum canvas pixel width — card thumbs ~2K, modal/quick view ~4K. */
const PREVIEW_TARGET_PX = { compact: 2048, full: 3840 } as const;
/** Max supersample factor per mode — full view targets ~3840px canvas width. */
const MAX_RENDER_DPR = { compact: 6, full: 4 } as const;

function previewRenderDpr(
    cssPixelWidth: number,
    pdfPageWidth: number,
    compact: boolean,
): number {
    const baseScale = cssPixelWidth / pdfPageWidth;
    if (baseScale <= 0) return 1;
    const target = compact ? PREVIEW_TARGET_PX.compact : PREVIEW_TARGET_PX.full;
    const neededDpr = target / (pdfPageWidth * baseScale);
    const maxDpr = compact ? MAX_RENDER_DPR.compact : MAX_RENDER_DPR.full;
    return Math.max(1, Math.min(neededDpr, maxDpr));
}

let pdfjsLoader: Promise<typeof import("pdfjs-dist/legacy/build/pdf.mjs")> | null = null;

function loadPdfjs() {
    if (!pdfjsLoader) {
        pdfjsLoader = import("pdfjs-dist/legacy/build/pdf.mjs").then((pdfjs) => {
            pdfjs.GlobalWorkerOptions.workerSrc = new URL(
                "pdfjs-dist/legacy/build/pdf.worker.mjs",
                import.meta.url
            ).toString();
            return pdfjs;
        }).catch((error) => {
            pdfjsLoader = null;
            throw error;
        });
    }
    return pdfjsLoader;
}

function fetchPreviewPdf(templateId: string): Promise<ArrayBuffer> {
    const cached = previewBytesCache.get(templateId);
    if (cached) return Promise.resolve(copyArrayBuffer(cached));

    const pending = previewInflight.get(templateId);
    if (pending) return pending.then(copyArrayBuffer);

    const task = (async () => {
        const res = await fetch(
            (previewAssets as Record<string, { pdf: string }>)[templateId].pdf,
            { signal: AbortSignal.timeout(20_000) }
        );
        if (!res.ok) throw new Error(`Preview request failed: ${res.status}`);
        const buffer = await res.arrayBuffer();
        previewBytesCache.set(templateId, buffer);
        return buffer;
    })();

    const shared = task.then(copyArrayBuffer);
    previewInflight.set(templateId, shared);
    return shared.finally(() => {
        previewInflight.delete(templateId);
    });
}

/**
 * Renders a template's demo PDF — the actual compiled output of the .tex file —
 * with pdf.js only when Quick Preview opens. Cards use static WebP thumbnails.
 */
export function TemplatePdfPreview({
    templateId,
    maxPages,
    zoom = 1,
    compact = false,
    onPageCount,
}: TemplatePdfPreviewProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
    const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
    const generationRef = useRef(0);
    const onPageCountRef = useRef(onPageCount);

    const [attempt, setAttempt] = useState(0);
    const renderTasks = useRef<RenderTask[]>([]);
    const [pages, setPages] = useState<PdfPage[]>([]);

    useEffect(() => {
        onPageCountRef.current = onPageCount;
    }, [onPageCount]);
    const [containerWidth, setContainerWidth] = useState(0);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width ?? 0;
            if (w > 0) setContainerWidth(w);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const generation = ++generationRef.current;

        (async () => {
            setStatus("loading");
            setPages([]);

            try {
                const buffer = await fetchPreviewPdf(templateId);
                if (cancelled || generation !== generationRef.current) return;

                const pdfjs = await loadPdfjs();
                if (cancelled || generation !== generationRef.current) return;

                const doc = await pdfjs.getDocument({ data: buffer }).promise;
                if (cancelled || generation !== generationRef.current) {
                    await destroyPdfDocument(doc);
                    return;
                }

                void destroyPdfDocument(pdfDocRef.current);
                pdfDocRef.current = doc;

                onPageCountRef.current?.(doc.numPages);

                const limit = Math.min(doc.numPages, maxPages ?? doc.numPages);
                const list: PdfPage[] = [];
                for (let n = 1; n <= limit; n++) {
                    const page = await doc.getPage(n);
                    const vp = page.getViewport({ scale: 1 });
                    list.push({ pageNumber: n, width: vp.width, height: vp.height });
                }

                if (cancelled || generation !== generationRef.current) return;
                setPages(list);
                setStatus("ready");
            } catch (err) {
                if (!cancelled && generation === generationRef.current) {
                    console.error("[TemplatePdfPreview]", err);
                    setStatus("error");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [templateId, maxPages, attempt]);

    const paint = useCallback(async (isCancelled: () => boolean) => {
        const doc = pdfDocRef.current;
        if (!doc || pages.length === 0 || containerWidth <= 0) return;

        const cssWidth = containerWidth * zoom;

        for (const meta of pages) {
            const canvas = canvasRefs.current.get(meta.pageNumber);
            if (!canvas) continue;

            const scale = cssWidth / meta.width;
            const dpr = previewRenderDpr(cssWidth, meta.width, compact);
            const page = await doc.getPage(meta.pageNumber);
            if (isCancelled()) return;
            const viewport = page.getViewport({ scale: scale * dpr });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.style.maxWidth = `${cssWidth}px`;

            const ctx = canvas.getContext("2d", { alpha: false });
            if (!ctx) continue;
            const task = page.render({ canvasContext: ctx, viewport, canvas });
            renderTasks.current.push(task);
            await task.promise;
        }
    }, [pages, containerWidth, zoom, compact]);

    useEffect(() => {
        let cancelled = false;
        void paint(() => cancelled).catch((error) => {
            if (!cancelled) {
                console.error("[TemplatePdfPreview] render", error);
                setStatus("error");
            }
        });
        return () => {
            cancelled = true;
            renderTasks.current.forEach((task) => task.cancel());
            renderTasks.current = [];
        };
    }, [paint]);

    useEffect(() => {
        return () => {
            if (pdfDocRef.current) {
                void destroyPdfDocument(pdfDocRef.current);
                pdfDocRef.current = null;
            }
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full">
            {status === "loading" && (
                <div
                    className={`w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800 ${compact ? "aspect-[8.5/11]" : "aspect-[8.5/11] max-w-[850px] mx-auto"}`}
                    aria-label="Loading template preview"
                />
            )}

            {status === "error" && (
                <div
                    className={`w-full flex flex-col items-center justify-center gap-2 rounded border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 ${compact ? "aspect-[8.5/11] p-3" : "aspect-[8.5/11] max-w-[850px] mx-auto p-6"}`}
                >
                    {compact ? (
                        <FileText className="w-6 h-6" />
                    ) : (
                        <AlertCircle className="w-8 h-8" />
                    )}
                    <p className={compact ? "text-[10px] text-center leading-tight" : "text-sm text-center"}>
                        Preview unavailable
                    </p>
                    <button type="button" className="text-sm underline" onClick={() => { previewBytesCache.delete(templateId); setAttempt((value) => value + 1); }}>Retry preview</button>
                </div>
            )}

            <div className={status === "ready" ? "flex flex-col items-center gap-6" : "hidden"}>
                {pages.map((p) => (
                    <div key={p.pageNumber} className="relative">
                        <canvas
                            ref={(el) => {
                                if (el) canvasRefs.current.set(p.pageNumber, el);
                                else canvasRefs.current.delete(p.pageNumber);
                            }}
                            className={
                                compact
                                    ? "block bg-white"
                                    : "block bg-white shadow-xl ring-1 ring-black/10"
                            }
                        />
                        {!compact && pages.length > 1 && (
                            <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-gray-500 dark:text-gray-400">
                                Page {p.pageNumber} of {pages.length}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
