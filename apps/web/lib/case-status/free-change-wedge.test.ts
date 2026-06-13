import { describe, expect, it } from "vitest";
import {
  applyFreeUserChangeWedgeToUpdate,
  formatStatusChangedDaysAgo,
  shouldShowStatusChangeWedge,
} from "./free-change-wedge";

describe("applyFreeUserChangeWedgeToUpdate", () => {
  it("sets wedge fields for free user on real status change", () => {
    const update: Record<string, unknown> = {};
    applyFreeUserChangeWedgeToUpdate(update, {
      hasStatusChanged: true,
      isFirstCheck: false,
      isPremium: false,
    });
    expect(update.status_last_changed_at).toBeTruthy();
    expect(update.last_change_alert_suppressed).toBe(true);
  });

  it("skips first-ever check", () => {
    const update: Record<string, unknown> = {};
    applyFreeUserChangeWedgeToUpdate(update, {
      hasStatusChanged: true,
      isFirstCheck: true,
      isPremium: false,
    });
    expect(update.status_last_changed_at).toBeUndefined();
    expect(update.last_change_alert_suppressed).toBeUndefined();
  });

  it("skips premium users", () => {
    const update: Record<string, unknown> = {};
    applyFreeUserChangeWedgeToUpdate(update, {
      hasStatusChanged: true,
      isFirstCheck: false,
      isPremium: true,
    });
    expect(update.status_last_changed_at).toBeUndefined();
  });

  it("skips identical re-checks", () => {
    const update: Record<string, unknown> = {};
    applyFreeUserChangeWedgeToUpdate(update, {
      hasStatusChanged: false,
      isFirstCheck: false,
      isPremium: false,
    });
    expect(update.status_last_changed_at).toBeUndefined();
  });
});

describe("shouldShowStatusChangeWedge", () => {
  const baseRow = {
    status_last_changed_at: "2026-05-28T12:00:00.000Z",
    last_change_alert_suppressed: true,
    last_status_viewed_at: null,
  };

  it("shows for free user with unsuppressed-viewed change", () => {
    expect(shouldShowStatusChangeWedge(baseRow, false)).toBe(true);
  });

  it("hides for premium users", () => {
    expect(shouldShowStatusChangeWedge(baseRow, true)).toBe(false);
  });

  it("hides after user viewed since change", () => {
    expect(
      shouldShowStatusChangeWedge(
        {
          ...baseRow,
          last_status_viewed_at: "2026-05-29T12:00:00.000Z",
        },
        false
      )
    ).toBe(false);
  });

  it("hides when alert was not suppressed", () => {
    expect(
      shouldShowStatusChangeWedge(
        { ...baseRow, last_change_alert_suppressed: false },
        false
      )
    ).toBe(false);
  });
});

describe("formatStatusChangedDaysAgo", () => {
  it("formats today", () => {
    const now = new Date().toISOString();
    expect(formatStatusChangedDaysAgo(now)).toBe("today");
  });

  it("formats plural days", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatStatusChangedDaysAgo(threeDaysAgo)).toBe("3 days ago");
  });
});
