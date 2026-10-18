import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  limit: vi.fn(),
  row: null as Record<string, unknown> | null,
  staleWrites: 0,
}));

vi.mock("@/lib/auth/get-user-id", () => ({ getUserId: mocks.getUserId }));
vi.mock("@/lib/auth/rate-limit", () => ({ default: () => ({ check: mocks.limit }) }));
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: () => {
      const filters: Record<string, unknown> = {};
      let pendingUpdate: Record<string, unknown> | null = null;
      let pendingInsert: Record<string, unknown> | null = null;
      const builder: Record<string, unknown> = {};
      builder.select = vi.fn(() => {
        if (pendingUpdate) {
          const matches = mocks.row && Object.entries(filters).every(([key, value]) => mocks.row![key] === value);
          if (matches && mocks.staleWrites > 0) { mocks.staleWrites -= 1; return Promise.resolve({ data: [], error: null }); }
          if (matches) mocks.row = { ...mocks.row!, ...pendingUpdate };
          return Promise.resolve({ data: matches ? [{ user_id: USER_ID }] : [], error: null });
        }
        if (pendingInsert) {
          if (mocks.row) return Promise.resolve({ data: null, error: { code: "23505" } });
          mocks.row = pendingInsert;
          return Promise.resolve({ data: [{ user_id: USER_ID }], error: null });
        }
        return builder;
      });
      builder.eq = vi.fn((key: string, value: unknown) => { filters[key] = value; return builder; });
      builder.maybeSingle = vi.fn(async () => ({ data: mocks.row, error: null }));
      builder.update = vi.fn((value: Record<string, unknown>) => { pendingUpdate = value; return builder; });
      builder.insert = vi.fn((value: Record<string, unknown>) => { pendingInsert = value; return builder; });
      builder.upsert = vi.fn(async (value: Record<string, unknown>) => { mocks.row = value; return { error: null }; });
      return builder;
    },
  })),
}));

import { GET, PATCH, PUT } from "./route";

const call = (handler: (req: NextRequest) => Promise<Response>, method: string, body?: unknown) => handler(new NextRequest(
  "https://www.trackmyopt.com/api/private-application-answers",
  { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) },
));
const stored = async () => (await (await call(GET, "GET")).json()).data;

describe("verified work authorization answers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
    mocks.getUserId.mockResolvedValue(USER_ID);
    mocks.limit.mockResolvedValue({ isRateLimited: false });
    mocks.row = null;
    mocks.staleWrites = 0;
  });

  it("saves a confirmation with the server's time and the exact question wording", async () => {
    const before = Date.now();
    const res = await call(PATCH, "PATCH", { consent: true, change: {
      action: "confirm", meaning: "currentSponsorship", answer: "no",
      question: "Do you currently need visa sponsorship to work in the US?" } });
    expect(res.status).toBe(200);
    const data = await stored();
    expect(data.verifiedAuthorization.currentSponsorship).toMatchObject({
      answer: "no", scope: "united_states",
      confirmedWordings: ["do you currently need visa sponsorship to work in the us"],
    });
    expect(Date.parse(data.verifiedAuthorization.currentSponsorship.confirmedAt)).toBeGreaterThanOrEqual(before - 5);
  });

  it("requires consent, a valid change, and a matching question", async () => {
    expect((await call(PATCH, "PATCH", { change: { action: "clear", meaning: "currentSponsorship" } })).status).toBe(400);
    expect((await call(PATCH, "PATCH", { consent: true, change: { action: "confirm", meaning: "nationality", answer: "yes" } })).status).toBe(400);
    const mismatch = await call(PATCH, "PATCH", { consent: true, change: {
      action: "confirm", meaning: "currentSponsorship", answer: "no",
      question: "Are you legally authorized to work in the United States?" } });
    expect(mismatch.status).toBe(409);
    mocks.getUserId.mockResolvedValueOnce(null);
    expect((await call(PATCH, "PATCH", { consent: true, change: { action: "clear", meaning: "currentSponsorship" } })).status).toBe(401);
  });

  it("keeps other private answers and retries a concurrent write", async () => {
    await call(PUT, "PUT", { consent: true, visaType: "opt", workAuthorization: "yes" });
    mocks.staleWrites = 1;
    const res = await call(PATCH, "PATCH", { consent: true, change: { action: "confirm", meaning: "futureSponsorship", answer: "yes" } });
    expect(res.status).toBe(200);
    const data = await stored();
    expect(data.visaType).toBe("opt");
    expect(data.verifiedAuthorization.futureSponsorship.answer).toBe("yes");
  });

  it("full-form saves keep verified answers unless explicitly cleared", async () => {
    await call(PATCH, "PATCH", { consent: true, change: { action: "confirm", meaning: "currentWorkAuthorization", answer: "yes" } });
    await call(PUT, "PUT", { consent: true, visaType: "opt" });
    expect((await stored()).verifiedAuthorization.currentWorkAuthorization.answer).toBe("yes");
    await call(PUT, "PUT", { consent: true, visaType: "opt", verifiedAuthorization: null });
    expect((await stored()).verifiedAuthorization).toBeUndefined();
  });

  it("clears one answer and rejects tampered stored shapes on save", async () => {
    await call(PATCH, "PATCH", { consent: true, change: { action: "confirm", meaning: "currentSponsorship", answer: "no" } });
    await call(PATCH, "PATCH", { consent: true, change: { action: "clear", meaning: "currentSponsorship" } });
    expect((await stored()).verifiedAuthorization.currentSponsorship).toBeUndefined();
    const tampered = await call(PUT, "PUT", { consent: true, verifiedAuthorization: { meaningVersion: 1, currentSponsorship: { answer: "no", confirmedAt: "x", scope: "united_states", confirmedWordings: [] } } });
    expect(tampered.status).toBe(400);
  });
});
