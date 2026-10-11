import { ConfigService } from '@nestjs/config';
import type { Job } from 'bull';
import { createClient } from '@supabase/supabase-js';
import { UscisProcessor, buildStatusHistoryFromUscis } from './uscis.processor';
import type { UscisService } from './uscis.service';
import { reportPendingCaseEnrollmentFailure } from './pending-case-enrollment-observability';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));
jest.mock('./pending-case-enrollment-observability', () => ({
  reportPendingCaseEnrollmentFailure: jest.fn().mockResolvedValue(true),
}));

it('rejects checks during an outage instead of silently marking skipped jobs successful', async () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest
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

it('drops a result when deletion removes the exact case before persistence', async () => {
  const query = {
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          id: 'case-1',
          current_status: 'Case Was Received',
          change_log: [],
        },
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null }),
    single: jest.fn().mockResolvedValue({ data: { premium_status: true } }),
  };
  jest
    .mocked(createClient)
    .mockReturnValue({ from: () => query } as unknown as ReturnType<
      typeof createClient
    >);
  const service = {
    checkUSCISStatus: jest.fn().mockResolvedValue({
      status: 'Case Was Approved',
      description: '',
      histCaseStatus: [],
    }),
  };
  const processor = new UscisProcessor(
    service as unknown as UscisService,
    new ConfigService(),
  );
  const notify = jest.spyOn(
    processor as unknown as { triggerNotification: () => Promise<void> },
    'triggerNotification',
  );
  expect(
    await processor.handleCheckStatus({
      id: 'synthetic',
      data: { receiptNumber: 'IOE0000000001', userId: 'owner' },
    } as Job<{ receiptNumber: string; userId: string }>),
  ).toEqual({ skipped: true, reason: 'Tracking removed' });
  expect(query.eq).toHaveBeenCalledWith('id', 'case-1');
  expect(notify).not.toHaveBeenCalled();
});

it.each(['database-error', 'exception', 'success'])(
  'preserves the successful case result while reporting enrollment %s safely',
  async (outcome) => {
    const previous = process.env.PENDING_CASE_EMAILS_ENABLED;
    process.env.PENDING_CASE_EMAILS_ENABLED = 'true';
    jest.mocked(reportPendingCaseEnrollmentFailure).mockClear();
    try {
      const query = {
        select: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn().mockResolvedValue({
          data: {
            id: 'synthetic-case',
            current_status: 'Case Was Received',
            change_log: [],
            notifications_enabled: false,
          },
          error: null,
        }),
      };
      const rpc =
        outcome === 'exception'
          ? jest.fn().mockRejectedValue(new Error('private database details'))
          : jest.fn().mockResolvedValue({
              error:
                outcome === 'database-error'
                  ? { message: 'private database details' }
                  : null,
            });
      jest
        .mocked(createClient)
        .mockReturnValue({ from: () => query, rpc } as unknown as ReturnType<
          typeof createClient
        >);
      const processor = new UscisProcessor(
        {
          checkUSCISStatus: jest.fn().mockResolvedValue({
            status: 'Case Was Received',
            description: '',
            histCaseStatus: [],
          }),
        } as unknown as UscisService,
        new ConfigService({ CRON_SECRET: 'synthetic-test-secret' }),
      );
      const result = await processor.handleCheckStatus({
        id: 'synthetic',
        data: {
          receiptNumber: 'IOE0000000001',
          userId: 'synthetic-owner',
        },
      } as Job<{ receiptNumber: string; userId: string }>);
      expect(result).toEqual(
        expect.objectContaining({
          status: 'Case Was Received',
          changed: false,
        }),
      );
      if (outcome === 'success')
        expect(reportPendingCaseEnrollmentFailure).not.toHaveBeenCalled();
      else {
        expect(reportPendingCaseEnrollmentFailure).toHaveBeenCalledTimes(1);
        expect(reportPendingCaseEnrollmentFailure).toHaveBeenCalledWith(
          'synthetic-test-secret',
        );
      }
    } finally {
      if (previous === undefined)
        delete process.env.PENDING_CASE_EMAILS_ENABLED;
      else process.env.PENDING_CASE_EMAILS_ENABLED = previous;
    }
  },
);
