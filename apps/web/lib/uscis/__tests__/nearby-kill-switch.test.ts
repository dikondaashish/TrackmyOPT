import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { GET as nearbyGet } from "@/app/api/case-status/nearby/route";
import { POST as nearbyScanPost } from "@/app/api/case-status/nearby/scan/route";
import { GET as cronScanGet } from "@/app/api/cron/scan-nearby-cases/route";
import { buildReceiptRange } from "@/lib/case-status/receipt-cohort";
import { scanNearbyReceipts } from "@/lib/case-status/scan-nearby";
import { NearbyScanDisabledError } from "@/lib/uscis/nearby-scan";

describe("nearby scan kill switch", () => {
  let env: NodeJS.ProcessEnv;

  beforeEach(() => {
    env = { ...process.env };
    delete process.env.NEARBY_SCAN_ENABLED;
  });

  afterEach(() => {
    process.env = env;
  });

  it("returns 410 from /api/case-status/nearby", async () => {
    const res = await nearbyGet();
    expect(res.status).toBe(410);
  });

  it("returns 410 from /api/case-status/nearby/scan", async () => {
    const res = await nearbyScanPost();
    expect(res.status).toBe(410);
  });

  it("returns 410 from /api/cron/scan-nearby-cases", async () => {
    const res = await cronScanGet();
    expect(res.status).toBe(410);
  });

  it("buildReceiptRange throws when disabled", () => {
    expect(() => buildReceiptRange("IOE9822487119", 2, 2)).toThrow(
      NearbyScanDisabledError
    );
  });

  it("scanNearbyReceipts throws when disabled", async () => {
    await expect(
      scanNearbyReceipts({} as never, ["IOE9822487119"], "user-1")
    ).rejects.toBeInstanceOf(NearbyScanDisabledError);
  });
});
