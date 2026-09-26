import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  loadTemplateSource: vi.fn(),
  normalizeAccentHex: vi.fn(),
  buildGeneratePrompt: vi.fn(),
  reserveResumeGeneration: vi.fn(),
  commitResumeGeneration: vi.fn(),
  releaseResumeGenerationReservation: vi.fn(),
  generateAiContent: vi.fn(),
  checkAtsCompliance: vi.fn(),
  stripModelLatexOutput: vi.fn(),
  mergeModelLatexWithTemplate: vi.fn(),
  validateGeneratedResumeOutput: vi.fn(),
  hasPrivateCompilerConfigured: vi.fn(),
  compileLatexWithRepair: vi.fn(),
}));

vi.mock("@/lib/auth/get-user-id", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/upstash-redis", () => ({ hasUpstashRedisConfig: () => false }));
vi.mock("@/lib/api/cors-policy", () => ({
  corsHeadersWebAndExtension: (req: NextRequest) => ({
    "Access-Control-Allow-Origin": req.headers.get("origin") || "https://www.trackmyopt.com",
  }),
}));
vi.mock("@/lib/documents/template-source", () => ({
  loadTemplateSource: mocks.loadTemplateSource,
  normalizeAccentHex: mocks.normalizeAccentHex,
}));
vi.mock("@/lib/ai/prompts/generate", () => ({ buildGeneratePrompt: mocks.buildGeneratePrompt }));
vi.mock("@/lib/usage-limit", () => ({
  reserveResumeGeneration: mocks.reserveResumeGeneration,
  commitResumeGeneration: mocks.commitResumeGeneration,
  releaseResumeGenerationReservation: mocks.releaseResumeGenerationReservation,
}));
vi.mock("@/lib/ai/google-ai", () => ({ generateAiContent: mocks.generateAiContent }));
vi.mock("@/lib/validators/ats-checker", () => ({ checkAtsCompliance: mocks.checkAtsCompliance }));
vi.mock("@/lib/resume/model-latex-output", () => ({
  stripModelLatexOutput: mocks.stripModelLatexOutput,
  mergeModelLatexWithTemplate: mocks.mergeModelLatexWithTemplate,
  validateGeneratedResumeOutput: mocks.validateGeneratedResumeOutput,
}));
vi.mock("@/lib/resume/latex-compiler", () => ({
  hasPrivateCompilerConfigured: mocks.hasPrivateCompilerConfigured,
}));
vi.mock("@/lib/resume/compile-latex-with-repair", () => ({
  compileLatexWithRepair: mocks.compileLatexWithRepair,
}));

const { POST } = await import("./route");

function request(body: Record<string, unknown>, origin?: string) {
  return new NextRequest("https://www.trackmyopt.com/api/resume-generator/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    resumeText: "Candidate experience with Linux administration.",
    jobDescription: "Seeking a technician with Linux administration experience.",
    templateId: "modern",
    ...overrides,
  };
}

describe("POST /api/resume-generator/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue("user-1");
    mocks.loadTemplateSource.mockReturnValue({ tex: "template source" });
    mocks.normalizeAccentHex.mockReturnValue(null);
    mocks.buildGeneratePrompt.mockReturnValue("prompt");
    mocks.reserveResumeGeneration.mockResolvedValue({ allowed: true, reservationId: "reservation-1" });
    mocks.commitResumeGeneration.mockResolvedValue(true);
    mocks.releaseResumeGenerationReservation.mockResolvedValue(true);
    mocks.generateAiContent.mockResolvedValue({ text: "```latex\n\\documentclass{article}\n```" });
    mocks.checkAtsCompliance.mockReturnValue({ passed: true, issues: [] });
    mocks.stripModelLatexOutput.mockImplementation((text: string) =>
      text.replace(/^```(?:latex)?\n?/, "").replace(/\n?```$/, "").trim()
    );
    mocks.mergeModelLatexWithTemplate.mockImplementation((_template: string, latex: string) => latex);
    mocks.validateGeneratedResumeOutput.mockReturnValue({ ok: true, issues: [] });
    mocks.hasPrivateCompilerConfigured.mockReturnValue(false);
  });

  it("requires an authenticated user", async () => {
    mocks.getUserId.mockResolvedValue(null);

    const response = await POST(request(validBody()));

    expect(response.status).toBe(401);
  });

  it("returns the published extension origin on bearer-authenticated requests", async () => {
    const response = await POST(request(validBody(), "chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm"));

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm",
    );
  });

  it("generates a cleaned LaTeX response after reserving usage", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      latex: "\\documentclass{article}",
      atsCheck: { passed: true },
    });
    expect(mocks.reserveResumeGeneration).toHaveBeenCalledWith("user-1", "generate");
    expect(mocks.commitResumeGeneration).toHaveBeenCalledWith("user-1", "reservation-1");
  });

  it("rejects more than 12 focus keywords before reserving usage", async () => {
    const response = await POST(
      request(validBody({ focusKeywords: Array.from({ length: 13 }, (_, index) => `keyword-${index}`) })),
    );

    expect(response.status).toBe(400);
    expect(mocks.reserveResumeGeneration).not.toHaveBeenCalled();
  });

  it("releases a reservation when generation fails", async () => {
    mocks.generateAiContent.mockRejectedValue(new Error("provider unavailable"));

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(mocks.releaseResumeGenerationReservation).toHaveBeenCalledWith("user-1", "reservation-1");
    expect(mocks.commitResumeGeneration).not.toHaveBeenCalled();
  });

  it("returns source without waiting for duplicate server compilation", async () => {
    mocks.hasPrivateCompilerConfigured.mockReturnValue(true);
    const response = await POST(request(validBody()));
    expect(response.status).toBe(200);
    expect(mocks.compileLatexWithRepair).not.toHaveBeenCalled();
  });

  it("releases a reservation when validation fails", async () => {
    mocks.validateGeneratedResumeOutput.mockReturnValue({
      ok: false,
      issues: ["preamble mismatch"],
    });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(mocks.releaseResumeGenerationReservation).toHaveBeenCalledWith("user-1", "reservation-1");
    expect(mocks.commitResumeGeneration).not.toHaveBeenCalled();
  });

  it("releases a reservation when the model returns empty latex", async () => {
    mocks.generateAiContent.mockResolvedValue({ text: "   " });

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(mocks.releaseResumeGenerationReservation).toHaveBeenCalledWith("user-1", "reservation-1");
    expect(mocks.commitResumeGeneration).not.toHaveBeenCalled();
  });
  it("returns a structured timeout and releases credit before responding", async () => {
    vi.useFakeTimers();
    try {
      mocks.generateAiContent.mockImplementationOnce(() => new Promise(() => {}));
      const pending = POST(request(validBody()));
      await vi.advanceTimersByTimeAsync(90_001);
      const response = await pending;
      expect(response.status).toBe(504);
      expect(await response.json()).toMatchObject({ code: "resume_generation_timeout", creditRefunded: true });
      expect(mocks.releaseResumeGenerationReservation).toHaveBeenCalledOnce();
      expect(mocks.commitResumeGeneration).not.toHaveBeenCalled();
      expect(mocks.generateAiContent.mock.calls[0][0].config.abortSignal.aborted).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

});
