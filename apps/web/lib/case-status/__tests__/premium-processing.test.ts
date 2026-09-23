import { describe, expect, it } from "vitest";
import { addBusinessDays, businessDaysBetween, formatIsoDate } from "../business-days";
import {
  detectPpStart,
  getPpClock,
  PP_BUSINESS_DAY_LIMIT,
  resolvePpClockState,
  isPremiumProcessingActive,
  resolvePpStartDateForStorage,
} from "../premium-processing";

describe("addBusinessDays", () => {
  it('skips New Year observed on the preceding December 31', () => {
    expect(formatIsoDate(addBusinessDays(new Date('2027-12-30T12:00:00Z'), 1))).toBe('2028-01-03');
  });
  it("skips weekends", () => {
    // Friday 2026-05-08 + 1 business day = Monday 2026-05-11
    const start = new Date("2026-05-08T12:00:00.000Z");
    expect(formatIsoDate(addBusinessDays(start, 1))).toBe("2026-05-11");
  });
});

describe("detectPpStart", () => {
  it("prefers manual date", () => {
    expect(
      detectPpStart({
        manualPpStart: "2026-05-12",
        statusHistory: [
          { status: "Changed to Premium Processing", date: "2026-05-10" },
        ],
        currentStatus: null,
      })
    ).toBe("2026-05-12");
  });

  it("does not equate a premium upgrade with a confirmed clock start", () => {
    expect(
      detectPpStart({
        statusHistory: [
          { status: "Changed to Premium Processing", date: "2026-05-12" },
          { status: "Case Was Received", date: "2026-04-01" },
        ],
        currentStatus: null,
      })
    ).toBeNull();
  });
});

const started = {
  status: "Premium Processing Clock Was Started",
  date: "2026-05-15",
  description: "Your premium processing clock started on May12, 2026.",
};
const rfe = { status: "Request for Additional Evidence Was Sent", date: "2026-05-20" };
const response = { status: "Response To USCIS' Request For Evidence Was Received", date: "2026-06-01" };
const now = new Date("2026-09-23T12:00:00Z");

describe("resolvePpClockState", () => {
  it('handles malformed history metadata without crashing', () => {
    expect(() => resolvePpClockState({ statusHistory: [{ status: 'Premium Processing', description: 42, date: {} }], now })).not.toThrow();
  });
  it("uses the explicit clock date instead of the event date or a stored inferred date", () => {
    const input = { statusHistory: [started], manualPpStart: "2026-05-15", now };
    expect(resolvePpClockState(input)).toMatchObject({ status: "active", clock: { ppStart: "2026-05-12", deadline: "2026-06-25" } });
    expect(detectPpStart(input)).toBe("2026-05-12");
    expect(resolvePpStartDateForStorage({ ...input, existingManual: "2026-05-15" })).toBe("2026-05-12");
  });

  it.each(["Case Was Approved", "Case Was Denied", "Case Was Rejected", "Case Was Withdrawn", "Case Was Closed", "New Card Is Being Produced", "Card Was Delivered To Me By The Post Office"])("ends the clock on %s", (currentStatus) => {
    const input = { statusHistory: [started], currentStatus, manualPpStart: "2026-05-12", now };
    expect(resolvePpClockState(input)).toMatchObject({ status: "completed", clock: null });
    expect(isPremiumProcessingActive(input)).toBe(false);
  });

  it("does not reactivate from old PP history when a decision exists in history", () => {
    expect(resolvePpClockState({ statusHistory: [started, { status: "Case Was Approved", date: "2026-05-19" }], now })).toMatchObject({ status: "completed", clock: null });
  });

  it.each([rfe.status, "Notice of Intent to Deny Was Sent", "Premium Processing Clock Was Stopped"])("stops on %s without a false overdue", (currentStatus) => {
    expect(resolvePpClockState({ statusHistory: [started], currentStatus, now })).toMatchObject({ status: "stopped", clock: null });
  });

  it("starts a fresh 30 business days on confirmed response receipt, regardless of history order", () => {
    for (const statusHistory of [[started, rfe, response], [response, rfe, started]]) {
      const state = resolvePpClockState({ statusHistory, currentStatus: response.status, manualPpStart: "2026-05-12", now: new Date("2026-06-01T12:00:00Z") });
      expect(state).toMatchObject({ status: "active", clock: { ppStart: "2026-06-01", daysRemaining: 30, deadline: "2026-07-15" } });
    }
  });

  it("does not restart on sending a response, an undated response, or ambiguous same-day events", () => {
    for (const entry of [
      { status: "Response To Request For Evidence Was Sent", date: "2026-06-01" },
      { ...response, date: "" },
      { ...response, date: rfe.date },
    ]) {
      const state = resolvePpClockState({ statusHistory: [started, rfe, entry], manualPpStart: "2026-06-02", now });
      expect(state.clock).toBeNull();
      expect(["stopped", "unknown"]).toContain(state.status);
    }
  });

  it("requires a new receipt/start after each RFE or NOID", () => {
    expect(resolvePpClockState({ statusHistory: [started, rfe, response, { status: "Notice of Intent to Deny Was Sent", date: "2026-06-10" }], now })).toMatchObject({ status: "stopped", clock: null });
  });

  it("does not infer a year or accept impossible/future start dates", () => {
    for (const date of ["May 12", "February 30, 2026", "2026-02-30", "2027-01-01"]) {
      expect(resolvePpClockState({ statusHistory: [{ ...started, description: `Your premium processing clock started on ${date}.` }], now })).toMatchObject({ status: "unknown", clock: null });
    }
  });

  it("requires a confirmed date, not just a premium mention", () => {
    expect(resolvePpClockState({ statusHistory: [{ status: "Changed to Premium Processing", date: "2026-05-12" }], now })).toMatchObject({ status: "unknown", clock: null });
    expect(resolvePpClockState({ statusHistory: null, now })).toMatchObject({ status: "inactive", clock: null });
    expect(resolvePpClockState({ statusHistory: [null, {}, 1], manualPpStart: "invalid", now })).toMatchObject({ status: "unknown", clock: null });
  });

  it("accepts explicit current-description evidence without inventing an observation date", () => {
    expect(resolvePpClockState({ statusHistory: [], currentStatus: started.status, currentDescription: started.description, now })).toMatchObject({ status: "active", clock: { ppStart: "2026-05-12" } });
    expect(resolvePpClockState({ statusHistory: [started, rfe], currentStatus: response.status, now }).clock).toBeNull();
  });

  it("does not treat historical boilerplate as a current RFE or decision", () => {
    expect(resolvePpClockState({ statusHistory: [{ ...started, description: `${started.description} We may issue a request for evidence or approve your case.` }], now }).status).toBe("active");
  });
});

