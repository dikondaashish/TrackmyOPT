import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

type QueryRecord = {
  table: string;
  operation?: 'select' | 'update' | 'insert';
  payload?: Record<string, unknown>;
  filters: Array<[string, unknown]>;
};

const mocks = vi.hoisted(() => ({
  queries: [] as QueryRecord[],
  fetchCaseStatus: vi.fn(),
  removedAfterFetch: false,
  profileMissing: false,
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from(table: string) {
      const record: QueryRecord = { table, filters: [] };
      mocks.queries.push(record);

      const query = {
        select() {
          record.operation ??= 'select';
          return query;
        },
        update(payload: Record<string, unknown>) {
          record.payload = payload;
          record.operation = 'update';
          return query;
        },
        insert() {
          record.operation = 'insert';
          return query;
        },
        eq(column: string, value: unknown) {
          record.filters.push([column, value]);
          return query;
        },
        maybeSingle: async () => ({
          data:
            table === 'profiles'
              ? mocks.profileMissing
                ? null
                : { premium_status: false }
              : { id: 'case-row-a', user_id: 'user-a', current_status: null },
          error: null,
        }),
        single: async () => ({
          data:
            (mocks.removedAfterFetch && table === 'case_status') ||
            (mocks.profileMissing && table === 'profiles')
              ? null
              : table === 'profiles'
                ? { premium_status: false }
                : { id: 'case-row-a', user_id: 'user-a', current_status: null },
          error:
            mocks.profileMissing && table === 'profiles'
              ? { code: 'PGRST116' }
              : null,
        }),
      };

      return query;
    },
  })),
}));

vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/immigration/uscis-checker', () => ({
  mockUSCISStatus: () => ({
    status: 'Case Was Received',
    description: 'Received',
    caseType: 'I-765',
    receivedDate: null,
    histCaseStatus: [],
  }),
}));
vi.mock('@/lib/uscis/client', () => ({
  fetchCaseStatus: mocks.fetchCaseStatus,
}));
vi.mock('@/lib/posthog/case-status-analytics', () => ({
  resolveCaseCheckSource: () => 'api',
  resolveCaseCheckTrigger: () => 'unknown',
  trackCaseStatusCheckCompleted: vi.fn(),
  trackCaseStatusCheckFailed: vi.fn(),
  trackCaseStatusCheckStarted: vi.fn(),
}));

import { POST } from '@/app/api/case-status/check/route';

