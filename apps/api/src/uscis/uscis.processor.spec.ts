import { ConfigService } from '@nestjs/config';
import type { Job } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisProcessor } from './uscis.processor';
import type { UscisService } from './uscis.service';
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));
const job = {
  id: 'daily-case-2026-10-12',
  data: { receiptNumber: 'IOE0000000001', userId: 'synthetic' },
  attemptsMade: 3,
  opts: { attempts: 3 },
} as Job<{ receiptNumber: string; userId: string }>;
function setup(state = 'queued') {
  const q = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({ data: { state }, error: null }),
  };
  jest
    .mocked(createClient)
    .mockReturnValue({ from: () => q } as unknown as ReturnType<
      typeof createClient
    >);
  const service = {
    checkUSCISStatus: jest
      .fn()
      .mockResolvedValue({ status: 'Approved', changed: true }),
  };
  const processor = new UscisProcessor(
    service as unknown as UscisService,
    new ConfigService({
      API_SECRET_KEY: 'synthetic-key',
      NEXT_PUBLIC_SITE_URL: 'https://www.trackmyopt.com',
    }),
  );
  return { q, service, processor };
}
beforeEach(() =>
  jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response),
);
afterEach(() => jest.restoreAllMocks());
it('runs daily jobs without premium gating and records actual sync completion', async () => {
  const { processor, service, q } = setup();
  expect(await processor.handleCheckStatus(job)).toMatchObject({
    status: 'Approved',
  });
  expect(service.checkUSCISStatus).toHaveBeenCalledWith(
    'IOE0000000001',
    'synthetic',
  );
  expect(q.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ state: 'succeeded' }),
  );
});
it('does not repeat a durable daily success after Redis removes its payload', async () => {
  const { processor, service, q } = setup('succeeded');
  expect(await processor.handleCheckStatus(job)).toMatchObject({
    skipped: true,
  });
  expect(service.checkUSCISStatus).not.toHaveBeenCalled();
  expect(q.update).not.toHaveBeenCalled();
});
it('cancels a removed enrollment rather than treating it as a successful status check', async () => {
  const { processor, service, q } = setup();
  service.checkUSCISStatus.mockResolvedValue({ skipped: true } as never);
  expect(await processor.handleCheckStatus(job)).toEqual({ skipped: true });
  expect(q.update).toHaveBeenLastCalledWith(
    expect.objectContaining({ state: 'cancelled' }),
  );
});
it('rejects during a sustained outage and leaves jobs available for retry', async () => {
  const { processor, service } = setup();
  service.checkUSCISStatus.mockRejectedValue(new Error('USCIS_UPSTREAM_503'));
  for (let i = 0; i < 5; i++)
    await expect(processor.handleCheckStatus(job)).rejects.toThrow('503');
  await expect(processor.handleCheckStatus(job)).rejects.toThrow(
    'USCIS_CIRCUIT_OPEN',
  );
  expect(service.checkUSCISStatus).toHaveBeenCalledTimes(5);
});
it('expected throttling does not open the outage circuit', async () => {
  const { processor, service } = setup();
  service.checkUSCISStatus.mockRejectedValue(new Error('USCIS_UPSTREAM_429'));
  for (let i = 0; i < 6; i++)
    await expect(processor.handleCheckStatus(job)).rejects.toThrow('429');
  expect(service.checkUSCISStatus).toHaveBeenCalledTimes(6);
});
it('reports exhausted unexpected failures without advancing a successful-check timestamp', async () => {
  const { processor, q } = setup();
  await processor.onFailed(job, new Error('USCIS_UPSTREAM_503'));
  const writes = q.update.mock.calls.map(
    (call: [Record<string, unknown>]) => call[0],
  );
  expect(writes.every((data) => !('last_checked_at' in data))).toBe(true);
  expect(fetch).toHaveBeenCalledWith(
    'https://www.trackmyopt.com/api/internal/case-worker-failure',
    expect.objectContaining({
      method: 'POST',
      headers: { 'x-api-key': 'synthetic-key' },
    }),
  );
  expect(JSON.stringify(jest.mocked(fetch).mock.calls)).not.toContain('IOE');
});

it('does not retry a protected or missing receipt after USCIS returns 404', async () => {
  const { processor, service } = setup();
  service.checkUSCISStatus.mockRejectedValue(new Error('USCIS_UPSTREAM_404'));
  const discard = jest.fn();
  await expect(
    processor.handleCheckStatus({ ...job, discard } as unknown as typeof job),
  ).rejects.toThrow('404');
  expect(discard).toHaveBeenCalledTimes(1);
});
