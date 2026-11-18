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
  /** Stored status and email switch of the enrolled case row. */
  storedStatus: null as string | null,
  notificationsEnabled: true,
  premium: false,
  freeNotice: vi.fn(),
  rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
}));

vi.mock('@/lib/notifications/transactional/case-updates', () => ({
  sendFreeCaseUpdateEmail: mocks.freeNotice,
}));
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: vi.fn() }));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    rpc: mocks.rpc,
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
                : { premium_status: mocks.premium }
              : {
                  id: 'case-row-a',
                  user_id: 'user-a',
                  current_status: mocks.storedStatus,
                  notifications_enabled: mocks.notificationsEnabled,
                },
          error: null,
        }),
        single: async () => ({
          data:
            (mocks.removedAfterFetch && table === 'case_status') ||
            (mocks.profileMissing && table === 'profiles')
              ? null
              : table === 'profiles'
                ? { premium_status: mocks.premium }
                : {
                    id: 'case-row-a',
                    user_id: 'user-a',
                    current_status: mocks.storedStatus,
                    notifications_enabled: mocks.notificationsEnabled,
                  },
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
    mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
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
    expect(mocks.rpc).not.toHaveBeenCalled();

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
    expect(mocks.rpc).toHaveBeenCalledWith(
      'record_opt_case_observation',
      expect.objectContaining({
        p_case_id: 'case-row-a',
        p_provider: expect.objectContaining({
          status: 'Case Was Received',
          events: [],
        }),
      })
    );
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

it('does not claim success when immutable observation persistence fails', async () => {
  mocks.queries.length = 0;
  mocks.removedAfterFetch = false;
  vi.stubEnv('USCIS_MOCK', 'false');
  vi.stubEnv('CRON_SECRET', 'test-secret');
  mocks.fetchCaseStatus.mockResolvedValue({
    success: true,
    data: {
      status: 'Case Was Received',
      description: '',
      caseType: 'I-765',
      receivedDate: null,
      histCaseStatus: [],
    },
  });
  mocks.rpc.mockResolvedValueOnce({
    data: null,
    error: { message: 'private database detail' },
  });
  const diagnostic = vi.spyOn(console, 'error').mockImplementation(() => {});
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
  expect(response.status).toBe(500);
  expect(
    mocks.queries.some(
      (q) => q.table === 'case_status' && q.operation === 'update'
    )
  ).toBe(false);
  expect(JSON.stringify(diagnostic.mock.calls)).not.toContain(
    'private database detail'
  );
  diagnostic.mockRestore();
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

describe('Free case update email', () => {
  const check = (trigger: 'daily' | 'manual') =>
    POST(
      new NextRequest('https://example.test/api/case-status/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Secret': 'test-secret',
          'X-Force-Refresh': 'true',
          ...(trigger === 'daily' ? { 'X-Check-Trigger': 'daily' } : {}),
        },
        body: JSON.stringify({
          receipt_number: 'IOE0000000001',
          user_id: 'user-a',
        }),
      })
    );

  beforeEach(() => {
    mocks.queries.length = 0;
    mocks.removedAfterFetch = false;
    mocks.profileMissing = false;
    mocks.storedStatus = 'Case Was Received';
    mocks.notificationsEnabled = true;
    mocks.premium = false;
    mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
    mocks.freeNotice
      .mockReset()
      .mockResolvedValue({ ok: true, skipped: false, queueId: 'q1' });
    vi.stubEnv('CRON_SECRET', 'test-secret');
    vi.stubEnv('USCIS_MOCK', 'false');
    mocks.fetchCaseStatus.mockReset().mockResolvedValue({
      success: true,
      data: {
        receiptNumber: 'IOE0000000001',
        status: 'Case Was Approved',
        description: 'Approved.',
        caseType: 'I-765',
        receivedDate: null,
        histCaseStatus: [],
      },
    });
  });
  afterEach(() => {
    mocks.storedStatus = null;
    vi.unstubAllEnvs();
  });

  it('tells a Free account when a scheduled check finds a new status', async () => {
    expect((await check('daily')).status).toBe(200);
    expect(mocks.freeNotice).toHaveBeenCalledTimes(1);
    expect(mocks.freeNotice).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-a', caseId: 'case-row-a' })
    );
  });

  it('stays quiet on a manual refresh, an unchanged status, or with case emails off', async () => {
    await check('manual');
    mocks.storedStatus = 'Case Was Approved';
    await check('daily');
    mocks.storedStatus = 'Case Was Received';
    mocks.notificationsEnabled = false;
    await check('daily');
    expect(mocks.freeNotice).not.toHaveBeenCalled();
  });

  it('does not let a failed notice fail the check', async () => {
    mocks.freeNotice.mockRejectedValue(new Error('smtp down'));
    expect((await check('daily')).status).toBe(200);
    mocks.freeNotice.mockResolvedValue({ ok: false, error: 'lookup_failed' });
    expect((await check('daily')).status).toBe(200);
  });
});
