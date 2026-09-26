import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PdfSelectablePreview } from "./PdfSelectablePreview";

const { getDocument } = vi.hoisted(() => ({ getDocument: vi.fn() }));
vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
    getDocument, GlobalWorkerOptions: {},
    Util: { transform: (_viewport: unknown, transform: number[]) => transform },
}));

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => { resolve = done; });
    return { promise, resolve };
}

function makePage() {
    return {
        getViewport: ({ scale }: { scale: number }) => ({ width: 612 * scale, height: 792 * scale, transform: [] }),
        render: vi.fn(() => ({ promise: Promise.resolve(), cancel: vi.fn() })),
        getTextContent: vi.fn().mockResolvedValue({ items: [] }),
    };
}

let resize: () => void;
let width: number;
const pdfBlob = () => ({ arrayBuffer: async () => new ArrayBuffer(8) }) as Blob;

beforeEach(() => {
    vi.clearAllMocks();
    width = 600;
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => width);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({} as CanvasRenderingContext2D);
    vi.stubGlobal("ResizeObserver", class {
        constructor(callback: () => void) { resize = callback; }
        observe() {}
        disconnect() {}
    });
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => { callback(0); return 1; });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("PDF preview rendering", () => {
    it("paints page one before text extraction and later pages finish, without reloading on resize", async () => {
        const first = makePage();
        const second = makePage();
        const text = deferred<{ items: unknown[] }>();
        const laterPage = deferred<ReturnType<typeof makePage>>();
        first.getTextContent.mockReturnValue(text.promise);
        const destroy = vi.fn().mockResolvedValue(undefined);
        getDocument.mockReturnValue({
            promise: Promise.resolve({ numPages: 2, getPage: (number: number) => number === 1 ? Promise.resolve(first) : laterPage.promise }),
            destroy,
        });
        const { unmount } = render(<PdfSelectablePreview blob={pdfBlob()} />);
        await waitFor(() => expect(first.render).toHaveBeenCalledTimes(1));
        expect(second.render).not.toHaveBeenCalled();
        expect(screen.queryByText("Rendering preview…")).not.toBeInTheDocument();

        await act(async () => { width = 440; resize(); });
        await waitFor(() => expect(first.render).toHaveBeenCalledTimes(2));
        expect(getDocument).toHaveBeenCalledTimes(1);
        expect(first.getTextContent).toHaveBeenCalledTimes(1);

        await act(async () => { text.resolve({ items: [] }); laterPage.resolve(second); });
        await waitFor(() => expect(second.render).toHaveBeenCalled());
        unmount();
        expect(destroy).toHaveBeenCalledTimes(1);
    });

    it("destroys a pending load on unmount and ignores its late result", async () => {
        const pending = deferred<unknown>();
        const destroy = vi.fn().mockResolvedValue(undefined);
        getDocument.mockReturnValue({ promise: pending.promise, destroy });
        const { unmount } = render(<PdfSelectablePreview blob={pdfBlob()} />);
        await waitFor(() => expect(getDocument).toHaveBeenCalled());
        unmount();
        expect(destroy).toHaveBeenCalledTimes(1);
        const getPage = vi.fn();
        await act(async () => { pending.resolve({ numPages: 1, getPage }); });
        expect(getPage).not.toHaveBeenCalled();
    });
});
