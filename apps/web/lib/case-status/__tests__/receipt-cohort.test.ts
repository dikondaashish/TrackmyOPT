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
  it("builds an inclusive range around the center", () => {
    const range = buildReceiptRange("IOE9822487119", 2, 2);
    expect(range).not.toBeNull();
    expect(range!.receipts).toEqual([
      "IOE9822487117",
      "IOE9822487118",
      "IOE9822487119",
      "IOE9822487120",
      "IOE9822487121",
    ]);
  });

  it("clamps to the max range", () => {
    const range = buildReceiptRange("IOE9822487119", 99999, 0);
    expect(range!.receipts.length).toBeLessThanOrEqual(501);
  });

  it("returns null for invalid receipts", () => {
    expect(buildReceiptRange("nope", 1, 1)).toBeNull();
  });
});
