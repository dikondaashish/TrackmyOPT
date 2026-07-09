import { describe, expect, it, vi, afterEach } from "vitest";
import { POST } from "@/app/api/case-status/check/route";
import { NextRequest } from "next/server";

describe("POST /api/case-status/check ownership gate", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects requests without user_id (fail closed)", async () => {
    vi.stubEnv("CRON_SECRET", "test-secret");

    const req = new NextRequest("http://localhost/api/case-status/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Secret": "test-secret",
      },
      body: JSON.stringify({ receipt_number: "IOE9822487119" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/user_id/i);
  });
});
