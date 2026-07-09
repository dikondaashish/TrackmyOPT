import { describe, expect, it } from "vitest";
import { evaluateEnrollmentGuard as webEvaluate } from "@/lib/uscis/enrollment-guard";
import { evaluateEnrollmentGuard as apiEvaluate } from "../../../../api/src/uscis/enrollment-guard";

const CASES = [
  { userId: "", receipt: "IOE9822487119", enrolled: true, allowed: false },
  { userId: "u1", receipt: "bad", enrolled: true, allowed: false },
  { userId: "u1", receipt: "IOE9822487119", enrolled: false, allowed: false },
  { userId: "u1", receipt: "IOE9822487119", enrolled: true, allowed: true },
] as const;

describe("USCIS enrollment guard parity (Next.js vs NestJS)", () => {
  for (const c of CASES) {
    it(`web/api agree for user=${c.userId || "empty"} enrolled=${c.enrolled}`, () => {
      const input = {
        userId: c.userId,
        receiptNumber: c.receipt,
        enrolled: c.enrolled,
      };
      const web = webEvaluate(input);
      const api = apiEvaluate(input);
      expect(web.allowed).toBe(api.allowed);
      expect(web.reason).toBe(api.reason);
      expect(web.receiptHash).toBe(api.receiptHash);
      expect(web.normalizedReceipt).toBe(api.normalizedReceipt);
      expect(web.allowed).toBe(c.allowed);
    });
  }
});
