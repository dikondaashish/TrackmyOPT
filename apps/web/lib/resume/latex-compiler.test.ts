import { beforeEach, describe, expect, it, vi } from "vitest";

const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]).buffer;

describe("compileLatex", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("sends the private compiler bearer token when configured", async () => {
    vi.stubEnv("LATEX_COMPILER_URL", "https://api.trackmyopt.com/builds/sync");
    vi.stubEnv("LATEX_COMPILER_TOKEN", "test-compiler-token-123456");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(pdfBytes, { status: 200, headers: { "Content-Type": "application/pdf" } })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { compileLatex } = await import("./latex-compiler");
    const result = await compileLatex("\\documentclass{article}\\begin{document}Hi\\end{document}");

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      Authorization: "Bearer test-compiler-token-123456",
      "Content-Type": "application/json",
    });
  });

  it("does not call public compilers when a private compiler URL is set", async () => {
    vi.stubEnv("LATEX_COMPILER_URL", "https://api.trackmyopt.com/builds/sync");
    vi.stubEnv("LATEX_COMPILER_TOKEN", "test-compiler-token-123456");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("unauthorized", { status: 401 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { compileLatex } = await import("./latex-compiler");
    const result = await compileLatex("\\documentclass{article}");

    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain("api.trackmyopt.com");
  });

  it("falls back to public compilers when publicFallback is enabled", async () => {
    vi.stubEnv("LATEX_COMPILER_URL", "https://api.trackmyopt.com/builds/sync");
    vi.stubEnv("LATEX_COMPILER_TOKEN", "test-compiler-token-123456");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("unavailable", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(pdfBytes, { status: 200, headers: { "Content-Type": "application/pdf" } })
      );
    vi.stubGlobal("fetch", fetchMock);

    const { compileLatex } = await import("./latex-compiler");
    const result = await compileLatex("\\documentclass{article}", { publicFallback: true });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain("api.trackmyopt.com");
    expect(String(fetchMock.mock.calls[1][0])).toContain("latex.ytotech.com");
  });

  it("does not fall back to public compilers on LaTeX errors", async () => {
    vi.stubEnv("LATEX_COMPILER_URL", "https://api.trackmyopt.com/builds/sync");
    vi.stubEnv("LATEX_COMPILER_TOKEN", "test-compiler-token-123456");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("! Undefined control sequence", { status: 422 })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { compileLatex } = await import("./latex-compiler");
    const result = await compileLatex("\\documentclass{article}", { publicFallback: true });

    expect(result.ok).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toContain("api.trackmyopt.com");
  });

  it("classifies transport failures separately from LaTeX errors", async () => {
    const { isCompilerTransportError } = await import("./latex-compiler");
    expect(isCompilerTransportError("Private (TrackMyOPT API) (401): unauthorized")).toBe(true);
    expect(isCompilerTransportError("Private (TrackMyOPT API) (422): ! Font T1/phv")).toBe(false);
  });
});
