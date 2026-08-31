import { describe, expect, it } from "vitest";
import {
  REGENERATION_FEEDBACK_MAX_CHARS,
  buildAutoRegenFeedback,
  limitRegenerationFeedback,
} from "@/lib/resume/ats-analysis-types";

describe("ATS regeneration feedback", () => {
  it("keeps auto-generated feedback inside the regenerate API limit", () => {
    const feedback = buildAutoRegenFeedback({
      passed: false,
      issues: [],
      keywordMatch: {
        found: [],
        missing: Array.from({ length: 12 }, (_, index) => `keyword-${index}-${"x".repeat(140)}`),
        score: 0,
      },
      improvements: Array.from({ length: 3 }, () => "Improve this bullet. ".repeat(80)),
    });

    expect(feedback.length).toBeLessThanOrEqual(REGENERATION_FEEDBACK_MAX_CHARS);
  });

  it("limits the combined ATS instruction before a request is sent", () => {
    const feedback = limitRegenerationFeedback([
      "Only use experience supported by the source resume.",
      "x".repeat(1_500),
    ].join("\n\n"));

    expect(feedback).toHaveLength(REGENERATION_FEEDBACK_MAX_CHARS);
    expect(feedback).toContain("source resume");
  });
});
