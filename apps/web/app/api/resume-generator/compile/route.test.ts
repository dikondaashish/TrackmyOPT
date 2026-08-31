import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getUserId: vi.fn() }));

vi.mock("@/lib/auth/get-user-id", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/posthog-server", () => ({ captureServerEvent: vi.fn() }));

const { POST } = await import("./route");

function request(body: unknown) {
  return new NextRequest("https://www.trackmyopt.com/api/resume-generator/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/resume-generator/compile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue("user-1");
  });

  it("requires authentication", async () => {
    mocks.getUserId.mockResolvedValue(null);

    expect((await POST(request({ latexCode: "\\documentclass{article}" }))).status).toBe(401);
  });

  it("rejects empty LaTeX before calling the compiler", async () => {
    const response = await POST(request({ latexCode: "  " }));

    expect(response.status).toBe(400);
  });

  it("rejects source over the compiler size limit", async () => {
    const response = await POST(request({ latexCode: "x".repeat(200_001) }));

    expect(response.status).toBe(413);
  });

  it("fails safely when no private compiler is configured", async () => {
    const response = await POST(request({ latexCode: "\\documentclass{article}" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ code: "resume_compiler_unavailable" });
  });
});
