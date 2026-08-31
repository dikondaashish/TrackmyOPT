import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  loadTemplateSource: vi.fn(),
  normalizeAccentHex: vi.fn(),
  buildGeneratePrompt: vi.fn(),
  reserveResumeGeneration: vi.fn(),
  releaseResumeGenerationReservation: vi.fn(),
  generateAiContent: vi.fn(),
  checkAtsCompliance: vi.fn(),
}));

vi.mock("@/lib/auth/get-user-id", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/upstash-redis", () => ({ hasUpstashRedisConfig: () => false }));
vi.mock("@/lib/api/cors-policy", () => ({
  corsHeadersConfiguredWebApp: () => ({ "Access-Control-Allow-Origin": "https://www.trackmyopt.com" }),
}));
vi.mock("@/lib/documents/template-source", () => ({
  loadTemplateSource: mocks.loadTemplateSource,
  normalizeAccentHex: mocks.normalizeAccentHex,
}));
vi.mock("@/lib/ai/prompts/generate", () => ({ buildGeneratePrompt: mocks.buildGeneratePrompt }));
vi.mock("@/lib/usage-limit", () => ({
  reserveResumeGeneration: mocks.reserveResumeGeneration,
  releaseResumeGenerationReservation: mocks.releaseResumeGenerationReservation,
}));
vi.mock("@/lib/ai/google-ai", () => ({ generateAiContent: mocks.generateAiContent }));
vi.mock("@/lib/validators/ats-checker", () => ({ checkAtsCompliance: mocks.checkAtsCompliance }));

const { POST } = await import("./route");

function request(body: Record<string, unknown>) {
  return new NextRequest("https://www.trackmyopt.com/api/resume-generator/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    mocks.generateAiContent.mockResolvedValue({ text: "```latex\n\\documentclass{article}\n```" });
    mocks.checkAtsCompliance.mockReturnValue({ passed: true, issues: [] });
  });

  it("requires an authenticated user", async () => {
    mocks.getUserId.mockResolvedValue(null);

    const response = await POST(request(validBody()));

    expect(response.status).toBe(401);
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
  });
});
