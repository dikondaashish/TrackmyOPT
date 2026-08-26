import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

type QueryRecord = {
  table: string;
  operation?: 'select' | 'update' | 'insert';
  filters: Array<[string, unknown]>;
};

const mocks = vi.hoisted(() => ({
  queries: [] as QueryRecord[],
  fetchCaseStatus: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from(table: string) {
      const record: QueryRecord = { table, filters: [] };
      mocks.queries.push(record);

      const query = {
        select() {
          record.operation = 'select';
          return query;
        },
        update() {
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
          data: { id: 'case-row-a', user_id: 'user-a', current_status: null },
          error: null,
        }),
        single: async () => ({
          data:
            table === 'profiles'
              ? { premium_status: false }
              : { id: 'case-row-a', user_id: 'user-a', current_status: null },
          error: null,
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
    vi.stubEnv('CRON_SECRET', 'test-secret');
    vi.stubEnv('USCIS_MOCK', 'true');
    vi.stubEnv('VERCEL_ENV', 'development');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('updates only the enrolled user\'s exact case row when receipt numbers are shared', async () => {
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

    expect(response.status).toBe(400);
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
});
