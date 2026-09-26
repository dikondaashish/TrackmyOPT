import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useResumeStore } from "@/store/resume-store";
import { useResumeEditorActions } from "./useResumeEditorActions";

const mocks = vi.hoisted(() => ({ toast: vi.fn(), download: vi.fn(), parse: vi.fn() }));
vi.mock("@/hooks/useToast", () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock("@/lib/browser-download", () => ({ triggerUrlDownload: mocks.download }));
vi.mock("@/lib/resume/pdf-text-extract-client", () => ({ extractPdfTextFromBlob: mocks.parse }));
vi.mock("@/lib/supabase/client", () => ({ supabase: { auth: { getUser: async () => ({ data: { user: null } }) } } }));
vi.mock("@/lib/posthog-client", () => ({ captureClientEvent: vi.fn(), captureUpgradePromptShown: vi.fn() }));
vi.mock("@/lib/posthog/nps-survey", () => ({ requestNpsSurvey: vi.fn() }));

function deferred<T>() {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((done) => { resolve = done; });
    return { promise, resolve };
}
const json = (data: unknown, status = 200) => ({ ok: status < 400, status, json: async () => data }) as Response;
const pdf = (blob: Blob) => ({ ok: true, status: 200, blob: async () => blob }) as Response;
const updateText = (latex: string) => useResumeStore.getState().setGeneratedLatex(latex);
const renderActions = () => renderHook(() => useResumeEditorActions({ updateText, npsPlanTier: "free" }));

beforeEach(() => {
    vi.clearAllMocks();
    useResumeStore.getState().reset();
    useResumeStore.getState().setJobDescription("Software engineering role");
    mocks.parse.mockResolvedValue({ ok: true });
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:resume-preview");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("resume editor pipeline", () => {
    it("keeps a successful preview when ATS analysis fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        const blob = new Blob(["pdf"]);
        vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(pdf(blob)).mockResolvedValueOnce(json({ error: "Scan unavailable" }, 500)));
        const { result } = renderActions();
        act(() => { updateText("Resume source"); });
        await act(async () => { await result.current.compilePdf("Resume source"); });
        await waitFor(() => expect(result.current.isScanning).toBe(false));
        expect(result.current.compiledPdfBlob).toBe(blob);
        expect(result.current.compileFailed).toBe(false);
        expect(result.current.isCompiling).toBe(false);
    });

    it("publishes source before compilation and PDF before ATS checks finish", async () => {
        const generation = deferred<Response>();
        const compilation = deferred<Response>();
        const scan = deferred<Response>();
        vi.stubGlobal("fetch", vi.fn((url: string) => {
            if (url.endsWith("/generate")) return generation.promise;
            if (url.endsWith("/compile")) return compilation.promise;
            if (url.endsWith("/scan")) return scan.promise;
            throw new Error(`Unexpected request: ${url}`);
        }));
        const { result } = renderActions();
        let done!: Promise<void>;
        act(() => { done = result.current.generateResume("Resume", "Job", "modern"); });
        expect(result.current.isGenerating).toBe(true);
        await act(async () => { generation.resolve(json({ latex: "Complete source" })); });
        expect(result.current.generatedLatex).toBe("Complete source");
        expect(result.current.isGenerating).toBe(false);
        expect(result.current.isCompiling).toBe(true);
        const blob = new Blob(["pdf"]);
        await act(async () => { compilation.resolve(pdf(blob)); await done; });
        expect(result.current.compiledPdfBlob).toBe(blob);
        expect(result.current.isCompiling).toBe(false);
        expect(result.current.isScanning).toBe(true);
        await act(async () => { scan.resolve(json({ score: 95, passed: true })); });
        await waitFor(() => expect(result.current.isScanning).toBe(false));
        expect(result.current.compileFailed).toBe(false);
    });

    it("ignores an obsolete compile error instead of fixing over newer source", async () => {
        const older = deferred<Response>();
        const newer = deferred<Response>();
        const fetchMock = vi.fn().mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);
        vi.stubGlobal("fetch", fetchMock);
        const { result } = renderActions();
        act(() => { updateText("Old source"); });
        let first!: Promise<void>;
        act(() => { first = result.current.compilePdf("Old source"); });
        act(() => { updateText("New source"); });
        let second!: Promise<void>;
        act(() => { second = result.current.compilePdf("New source"); });
        await act(async () => { older.resolve(json({ error: "Syntax error" }, 400)); await first; });
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result.current.generatedLatex).toBe("New source");
        expect(result.current.isCompiling).toBe(true);
        // A compiler outage must not spend an AI repair request either.
        vi.spyOn(console, "error").mockImplementation(() => {});
        await act(async () => { newer.resolve(json({ error: "Unavailable" }, 503)); await second; });
        expect(result.current.compileFailed).toBe(true);
        expect(result.current.isCompiling).toBe(false);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("discards ATS results after the source changes and recompiles edits before downloading", async () => {
        const scan = deferred<Response>();
        const nextCompile = deferred<Response>();
        const fetchMock = vi.fn().mockResolvedValueOnce(pdf(new Blob(["pdf"]))).mockReturnValueOnce(scan.promise).mockReturnValueOnce(nextCompile.promise);
        vi.stubGlobal("fetch", fetchMock);
        const { result, unmount } = renderActions();
        act(() => { updateText("Original source"); });
        await act(async () => { await result.current.compilePdf("Original source"); });
        act(() => { updateText("Edited source"); });
        await act(async () => { scan.resolve(json({ score: 30, keywordMatch: { missing: ["SQL"] } })); });
        expect(result.current.atsAnalysis).toBeNull();
        expect(result.current.isPdfStale).toBe(true);
        act(() => { result.current.handleDownload(); });
        expect(mocks.download).not.toHaveBeenCalled();
        expect(fetchMock).toHaveBeenLastCalledWith("/api/resume-generator/compile", expect.objectContaining({ body: JSON.stringify({ latexCode: "Edited source" }) }));
        unmount();
        await act(async () => { nextCompile.resolve(pdf(new Blob(["new pdf"]))); });
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    });
});
