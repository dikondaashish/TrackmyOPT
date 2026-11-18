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

  it("sends an approved OPT case to the after-approval steps on every plan", () => {
    for (const isPremium of [false, true]) {
      const step = resolveDashboardNextStep({
        isPremium,
        hasReceipt: true,
        lastCheckedAt: "2026-11-18T12:00:00.000Z",
        currentStatus: "Card Was Delivered To Me By The Post Office",
        isOptCase: true,
      });
      expect(step.state).toBe("after_approval");
      expect(step.action).toBe("after_approval_steps");
      expect(step.href).toBe("/dashboard/case-status#after-approval");
    }
  });

  it("keeps the usual step for a pending case, a non-OPT approval, or no receipt", () => {
    expect(
      resolveDashboardNextStep({
        isPremium: true,
        hasReceipt: true,
        lastCheckedAt: "2026-11-18T12:00:00.000Z",
        currentStatus: "Case Was Received",
        isOptCase: true,
      }).state
    ).toBe("pro_active");
    // An approved H-1B or I-140 has no EAD dates to save.
    expect(
      resolveDashboardNextStep({
        isPremium: false,
        hasReceipt: true,
        lastCheckedAt: "2026-11-18T12:00:00.000Z",
        currentStatus: "Case Was Approved",
        isOptCase: false,
      }).state
    ).toBe("status_live");
    expect(
      resolveDashboardNextStep({
        isPremium: false,
        hasReceipt: false,
        lastCheckedAt: null,
        currentStatus: "Case Was Approved",
        isOptCase: true,
      }).state
    ).toBe("no_receipt");
  });
});
