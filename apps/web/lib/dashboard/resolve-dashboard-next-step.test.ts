import { describe, expect, it } from "vitest";
import { resolveDashboardNextStep } from "./resolve-dashboard-next-step";

describe("resolveDashboardNextStep", () => {
  it("routes users without a receipt to add receipt", () => {
    const step = resolveDashboardNextStep({
      isPremium: false,
      hasReceipt: false,
      lastCheckedAt: null,
      currentStatus: null,
    });
    expect(step.state).toBe("no_receipt");
    expect(step.action).toBe("add_receipt");
    expect(step.href).toBe("/dashboard/case-status");
  });

  it("shows Pro confirmation for premium receipt holders", () => {
    const step = resolveDashboardNextStep({
      isPremium: true,
      hasReceipt: true,
      lastCheckedAt: "2026-06-01T12:00:00.000Z",
      currentStatus: "Case Was Received",
    });
    expect(step.state).toBe("pro_active");
    expect(step.action).toBe("pro_manage");
    expect(step.href).toBe("/dashboard/case-status");
  });

  it("shows live status for free users with a recent check", () => {
    const step = resolveDashboardNextStep({
      isPremium: false,
      hasReceipt: true,
      lastCheckedAt: "2026-06-01T12:00:00.000Z",
      currentStatus: "Case Was Received",
    });
    expect(step.state).toBe("status_live");
    expect(step.action).toBe("view_case_status");
    expect(step.plainEnglishStatus).toBe("Case received");
    expect(step.statusCategory).toBe("received");
  });

  it("shows free upsell when receipt exists but no live check yet", () => {
    const step = resolveDashboardNextStep({
      isPremium: false,
      hasReceipt: true,
      lastCheckedAt: null,
      currentStatus: null,
    });
    expect(step.state).toBe("free_upsell");
    expect(step.action).toBe("upgrade_pro");
    expect(step.href).toBe("/premium/checkout?planId=pro&interval=year");
  });

  it("never shows free upsell to Pro users", () => {
    const step = resolveDashboardNextStep({
      isPremium: true,
      hasReceipt: true,
      lastCheckedAt: null,
      currentStatus: null,
    });
    expect(step.state).toBe("pro_active");
    expect(step.state).not.toBe("free_upsell");
  });
});
