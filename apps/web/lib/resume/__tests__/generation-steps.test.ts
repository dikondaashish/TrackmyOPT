import { describe, expect, it } from "vitest";
import {
  deriveGenerationSteps,
  type GenerationSignals,
} from "@/lib/resume/generation-steps";

const idle: GenerationSignals = {
  isGenerating: false,
  isCompiling: false,
  isScanning: false,
  isAutoFixing: false,
  hasLatex: false,
  hasPdf: false,
  compileFailed: false,
  pdfParseOk: null,
  atsScore: null,
};

const statusById = (signals: GenerationSignals) =>
  Object.fromEntries(deriveGenerationSteps(signals).map((step) => [step.id, step.status]));

describe("resume generation steps", () => {
  it("marks only the tailoring step active while the generate call is in flight", () => {
    expect(statusById({ ...idle, isGenerating: true })).toEqual({
      tailor: "active",
      compile: "pending",
      ats: "pending",
    });
  });

  it("advances past tailoring once a later stage runs, even though isGenerating stays true", () => {
    // Compilation is awaited inside the generate call, so a still-true
    // isGenerating must not keep the first step spinning forever.
    expect(statusById({ ...idle, isGenerating: true, isCompiling: true, hasLatex: true })).toEqual({
      tailor: "completed",
      compile: "active",
      ats: "pending",
    });
  });

  it("reports a failed compile instead of an endless spinner", () => {
    const steps = deriveGenerationSteps({ ...idle, hasLatex: true, compileFailed: true });
    expect(steps.find((step) => step.id === "compile")).toMatchObject({
      status: "failed",
      detail: "This LaTeX could not be compiled",
    });
  });

  it("shows the ATS score when the scan lands, and warns when the PDF may not parse", () => {
    const scored = deriveGenerationSteps({ ...idle, hasLatex: true, hasPdf: true, pdfParseOk: true, atsScore: 82 });
    expect(scored.find((step) => step.id === "ats")).toMatchObject({
      status: "completed",
      detail: "Match score 82/100",
    });

    const unparseable = deriveGenerationSteps({ ...idle, hasLatex: true, hasPdf: true, pdfParseOk: false, atsScore: 82 });
    expect(unparseable.find((step) => step.id === "ats")?.status).toBe("warning");
  });

  it("lists the auto-improve pass only while it is actually running", () => {
    expect(statusById(idle)).not.toHaveProperty("improve");
    expect(statusById({ ...idle, isGenerating: true, isAutoFixing: true, hasLatex: true, hasPdf: true })).toMatchObject({
      tailor: "completed",
      improve: "active",
    });
  });
});