describe("getPpClock", () => {
  it("rejects malformed dates promptly rather than hanging the business-day loop", () => {
    expect(() => getPpClock("invalid", now)).toThrow(RangeError);
    expect(() => getPpClock("2026-02-30", now)).toThrow(RangeError);
    expect(() => getPpClock("2026-05-12", new Date(NaN))).toThrow(RangeError);
  });

  it("is not overdue on the deadline, weekend, or holiday before the next business day", () => {
    // April 23 + 30 business days = June 5 (Friday).
    for (const date of ["2026-06-05", "2026-06-06", "2026-06-07"]) {
      expect(getPpClock("2026-04-23", new Date(`${date}T12:00:00Z`))).toMatchObject({ isOverdue: false, daysOverdue: 0 });
    }
    expect(getPpClock("2026-04-23", new Date("2026-06-08T12:00:00Z"))).toMatchObject({ isOverdue: true, daysOverdue: 1 });
  });
  it("uses the 30-business-day Form I-765 premium-processing timeframe", () => {
    expect(PP_BUSINESS_DAY_LIMIT).toBe(30);
    expect(
      getPpClock("2026-05-12", new Date("2026-05-12T12:00:00.000Z")).deadline
    ).toBe("2026-06-25");
  });

  it("flags overdue after deadline", () => {
    const clock = getPpClock("2026-05-12", new Date("2026-06-29T12:00:00.000Z"));
    expect(clock.isOverdue).toBe(true);
    expect(clock.daysOverdue).toBeGreaterThan(0);
  });

  it("shows days remaining before deadline", () => {
    const clock = getPpClock("2026-05-12", new Date("2026-05-12T12:00:00.000Z"));
    expect(clock.isOverdue).toBe(false);
    expect(clock.daysRemaining).toBeGreaterThan(0);
  });
});

describe("businessDaysBetween", () => {
  it("counts business days between dates", () => {
    const a = new Date("2026-05-12T12:00:00.000Z");
    const b = new Date("2026-05-14T12:00:00.000Z");
    expect(businessDaysBetween(a, b)).toBe(2);
  });
});
