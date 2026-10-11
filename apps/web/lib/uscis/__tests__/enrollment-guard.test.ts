import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  evaluateEnrollmentGuard,
  assertReceiptEnrolledByUser,
} from "@/lib/uscis/enrollment-guard";
import { UnauthorizedReceiptLookupError } from "@/lib/uscis/errors";
import { fetchCaseStatus } from "@/lib/uscis/client";

function mockSupabase(enrolled: boolean, error = false, audit: 'ok' | 'removed' | 'failed' = 'ok') {
  return { from(table: string) {
    const query = {
      select: () => query, eq: () => query, insert: () => query,
      maybeSingle: async () => table === 'uscis_api_audit'
        ? { data: audit === 'ok' ? { id: 'audit-1' } : null, error: audit === 'failed' ? { message: 'private' } : null }
        : { data: enrolled ? { id: 'case-1' } : null, error: error ? { message: 'db' } : null },
    };
    return query;
  } } as never;
}

describe("evaluateEnrollmentGuard", () => {
  it("rejects missing user id", () => {
    const d = evaluateEnrollmentGuard({
      userId: "",
      receiptNumber: "IOE9822487119",
      enrolled: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("missing_user_id");
  });

  it("rejects receipt enrolled by different user (not in DB)", () => {
    const d = evaluateEnrollmentGuard({
      userId: "user-a",
      receiptNumber: "IOE9822487119",
      enrolled: false,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("receipt_not_enrolled_for_user");
  });

  it("allows enrolled receipt for same user", () => {
    const d = evaluateEnrollmentGuard({
      userId: "user-a",
      receiptNumber: "IOE9822487119",
      enrolled: true,
    });
    expect(d.allowed).toBe(true);
  });
});

describe("assertReceiptEnrolledByUser", () => {
  it("throws when receipt belongs to another user", async () => {
    await expect(
      assertReceiptEnrolledByUser(mockSupabase(false), {
        userId: "user-a",
        receiptNumber: "IOE9822487119",
        callSite: "test",
      })
    ).rejects.toBeInstanceOf(UnauthorizedReceiptLookupError);
  });

  it("returns normalized receipt when enrolled", async () => {
    const receipt = await assertReceiptEnrolledByUser(mockSupabase(true), {
      userId: "user-a",
      receiptNumber: "ioe9822487119",
      callSite: "test",
    });
    expect(receipt).toBe("IOE9822487119");
  });
});

describe("fetchCaseStatus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a receipt not enrolled by the requesting user", async () => {
    await expect(
      fetchCaseStatus({
        receiptNumber: "IOE9822487119",
        userId: "user-a",
        callSite: "test",
        supabase: mockSupabase(false),
      })
    ).rejects.toBeInstanceOf(UnauthorizedReceiptLookupError);
  });

  it("does not call USCIS when guard blocks", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(
      fetchCaseStatus({
        receiptNumber: "IOE9822487119",
        userId: "user-a",
        callSite: "test",
        supabase: mockSupabase(false),
      })
    ).rejects.toThrow();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('audit persistence boundary', () => {
  it('blocks USCIS when deletion invalidates the audit insert', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(fetchCaseStatus({ receiptNumber: 'IOE9822487119', userId: 'user-a', callSite: 'test', supabase: mockSupabase(true, false, 'removed') })).rejects.toBeInstanceOf(UnauthorizedReceiptLookupError);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('fails closed and reports no private message when the audit write fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(assertReceiptEnrolledByUser(mockSupabase(true, false, 'failed'), { receiptNumber: 'IOE9822487119', userId: 'user-a', callSite: 'test' })).rejects.toThrow('Could not record');
    expect(errorSpy).toHaveBeenCalledWith('USCIS enrollment audit write failed');
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain('private');
  });
});
