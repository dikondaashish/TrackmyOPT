import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { observeCaseWorker } from './worker-observability';
const m = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn() }));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: m.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: m.create }));
beforeEach(() => vi.clearAllMocks());
it('rejects unauthorized calls without work or database writes', async () => {
  m.auth.mockReturnValue(NextResponse.json({}, { status: 401 }));
  const run = vi.fn();
  expect(
    (
      await observeCaseWorker(
        'test',
        new NextRequest('https://example.test'),
        run
      )
    ).status
  ).toBe(401);
  expect(run).not.toHaveBeenCalled();
  expect(m.create).not.toHaveBeenCalled();
});
it('dry run bypasses all ledger writes', async () => {
  m.auth.mockReturnValue(null);
  const run = vi.fn().mockResolvedValue(NextResponse.json({ ok: true }));
  await observeCaseWorker(
    'test',
    new NextRequest('https://example.test?dry_run=1'),
    run
  );
  expect(run).toHaveBeenCalledOnce();
  expect(m.create).not.toHaveBeenCalled();
});
it('stores only numeric metrics, never private response content', async () => {
  m.auth.mockReturnValue(null);
  const q = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'run' }, error: null }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  };
  m.create.mockReturnValue({ from: () => q });
  await observeCaseWorker(
    'test',
    new NextRequest('https://example.test'),
    async () =>
      NextResponse.json(
        { ok: false, failed: 1, recipient: 'private@example.test' },
        { status: 503 }
      )
  );
  expect(q.update).toHaveBeenCalledWith(
    expect.objectContaining({ outcome: 'failed', counts: { failed: 1 } })
  );
  expect(JSON.stringify(q.update.mock.calls)).not.toContain('private');
});

it('reports partial worker failures even when the response status is 200', async () => {
  m.auth.mockReturnValue(null);
  const q = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: 'run' }, error: null }),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ error: null }),
  };
  m.create.mockReturnValue({ from: () => q });
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const response = NextResponse.json({
      failed: 2,
      recipient: 'private@example.test',
    });
    expect(
      await observeCaseWorker(
        'case-digests',
        new NextRequest('https://example.test'),
        async () => response
      )
    ).toBe(response);
    expect(log).toHaveBeenCalledWith(
      '[case-worker:case-digests] 2 worker failures'
    );
    expect(JSON.stringify(log.mock.calls)).not.toContain(
      'private@example.test'
    );
  } finally {
    log.mockRestore();
  }
});
