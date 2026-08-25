import { describe, expect, it } from "vitest";
import { getDedicatedConsultationEligibility } from "./dedicated-consultation";

describe("Dedicated consultation eligibility", () => {
  const started = "2026-08-01T12:00:00.000Z";

  it("keeps booking locked before seven continuous days", () => {
    const result = getDedicatedConsultationEligibility(
      started,
      new Date("2026-08-08T11:59:59.000Z")
    );
    expect(result.eligible).toBe(false);
    expect(result.daysRemaining).toBe(1);
  });

  it("unlocks booking at exactly seven continuous days", () => {
    const result = getDedicatedConsultationEligibility(
      started,
      new Date("2026-08-08T12:00:00.000Z")
    );
    expect(result.eligible).toBe(true);
    expect(result.daysRemaining).toBe(0);
  });

  it("fails closed when the membership start is missing or invalid", () => {
    expect(getDedicatedConsultationEligibility(null).eligible).toBe(false);
    expect(getDedicatedConsultationEligibility("not-a-date").eligible).toBe(false);
  });
});
