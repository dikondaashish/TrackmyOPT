import { describe, expect, it } from "vitest";
import {
  formatBoundaryErrorMessage,
  isNonFatalBoundaryError,
  shouldReportBoundaryError,
} from "@/lib/posthog/error-boundary-report";

describe("isNonFatalBoundaryError", () => {
  it("matches Supabase Realtime WebSocket blocked", () => {
    expect(isNonFatalBoundaryError("WebSocket not available")).toBe(true);
  });

  it("matches insecure WebSocket in Firefox private mode", () => {
    expect(
      isNonFatalBoundaryError(
        "The operation is insecure. WebSocket connection failed"
      )
    ).toBe(true);
  });

  it("does not drop real render failures", () => {
    expect(isNonFatalBoundaryError("Cannot read properties of undefined")).toBe(
      false
    );
  });
});

describe("formatBoundaryErrorMessage", () => {
  it("uses error message when present", () => {
    expect(formatBoundaryErrorMessage(new Error("Something broke"))).toBe(
      "Something broke"
    );
  });

  it("falls back to error name", () => {
    const err = new Error("");
    err.name = "TypeError";
    expect(formatBoundaryErrorMessage(err)).toBe("TypeError");
  });

  it("falls back to digest", () => {
    const err = new Error("") as Error & { digest?: string };
    err.name = "";
    err.digest = "abc123";
    expect(formatBoundaryErrorMessage(err)).toBe("digest:abc123");
  });

  it("returns unknown when empty", () => {
    const err = new Error("") as Error & { digest?: string };
    err.name = "";
    expect(formatBoundaryErrorMessage(err)).toBe("Unknown render error");
  });
});

describe("shouldReportBoundaryError", () => {
  it("skips non-fatal WebSocket errors", () => {
    expect(shouldReportBoundaryError(new Error("WebSocket not available"))).toBe(
      false
    );
  });

  it("reports real errors", () => {
    expect(shouldReportBoundaryError(new Error("Chunk load failed"))).toBe(true);
  });
});
