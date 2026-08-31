import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  rateLimitCheck: vi.fn(),
  loadTemplateSource: vi.fn(),
  normalizeAccentHex: vi.fn(),
  buildRegeneratePrompt: vi.fn(),
  reserveResumeGeneration: vi.fn(),
  releaseResumeGenerationReservation: vi.fn(),
  generateAiContent: vi.fn(),
  checkAtsCompliance: vi.fn(),
}));

vi.mock("@/lib/auth/get-user-id", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/auth/rate-limit", () => ({
  default: () => ({ check: mocks.rateLimitCheck }),
}));
vi.mock("@/lib/documents/template-source", () => ({
  loadTemplateSource: mocks.loadTemplateSource,
  normalizeAccentHex: mocks.normalizeAccentHex,
}));
vi.mock("@/lib/ai/prompts/regenerate", () => ({
  buildRegeneratePrompt: mocks.buildRegeneratePrompt,
}));
vi.mock("@/lib/usage-limit", () => ({
  reserveResumeGeneration: mocks.reserveResumeGeneration,
  releaseResumeGenerationReservation: mocks.releaseResumeGenerationReservation,
}));
vi.mock("@/lib/ai/google-ai", () => ({ generateAiContent: mocks.generateAiContent }));
vi.mock("@/lib/validators/ats-checker", () => ({ checkAtsCompliance: mocks.checkAtsCompliance }));

const { POST } = await import("./route");

function request(body: Record<string, unknown>) {
  return new NextRequest("https://www.trackmyopt.com/api/resume-generator/regenerate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer extension-token" },
    body: JSON.stringify(body),
  });
}

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    resumeText: "Candidate experience with Linux administration.",
    jobDescription: "Seeking a technician with Linux administration experience.",
    templateId: "modern",
    previousLatex: "\\documentclass{article}\\begin{document}Resume\\end{document}",
    userFeedback: "Improve supported keyword placement.",
    ...overrides,
  };
}

describe("POST /api/resume-generator/regenerate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue("user-1");
    mocks.rateLimitCheck.mockResolvedValue({ isRateLimited: false, unavailable: false });
    mocks.loadTemplateSource.mockReturnValue({ tex: "template source" });
    mocks.normalizeAccentHex.mockReturnValue(null);
    mocks.buildRegeneratePrompt.mockReturnValue("prompt");
    mocks.reserveResumeGeneration.mockResolvedValue({ allowed: true, reservationId: "reservation-1" });
    mocks.generateAiContent.mockResolvedValue({ text: "```latex\n\\documentclass{article}\n```" });
    mocks.checkAtsCompliance.mockReturnValue({ passed: true, issues: [] });
  });

  it("accepts the extension authentication path", async () => {
    const response = await POST(request(validBody()));

    expect(response.status).toBe(200);
    expect(mocks.getUserId).toHaveBeenCalledOnce();
  });

  it("rejects feedback over the advertised 1,000-character limit before reserving usage", async () => {
    const response = await POST(request(validBody({ userFeedback: "x".repeat(1_001) })));

    expect(response.status).toBe(400);
    expect(mocks.reserveResumeGeneration).not.toHaveBeenCalled();
  });

  it("releases a reserved generation when the model fails", async () => {
    mocks.generateAiContent.mockRejectedValue(new Error("provider unavailable"));

    const response = await POST(request(validBody()));

    expect(response.status).toBe(500);
    expect(mocks.releaseResumeGenerationReservation).toHaveBeenCalledWith("user-1", "reservation-1");
  });
});
