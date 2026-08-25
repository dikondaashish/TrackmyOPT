import { describe, expect, it } from "vitest";
import {
  DEDICATED_ATS_SCAN_LIMIT,
  DEDICATED_RESUME_LIMIT,
  FREE_ATS_SCAN_LIMIT,
  FREE_RESUME_LIMIT,
  PRO_ATS_SCAN_LIMIT,
  PRO_RESUME_LIMIT,
  resolveAtsScanLimitForTier,
  resolveResumeLimitForTier,
} from "@/lib/usage-limit";

describe("resolveResumeLimitForTier", () => {
  it("uses free limit for free / null / unknown (no premium_status bypass)", () => {
    expect(resolveResumeLimitForTier("free")).toBe(FREE_RESUME_LIMIT);
    expect(resolveResumeLimitForTier(null)).toBe(FREE_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("unknown")).toBe(FREE_RESUME_LIMIT);
  });

  it("maps pro and dedicated quotas", () => {
    expect(resolveResumeLimitForTier("pro")).toBe(PRO_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("dedicated")).toBe(DEDICATED_RESUME_LIMIT);
    expect(resolveResumeLimitForTier("PRO")).toBe(PRO_RESUME_LIMIT);
  });
});

describe("resolveAtsScanLimitForTier", () => {
  it("caps free ATS scans", () => {
    expect(resolveAtsScanLimitForTier("free")).toBe(FREE_ATS_SCAN_LIMIT);
  });

  it("gives paid tiers high ATS cap", () => {
    expect(resolveAtsScanLimitForTier("pro")).toBeGreaterThan(FREE_ATS_SCAN_LIMIT);
    expect(resolveAtsScanLimitForTier("dedicated")).toBe(DEDICATED_ATS_SCAN_LIMIT);
    expect(DEDICATED_ATS_SCAN_LIMIT).toBeGreaterThan(PRO_ATS_SCAN_LIMIT);
  });
});
