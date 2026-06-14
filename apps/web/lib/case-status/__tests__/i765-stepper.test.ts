import { describe, expect, it } from "vitest";
import {
  biometricsAppliesToCase,
  getVisibleI765Steps,
  mapStatusToRawStep,
  mentionsBiometrics,
  toDisplayStep,
} from "../i765-stepper";

describe("i765-stepper", () => {
  it("detects biometrics in status text", () => {
    expect(mentionsBiometrics("Fingerprint Fee Was Received")).toBe(true);
    expect(mentionsBiometrics("Case Was Received")).toBe(false);
  });

  it("skips biometrics step for typical I-765 OPT unless history mentions it", () => {
    expect(
      biometricsAppliesToCase("Case Was Received", [
        { status: "Case Is Being Actively Reviewed By USCIS" },
      ])
    ).toBe(false);
    expect(getVisibleI765Steps(true)).toHaveLength(4);
    expect(getVisibleI765Steps(true).some((s) => s.key === "biometrics")).toBe(
      false
    );
  });

  it("shows biometrics when USCIS posted a biometrics-related status", () => {
    expect(
      biometricsAppliesToCase("Case Was Received", [
        { status: "Biometrics Appointment Was Scheduled" },
      ])
    ).toBe(true);
    expect(getVisibleI765Steps(false)).toHaveLength(5);
  });

  it("remaps raw steps when biometrics is hidden", () => {
    expect(toDisplayStep(3, true)).toBe(2);
    expect(toDisplayStep(5, true)).toBe(4);
    expect(toDisplayStep(2, true)).toBe(1);
  });

  it("maps review and card statuses", () => {
    expect(mapStatusToRawStep("Case Is Being Actively Reviewed")).toBe(3);
    expect(mapStatusToRawStep("Card Was Mailed To Me")).toBe(5);
  });
});
