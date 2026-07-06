import { describe, expect, it } from "vitest";
import {
  normalizeResumeText,
  prepareResumeText,
  RESUME_TEXT_MAX_CHARS,
} from "../resume-text-limits";

describe("resume-text-limits", () => {
  it("normalizeResumeText collapses excessive whitespace", () => {
    const raw = "Hello   world\n\n\n\nFoo\t\tbar";
    expect(normalizeResumeText(raw)).toBe("Hello world\n\nFoo bar");
  });

  it("prepareResumeText truncates over-limit text", () => {
    const long = "A".repeat(RESUME_TEXT_MAX_CHARS + 500);
    const prepared = prepareResumeText(long);
    expect(prepared.truncated).toBe(true);
    expect(prepared.text.length).toBeLessThanOrEqual(RESUME_TEXT_MAX_CHARS);
    expect(prepared.originalLength).toBe(RESUME_TEXT_MAX_CHARS + 500);
  });

  it("prepareResumeText keeps short text unchanged", () => {
    const short = "Short resume body with enough content for tests.";
    const prepared = prepareResumeText(short);
    expect(prepared.truncated).toBe(false);
    expect(prepared.text).toBe(short);
  });
});
