import { ConfigService } from '@nestjs/config';
import type { Job } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisProcessor, buildStatusHistoryFromUscis } from './uscis.processor';
import type { UscisService } from './uscis.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

it('rejects checks during an outage instead of silently marking skipped jobs successful', async () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest
      .fn()
      .mockResolvedValue({ data: { current_status: 'Case Was Received' } }),
  };
  jest
    .mocked(createClient)
    .mockReturnValue({ from: () => query } as unknown as ReturnType<
      typeof createClient
    >);
  const service = {
    checkUSCISStatus: jest.fn().mockRejectedValue(new Error('HTTP 503')),
  };
  const processor = new UscisProcessor(
    service as unknown as UscisService,
    new ConfigService(),
  );
  const job = {
    id: 'synthetic',
    data: { receiptNumber: 'synthetic', userId: 'synthetic' },
  } as Job<{ receiptNumber: string; userId: string }>;
  for (let i = 0; i < 5; i++)
    await expect(processor.handleCheckStatus(job)).rejects.toThrow('HTTP 503');
  await expect(processor.handleCheckStatus(job)).rejects.toThrow(
    'USCIS_CIRCUIT_OPEN',
  );
  expect(service.checkUSCISStatus).toHaveBeenCalledTimes(5);
});

it('never fabricates USCIS event dates from observation time or a previous event', () => {
  expect(
    buildStatusHistoryFromUscis(
      'Premium Processing Clock Was Started',
      '',
      [],
    )[0].date,
  ).toBe('');
  expect(
    buildStatusHistoryFromUscis('Case Was Approved', '', [
      { date: '2026-04-01', completedText: 'Case Was Received' },
    ])[0].date,
  ).toBe('');
});

it('records failure without advancing the last successful check', async () => {
  const query = {
    update: jest.fn<void, [Record<string, unknown>]>().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  };
  jest
    .mocked(createClient)
    .mockReturnValue({ from: () => query } as unknown as ReturnType<
      typeof createClient
    >);
  const processor = new UscisProcessor({} as UscisService, new ConfigService());
  await processor.onFailed(
    {
      data: { receiptNumber: 'test', userId: 'test' },
      attemptsMade: 3,
      opts: { attempts: 3 },
    } as Job<{ receiptNumber: string; userId: string }>,
    new Error('unavailable'),
  );
  const update = query.update.mock.calls[0][0];
  expect(update).not.toHaveProperty('last_checked_at');
  expect(update.last_check_failed_at).toEqual(expect.any(String));
});
