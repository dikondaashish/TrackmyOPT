import { describe, expect, it } from "vitest";
import { shouldDropAutocaptureOnPath } from "@/lib/posthog/posthog-browser";

describe("autocapture scope", () => {
  it("drops dashboard autocapture noise", () => {
    expect(shouldDropAutocaptureOnPath("/dashboard", "$autocapture")).toBe(true);
    expect(shouldDropAutocaptureOnPath("/dashboard/case-status", "$rageclick")).toBe(true);
    expect(shouldDropAutocaptureOnPath("/api/case-status", "$dead_click")).toBe(true);
  });

  it("keeps marketing autocapture", () => {
    expect(shouldDropAutocaptureOnPath("/", "$autocapture")).toBe(false);
    expect(shouldDropAutocaptureOnPath("/login", "$autocapture")).toBe(false);
    expect(shouldDropAutocaptureOnPath("/blog/opt-guide", "$autocapture")).toBe(false);
  });

  it("ignores non-autocapture events", () => {
    expect(shouldDropAutocaptureOnPath("/dashboard", "dashboard_viewed")).toBe(false);
  });
});
