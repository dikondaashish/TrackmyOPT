import { ConfigService } from '@nestjs/config';
import type { Job } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisProcessor, buildStatusHistoryFromUscis } from './uscis.processor';
import type { UscisService } from './uscis.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

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
