"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, FileText } from "lucide-react";

import type { PDFDocumentProxy } from "pdfjs-dist";

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

// ponytail: global slot cap, raise if the compiler is dedicated and idle
const MAX_PARALLEL_PREVIEWS = 2;
let activePreviews = 0;
const previewWaiters: Array<() => void> = [];

function acquirePreviewSlot(): Promise<void> {
    if (activePreviews < MAX_PARALLEL_PREVIEWS) {
        activePreviews += 1;
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        previewWaiters.push(() => {
            activePreviews += 1;
            resolve();
        });
    });
}

function releasePreviewSlot(): void {
    activePreviews = Math.max(0, activePreviews - 1);
    const next = previewWaiters.shift();
    if (next) next();
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
        });
    }
    return pdfjsLoader;
}

function fetchPreviewPdf(templateId: string): Promise<ArrayBuffer> {
    const cached = previewBytesCache.get(templateId);
    if (cached) return Promise.resolve(cached);

    const pending = previewInflight.get(templateId);
    if (pending) return pending;

    const task = (async () => {
        await acquirePreviewSlot();
        try {
            const res = await fetch(
                `/api/resume-generator/template-preview?templateId=${encodeURIComponent(templateId)}`
            );
            if (!res.ok) throw new Error(`Preview request failed: ${res.status}`);
            const buffer = await res.arrayBuffer();
            previewBytesCache.set(templateId, buffer);
            return buffer;
        } finally {
            releasePreviewSlot();
        }
    })();

    previewInflight.set(templateId, task);
    return task.finally(() => {
        previewInflight.delete(templateId);
    });
}

/**
 * Renders a template's demo PDF — the actual compiled output of the .tex file —
 * with pdf.js. The selection card and the quick-view modal both use this, so
 * what a user sees while choosing is exactly what generation produces.
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

    const [pages, setPages] = useState<PdfPage[]>([]);

    useEffect(() => {
        onPageCountRef.current = onPageCount;
    }, [onPageCount]);
    const [containerWidth, setContainerWidth] = useState(0);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
    const [inView, setInView] = useState(!compact);

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
        if (!compact) {
            setInView(true);
            return;
        }
        const el = containerRef.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) setInView(true);
            },
            { root: null, rootMargin: "240px 0px", threshold: 0 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [compact]);

    useEffect(() => {
        if (!inView) return;

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
    }, [templateId, maxPages, inView]);

    const paint = useCallback(async () => {
        const doc = pdfDocRef.current;
        if (!doc || pages.length === 0 || containerWidth <= 0) return;

        const dpr = compact ? 1 : Math.min(window.devicePixelRatio || 1, 2);

        for (const meta of pages) {
            const canvas = canvasRefs.current.get(meta.pageNumber);
            if (!canvas) continue;

            const cssWidth = containerWidth * zoom;
            const scale = cssWidth / meta.width;
            const page = await doc.getPage(meta.pageNumber);
            const viewport = page.getViewport({ scale: scale * dpr });

            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.width = "100%";
            canvas.style.height = "auto";
            canvas.style.maxWidth = `${cssWidth}px`;

            const ctx = canvas.getContext("2d");
            if (!ctx) continue;
            await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        }
    }, [pages, containerWidth, zoom, compact]);

    useEffect(() => {
        void paint();
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
