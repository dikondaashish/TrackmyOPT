import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const USER_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  from: vi.fn(),
  row: null as Record<string, unknown> | null,
  lastUpsert: null as Record<string, unknown> | null,
}));

vi.mock("@/lib/auth/getUserId", () => ({
  getUserId: mocks.getUserId,
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: mocks.from,
  })),
}));

import { DELETE, GET, PUT } from "./route";

function query() {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.eq = vi.fn(() => builder);
  builder.maybeSingle = vi.fn(async () => ({
    data: mocks.row,
    error: null,
  }));
  builder.upsert = vi.fn(async (value: Record<string, unknown>) => {
    mocks.lastUpsert = value;
    mocks.row = value;
    return { error: null };
  });
  builder.delete = vi.fn(() => {
    builder.eq = vi.fn(async () => {
      mocks.row = null;
      return { error: null };
    });
    return builder;
  });
  return builder;
}

function request(
  method: "GET" | "PUT" | "DELETE",
  body?: Record<string, unknown>
) {
  return new NextRequest(
    "https://www.trackmyopt.com/api/private-application-answers",
    {
      method,
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    }
  );
}

describe("/api/private-application-answers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PRIVATE_APPLICATION_ANSWERS_ENCRYPTION_KEY = Buffer.alloc(
      32,
      9
    ).toString("base64");
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-key";
    mocks.getUserId.mockResolvedValue(USER_ID);
    mocks.row = null;
    mocks.lastUpsert = null;
    mocks.from.mockImplementation((table: string) => {
      expect(table).toBe("private_application_answers");
      return query();
    });
  });

  it("requires an authenticated account", async () => {
    mocks.getUserId.mockResolvedValue(null);

    const response = await GET(request("GET"));

    expect(response.status).toBe(401);
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("requires explicit consent before saving", async () => {
    const response = await PUT(
      request("PUT", {
        consent: false,
        dateOfBirth: "1998-04-12",
      })
    );

    expect(response.status).toBe(400);
    expect(mocks.lastUpsert).toBeNull();
  });

  it("stores ciphertext and returns the authenticated user's answers", async () => {
    const saveResponse = await PUT(
      request("PUT", {
        consent: true,
        visaStatus: "F-1 OPT",
        dateOfBirth: "1998-04-12",
        sexGender: "female",
        eeoPreference: "prefer_not_to_answer",
      })
    );

    expect(saveResponse.status).toBe(200);
    expect(mocks.lastUpsert?.user_id).toBe(USER_ID);
    expect(String(mocks.lastUpsert?.encrypted_payload)).not.toContain("F-1 OPT");
    expect(String(mocks.lastUpsert?.encrypted_payload)).not.toContain(
      "1998-04-12"
    );

    const getResponse = await GET(request("GET"));
    const body = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(body.data).toMatchObject({
      visaStatus: "F-1 OPT",
      dateOfBirth: "1998-04-12",
      sexGender: "female",
      eeoPreference: "prefer_not_to_answer",
    });
    expect(getResponse.headers.get("cache-control")).toContain("no-store");
  });

  it("deletes all saved private answers", async () => {
    mocks.row = {
      user_id: USER_ID,
      encrypted_payload: "unused",
      payload_version: 1,
    };

    const response = await DELETE(request("DELETE"));

    expect(response.status).toBe(200);
    expect(mocks.row).toBeNull();
  });
});
