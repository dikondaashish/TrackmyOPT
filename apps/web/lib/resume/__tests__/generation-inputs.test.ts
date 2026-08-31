import { describe, expect, it } from "vitest";
import { hasResumeGenerationInputs } from "@/lib/resume/generation-inputs";

describe("hasResumeGenerationInputs", () => {
  const validResume = "R".repeat(50);
  const validJobDescription = "J".repeat(50);

  it("requires at least 50 meaningful characters in both fields", () => {
    expect(hasResumeGenerationInputs(validResume, validJobDescription)).toBe(true);
  });

  it("rejects a missing or whitespace-only job description", () => {
    expect(hasResumeGenerationInputs(validResume, " ".repeat(100))).toBe(false);
  });

  it("rejects a resume shorter than the minimum", () => {
    expect(hasResumeGenerationInputs("R".repeat(49), validJobDescription)).toBe(false);
  });
});
