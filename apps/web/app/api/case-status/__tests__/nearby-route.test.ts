import { describe, expect, it, vi } from "vitest";
import { GET as nearbyGet } from "@/app/api/case-status/nearby/route";

describe("GET /api/case-status/nearby", () => {
  it("does not enqueue or fire any scan (410, no fetch)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await nearbyGet();
    expect(res.status).toBe(410);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
