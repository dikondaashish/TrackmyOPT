// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadCheckoutProfile } from "@/lib/premium/load-checkout-profile";

const PROFILE = {
  email: "student@example.com",
  first_name: "Ada",
  last_name: "L",
  stripe_customer_id: null,
  pro_free_trial_consumed: false,
};

function mockSupabase(opts: {
  reads: Array<{ data: unknown; error: unknown }>;
  insertError?: unknown;
  authEmail?: string | null;
}) {
  const reads = [...opts.reads];
  const insert = vi.fn(async () => ({ error: opts.insertError ?? null }));
  const getUserById = vi.fn(async () => ({
    data: { user: opts.authEmail === undefined ? null : { email: opts.authEmail } },
  }));
  const client = {
    from: vi.fn(() => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => reads.shift() }),
      }),
      insert,
    })),
    auth: { admin: { getUserById } },
  };
  return { client: client as unknown as SupabaseClient, insert, getUserById };
}

describe("loadCheckoutProfile", () => {
  it("returns an existing profile without writing", async () => {
    const { client, insert, getUserById } = mockSupabase({
      reads: [{ data: PROFILE, error: null }],
    });
    await expect(loadCheckoutProfile(client, "u1")).resolves.toEqual({ ok: true, profile: PROFILE });
    expect(insert).not.toHaveBeenCalled();
    expect(getUserById).not.toHaveBeenCalled();
  });

  it("creates a missing profile and uses the sign-in email", async () => {
    const created = { ...PROFILE, email: null, first_name: null, last_name: null };
    const { client, insert } = mockSupabase({
      reads: [
        { data: null, error: null },
        { data: created, error: null },
      ],
      authEmail: "signin@example.com",
    });
    const result = await loadCheckoutProfile(client, "u1");
    expect(insert).toHaveBeenCalledWith({
      user_id: "u1",
      timezone: "America/New_York",
      is_stem_eligible: false,
    });
    expect(result).toEqual({ ok: true, profile: { ...created, email: "signin@example.com" } });
  });

  it("reads the winner when a concurrent request created the profile", async () => {
    const { client } = mockSupabase({
      reads: [
        { data: null, error: null },
        { data: PROFILE, error: null },
      ],
      insertError: { code: "23505", message: "duplicate key" },
    });
    await expect(loadCheckoutProfile(client, "u1")).resolves.toEqual({ ok: true, profile: PROFILE });
  });

  it("returns database errors", async () => {
    const readError = { code: "57014", message: "timeout" };
    const { client: readFail } = mockSupabase({ reads: [{ data: null, error: readError }] });
    await expect(loadCheckoutProfile(readFail, "u1")).resolves.toEqual({ ok: false, error: readError });

    const insertError = { code: "42501", message: "denied" };
    const { client: insertFail } = mockSupabase({
      reads: [{ data: null, error: null }],
      insertError,
    });
    await expect(loadCheckoutProfile(insertFail, "u1")).resolves.toEqual({ ok: false, error: insertError });
  });
});
