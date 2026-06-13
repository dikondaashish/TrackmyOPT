import { describe, expect, it } from "vitest";
import { validateReceiptNumber } from "./receipt-number-validation";

describe("validateReceiptNumber", () => {
  it("accepts a valid IOE receipt", () => {
    const result = validateReceiptNumber("IOE1234567890");
    expect(result).toEqual({ valid: true, normalized: "IOE1234567890" });
  });

  it("rejects wrong length", () => {
    const result = validateReceiptNumber("IOE123");
    expect(result.valid).toBe(false);
  });

  it("rejects unknown prefix only in strict mode", () => {
    const loose = validateReceiptNumber("NBC1234567890");
    expect(loose.valid).toBe(true);

    const strict = validateReceiptNumber("NBC1234567890", { strictPrefix: true });
    expect(strict.valid).toBe(false);
  });

  it("normalizes lowercase input", () => {
    const result = validateReceiptNumber("ioe1234567890");
    expect(result).toEqual({ valid: true, normalized: "IOE1234567890" });
  });
});
