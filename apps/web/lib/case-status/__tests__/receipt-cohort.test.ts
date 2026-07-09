import { describe, expect, it } from "vitest";
import {
  parseReceipt,
  formatReceipt,
  buildReceiptRange,
} from "../receipt-cohort";

describe("parseReceipt", () => {
  it("parses a valid receipt", () => {
    expect(parseReceipt("IOE9822487119")).toEqual({
      prefix: "IOE",
      serial: 9822487119,
    });
  });

  it("rejects invalid receipts", () => {
    expect(parseReceipt("IOE123")).toBeNull();
    expect(parseReceipt("12E9822487119")).toBeNull();
  });
});

describe("formatReceipt", () => {
  it("zero-pads serial to 10 digits", () => {
    expect(formatReceipt("IOE", 42)).toBe("IOE0000000042");
  });
});

describe("buildReceiptRange", () => {
  it("throws when nearby scanning is disabled", () => {
    expect(() => buildReceiptRange("IOE9822487119", 2, 2)).toThrow();
  });

  it("returns null for invalid receipts when enabled", () => {
    const prev = process.env.NEARBY_SCAN_ENABLED;
    process.env.NEARBY_SCAN_ENABLED = "true";
    expect(buildReceiptRange("nope", 1, 1)).toBeNull();
    process.env.NEARBY_SCAN_ENABLED = prev;
  });
});