describe('POST /api/case-status/check row scoping', () => {
  beforeEach(() => {
    mocks.queries.length = 0;
    mocks.fetchCaseStatus.mockReset();
    mocks.removedAfterFetch = false;
    mocks.profileMissing = false;
    vi.stubEnv('CRON_SECRET', 'test-secret');
    vi.stubEnv('USCIS_MOCK', 'true');
    vi.stubEnv('VERCEL_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("updates only the enrolled user's exact case row when receipt numbers are shared", async () => {
    const response = await POST(
      new NextRequest('http://localhost/api/case-status/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': 'test-secret',
          'X-Force-Refresh': 'true',
        },
        body: JSON.stringify({
          receipt_number: 'IOE9822487119',
          user_id: 'user-a',
        }),
      })
    );

    expect(response.status).toBe(200);

    const caseUpdates = mocks.queries.filter(
      (query) => query.table === 'case_status' && query.operation === 'update'
    );
    expect(caseUpdates).toHaveLength(1);
    expect(caseUpdates[0]?.filters).toEqual(
      expect.arrayContaining([
        ['id', 'case-row-a'],
        ['user_id', 'user-a'],
      ])
    );
    expect(caseUpdates[0]?.filters).not.toContainEqual([
      'receipt_number',
      'IOE9822487119',
    ]);
  });

  it('syncs an enrolled case without a profile using free behavior', async () => {
    vi.stubEnv('USCIS_MOCK', 'false');
    mocks.profileMissing = true;
    mocks.fetchCaseStatus.mockResolvedValue({
      success: true,
      data: {
        receiptNumber: 'IOE0000000001',
        status: 'Case Was Received',
        description: 'Case was received.',
        caseType: 'I-765',
        receivedDate: null,
        histCaseStatus: [],
      },
    });
    const response = await POST(
      new NextRequest('https://example.test/api/case-status/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': 'test-secret',
          'X-Force-Refresh': 'true',
          'X-Check-Trigger': 'daily',
        },
        body: JSON.stringify({
          receipt_number: 'IOE0000000001',
          user_id: 'user-a',
        }),
      })
    );
    expect(response.status).toBe(200);
    const update = mocks.queries.find(
      (q) => q.table === 'case_status' && q.operation === 'update'
    );
    expect(update?.payload).toMatchObject({
      current_status: 'Case Was Received',
    });
    expect(update?.payload).not.toHaveProperty('free_visible_status');
    expect(mocks.queries.some((q) => q.table === 'email_queue')).toBe(false);
  });

  it('scopes persisted USCIS failures to the same owned row', async () => {
    vi.stubEnv('USCIS_MOCK', 'false');
    mocks.fetchCaseStatus.mockResolvedValue({
      success: false,
      error: {
        code: 503,
        userMessage: 'USCIS is temporarily unavailable.',
        details: 'upstream unavailable',
      },
    });

    const response = await POST(
      new NextRequest('http://localhost/api/case-status/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': 'test-secret',
          'X-Force-Refresh': 'true',
        },
        body: JSON.stringify({
          receipt_number: 'IOE9822487119',
          user_id: 'user-a',
        }),
      })
    );

    expect(response.status).toBe(503);
    const caseUpdates = mocks.queries.filter(
      (query) => query.table === 'case_status' && query.operation === 'update'
    );
    expect(caseUpdates).toHaveLength(1);
    expect(caseUpdates[0]?.filters).toEqual(
      expect.arrayContaining([
        ['id', 'case-row-a'],
        ['user_id', 'user-a'],
      ])
    );
  });
  it('discards a live USCIS result after the user removes the case', async () => {
    vi.stubEnv('USCIS_MOCK', 'false');
    mocks.fetchCaseStatus.mockImplementation(async () => {
      mocks.removedAfterFetch = true;
      return {
        success: true,
        data: {
          status: 'Case Was Approved',
          description: 'Private status',
          histCaseStatus: [],
        },
      };
    });
    const response = await POST(
      new NextRequest('http://localhost/api/case-status/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': 'test-secret',
          'X-Force-Refresh': 'true',
        },
        body: JSON.stringify({
          receipt_number: 'IOE9822487119',
          user_id: 'user-a',
        }),
      })
    );
    expect(await response.json()).toEqual({
      ok: true,
      skipped: true,
      reason: 'Tracking removed',
    });
    expect(
      mocks.queries.filter(
        (query) => query.operation === 'update' || query.operation === 'insert'
      )
    ).toEqual([]);
  });
});

it('daily sync persists free data without changing the free display snapshot', async () => {
  mocks.queries.length = 0;
  mocks.removedAfterFetch = false;
  vi.stubEnv('USCIS_MOCK', 'false');
  vi.stubEnv('CRON_SECRET', 'test-secret');
  mocks.fetchCaseStatus.mockResolvedValue({
    success: true,
    data: {
      status: 'Case Was Approved',
      description: 'Approved',
      caseType: 'I-765',
      receivedDate: null,
      histCaseStatus: [],
    },
  });
  const response = await POST(
    new NextRequest('http://localhost/api/case-status/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': 'test-secret',
        'X-Force-Refresh': 'true',
        'X-Check-Trigger': 'daily',
      },
      body: JSON.stringify({
        receipt_number: 'IOE0000000001',
        user_id: 'user-a',
      }),
    })
  );
  expect(response.status).toBe(200);
  const updates = mocks.queries.filter(
    (q) => q.table === 'case_status' && q.operation === 'update'
  );
  expect(updates).toHaveLength(1);
  expect(updates[0]?.payload?.current_status).toBe('Case Was Approved');
  expect(updates[0]?.payload).not.toHaveProperty('free_visible_status');
});
